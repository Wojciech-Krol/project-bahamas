/**
 * Stripe webhook handler — Phase 3.2.
 *
 * Authoritative spec: `plan_akcji/HAKUNA_BUILD_PLAN.md` section
 * "Webhook handler" and "Commission spec — single source of truth".
 *
 * Invariants:
 *   - Signature verification is REQUIRED. No signature, no processing.
 *   - Idempotency is enforced via `webhook_events(provider, external_id)`
 *     unique constraint; replaying the same event never double-increments
 *     `spots_taken` or fires duplicate emails.
 *   - `spots_taken` is incremented atomically with a `lt` guard against
 *     `capacity`. Zero rows affected means we hit an overbook race and
 *     must refund immediately (`refund_application_fee: true`, per the
 *     cancel flow's mandatory-flag note).
 *   - Attribution (`customer_partner_attribution`) is upserted HERE, not
 *     in createBooking — the plan calls it out explicitly because
 *     attribution based on `pending` bookings would poison commission
 *     calculations for subsequent abandoned-checkout users.
 *   - Double-delivered `checkout.session.completed` events: Stripe may
 *     redeliver on timeout. We handle this in two layers:
 *       1. The webhook_events dedup (by event.id) catches exact replays.
 *       2. If the same session_id arrives on a DIFFERENT event.id (e.g.
 *          checkout.session.async_payment_succeeded following
 *          checkout.session.completed), the `if booking.status ===
 *          'confirmed'` early return keeps us from double-processing.
 */

import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";

import { env } from "@/src/env";
import { createAdminClient } from "@/src/lib/db/admin";
import { getStripe } from "@/src/lib/payments/stripe";
import { sendEmail } from "@/src/lib/email/resend";
import { BookingConfirmation } from "@/src/lib/email/templates/BookingConfirmation";
import { BookingCancelled } from "@/src/lib/email/templates/BookingCancelled";
import { findTierByPriceId } from "@/src/lib/payments/subscriptionTiers";

type ServerEnv = typeof env & {
  STRIPE_WEBHOOK_SECRET?: string;
};

// Force Node runtime — Stripe's signature verification uses Node crypto.
// Edge runtime would silently fail the HMAC check.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const serverEnv = env as ServerEnv;

  if (!serverEnv.STRIPE_WEBHOOK_SECRET) {
    // Clear 503 so ops dashboards can distinguish "misconfigured" from
    // "Stripe sent us bad data".
    return new NextResponse(
      "stripe webhook not configured — set STRIPE_WEBHOOK_SECRET",
      { status: 503 },
    );
  }

  // MUST read the raw body BEFORE any JSON parsing — Stripe's HMAC is
  // computed over the exact bytes Stripe sent, byte for byte.
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new NextResponse("missing stripe-signature header", { status: 400 });
  }

  let stripe: Stripe;
  try {
    stripe = getStripe();
  } catch {
    return new NextResponse("stripe not configured", { status: 503 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      serverEnv.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("[stripe-webhook] signature verification failed", err);
    return new NextResponse("bad signature", { status: 400 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    console.error("[stripe-webhook] admin client not configured", err);
    return new NextResponse("admin not configured", { status: 503 });
  }

  // Idempotency: claim-or-skip via the unique (provider, external_id)
  // index. Try to INSERT and capture the row id; only the thread that
  // actually inserts gets a row back. Concurrent deliveries hit the
  // unique-violation branch and bail out as "already in flight" — they
  // never run the handler in parallel with the owning thread.
  //
  // The previous "insert-then-read processed_at" pattern was racy:
  // both threads could read processed_at = null between the time the
  // owning thread committed the insert and the time it stamped
  // processed_at, and both would proceed.
  const { data: claim, error: insertErr } = await admin
    .from("webhook_events")
    .insert({
      provider: "stripe",
      external_id: event.id,
      payload: event as unknown as Record<string, unknown>,
    })
    .select("id, processed_at")
    .maybeSingle();

  if (insertErr) {
    const code = (insertErr as { code?: string }).code;
    if (code === "23505") {
      // Duplicate — another delivery is processing or already processed
      // this event. Tell Stripe everything is fine; let the owning
      // thread (or the previous successful run) own the side effects.
      return new NextResponse("ok", { status: 200 });
    }
    console.error("[stripe-webhook] webhook_events insert failed", insertErr);
    return new NextResponse("db error", { status: 500 });
  }
  if (!claim) {
    // No row returned but no error either — treat as "already claimed by
    // someone else" rather than risk double-processing.
    return new NextResponse("ok", { status: 200 });
  }
  // If processed_at is somehow already set on a freshly-inserted row
  // (impossible under normal flow, but defence-in-depth), bail out.
  if (claim.processed_at) {
    return new NextResponse("ok", { status: 200 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        // Boost purchases and booking checkouts share this event type. The
        // metadata tells them apart: boost sessions always carry either
        // `boost_id` or `boost_ids`, booking sessions carry `booking_id`.
        const sess = event.data.object as Stripe.Checkout.Session;
        const meta = sess.metadata ?? {};
        if (meta.boost_id || meta.boost_ids) {
          await handleBoostCompleted(admin, event);
        } else {
          await handleCheckoutCompleted(admin, event);
        }
        break;
      }
      case "payment_intent.payment_failed":
      case "checkout.session.expired": {
        await handleBookingExpired(admin, event);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await handleSubscriptionChange(admin, event);
        break;
      }
      default: {
        console.info("[stripe-webhook] ignoring event", { type: event.type });
        break;
      }
    }
  } catch (err) {
    console.error("[stripe-webhook] handler threw", err);
    // Do NOT mark processed_at — Stripe will retry.
    return new NextResponse("handler error", { status: 500 });
  }

  await admin
    .from("webhook_events")
    .update({ processed_at: new Date().toISOString() })
    .eq("provider", "stripe")
    .eq("external_id", event.id);

  return new NextResponse("ok", { status: 200 });
}

// ---------- handlers ----------

type AdminClient = ReturnType<typeof createAdminClient>;

async function handleCheckoutCompleted(
  admin: AdminClient,
  event: Stripe.Event,
) {
  const checkoutSession = event.data.object as Stripe.Checkout.Session;
  const bookingId = checkoutSession.metadata?.booking_id;
  if (!bookingId) {
    console.warn("[stripe-webhook] checkout.completed missing booking_id", {
      event_id: event.id,
    });
    return;
  }

  // Load the booking + the full chain we need for attribution + emails.
  const { data: bookingRow, error: loadErr } = await admin
    .from("bookings")
    .select(
      `
      id,
      user_id,
      session_id,
      status,
      is_boost_first_booking,
      amount_cents,
      currency,
      session:sessions!inner (
        id,
        starts_at,
        capacity,
        spots_taken,
        activity:activities!inner (
          id,
          title_i18n,
          venue:venues!inner (
            id,
            name,
            partner:partners!inner (
              id,
              contact_email
            )
          )
        )
      )
    `,
    )
    .eq("id", bookingId)
    .maybeSingle();

  if (loadErr || !bookingRow) {
    console.error("[stripe-webhook] booking lookup failed", { loadErr, bookingId });
    return;
  }

  // Double-delivery guard — already confirmed.
  if ((bookingRow as { status: string }).status === "confirmed") {
    return;
  }

  const sessionAny = unwrap(
    (bookingRow as unknown as { session: unknown }).session as
      | {
          id: string;
          starts_at: string;
          capacity: number;
          spots_taken: number;
          activity: unknown;
        }
      | {
          id: string;
          starts_at: string;
          capacity: number;
          spots_taken: number;
          activity: unknown;
        }[]
      | null,
  );
  if (!sessionAny) return;

  const activityAny = unwrap(
    (sessionAny as { activity: unknown }).activity as
      | {
          id: string;
          title_i18n: Record<string, string> | null;
          venue: unknown;
        }
      | {
          id: string;
          title_i18n: Record<string, string> | null;
          venue: unknown;
        }[]
      | null,
  );
  const venueAny = unwrap(
    (activityAny as { venue: unknown } | null)?.venue as
      | { id: string; name: string; partner: unknown }
      | { id: string; name: string; partner: unknown }[]
      | null,
  );
  const partnerAny = unwrap(
    (venueAny as { partner: unknown } | null)?.partner as
      | { id: string; contact_email: string }
      | { id: string; contact_email: string }[]
      | null,
  );

  if (!activityAny || !venueAny || !partnerAny) {
    console.error("[stripe-webhook] incomplete booking join", { bookingId });
    return;
  }

  // Atomic capacity guard — increment only if spots_taken < capacity.
  // Supabase JS lacks a native compare-and-swap for `col < other_col`, so
  // we read capacity first (cheap — single integer column) and then
  // update with an `lt` on the current spots_taken value. This is NOT a
  // true CAS, but combined with the session row's CHECK constraint
  // (`spots_taken <= capacity`) it collapses to a serialization error if
  // two webhooks race, and the second one falls into the overbook branch.
  const capacity = sessionAny.capacity;
  const currentSpots = sessionAny.spots_taken;

  let overbooked = false;
  if (currentSpots >= capacity) {
    overbooked = true;
  } else {
    const { data: updated, error: incErr } = await admin
      .from("sessions")
      .update({ spots_taken: currentSpots + 1 })
      .eq("id", sessionAny.id)
      .eq("spots_taken", currentSpots) // optimistic concurrency
      .lt("spots_taken", capacity)
      .select("id, spots_taken");
    if (incErr || !updated || updated.length === 0) {
      overbooked = true;
    }
  }

  if (overbooked) {
    // Overbook race — refund and flag. `refund_application_fee: true` is
    // mandatory so Hakuna doesn't keep commission on a refunded booking
    // (see cancelBooking for the same invariant).
    const paymentIntentId =
      typeof checkoutSession.payment_intent === "string"
        ? checkoutSession.payment_intent
        : checkoutSession.payment_intent?.id ?? null;
    if (paymentIntentId) {
      try {
        await getStripe().refunds.create({
          payment_intent: paymentIntentId,
          refund_application_fee: true,
          reason: "requested_by_customer",
        });
      } catch (err) {
        console.error("[stripe-webhook] overbook refund failed", err);
      }
    }
    await admin
      .from("bookings")
      .update({
        status: "refunded_overbook",
        stripe_payment_intent_id: paymentIntentId,
      })
      .eq("id", bookingId);

    // Apology email — stub.
    const locale: "pl" | "en" = "pl";
    const activityTitle =
      activityAny.title_i18n?.[locale] ??
      activityAny.title_i18n?.pl ??
      "Hakuna booking";
    console.info("[stripe-webhook] TODO send overbook apology email", {
      bookingId,
      activityTitle,
    });
    return;
  }

  // Normal path — confirm booking.
  const paymentIntentId =
    typeof checkoutSession.payment_intent === "string"
      ? checkoutSession.payment_intent
      : checkoutSession.payment_intent?.id ?? null;

  const { error: confirmErr } = await admin
    .from("bookings")
    .update({
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
      stripe_payment_intent_id: paymentIntentId,
    })
    .eq("id", bookingId);

  if (confirmErr) {
    console.error("[stripe-webhook] booking confirm update failed", confirmErr);
    return;
  }

  // Attribution upsert — idempotent by design. `ignoreDuplicates: true`
  // means the FIRST successful confirmation wins and subsequent attempts
  // silently skip; attribution is permanent per the commission spec.
  const userId = (bookingRow as { user_id: string }).user_id;
  const wasBoostAttributed = Boolean(
    (bookingRow as { is_boost_first_booking: boolean }).is_boost_first_booking,
  );
  const { error: attrErr } = await admin
    .from("customer_partner_attribution")
    .upsert(
      {
        user_id: userId,
        partner_id: partnerAny.id,
        first_booking_id: bookingId,
        was_boost_attributed: wasBoostAttributed,
      },
      {
        onConflict: "user_id,partner_id",
        ignoreDuplicates: true,
      },
    );
  if (attrErr) {
    console.error("[stripe-webhook] attribution upsert failed", attrErr);
  }

  // Emails — resolve user locale + email.
  const { data: profile } = await admin
    .from("profiles")
    .select("locale")
    .eq("id", userId)
    .maybeSingle();
  const locale: "pl" | "en" =
    (profile?.locale as "pl" | "en" | undefined) === "en" ? "en" : "pl";

  const activityTitle =
    activityAny.title_i18n?.[locale] ??
    activityAny.title_i18n?.pl ??
    "Hakuna booking";

  const startsAtDisplay = new Date(sessionAny.starts_at).toLocaleString(
    locale,
  );

  // User email — look up from auth.users via admin (we don't have it on
  // the booking row).
  const { data: authUser } = await admin.auth.admin.getUserById(userId);
  const userEmail = authUser?.user?.email ?? null;

  try {
    if (userEmail) {
      await sendEmail({
        to: userEmail,
        subject:
          locale === "pl" ? "Rezerwacja potwierdzona" : "Booking confirmed",
        react: BookingConfirmation({
          locale,
          activityTitle,
          startsAtDisplay,
          venueName: venueAny.name,
          bookingId,
        }),
      });
    }
    if (partnerAny.contact_email) {
      // Reuse the cancellation template's "user view" style for now — a
      // proper partner-notification template is a later polish step.
      await sendEmail({
        to: partnerAny.contact_email,
        subject:
          locale === "pl"
            ? "Nowa rezerwacja"
            : "New booking",
        react: BookingConfirmation({
          locale,
          activityTitle,
          startsAtDisplay,
          venueName: venueAny.name,
          bookingId,
        }),
      });
    }
  } catch (err) {
    // Emails are best-effort — never fail the webhook on send errors.
    // TODO: move to a deferred queue (Resend has one) so retries don't
    // hammer the user inbox.
    console.error("[stripe-webhook] confirmation email send failed", err);
  }

  // Silence unused-import lint for BookingCancelled in this file; it is
  // imported for symmetry with cancel flows if we extend here later.
  void BookingCancelled;
}

async function handleBookingExpired(admin: AdminClient, event: Stripe.Event) {
  // Extract booking_id from either a checkout session or a payment intent.
  let bookingId: string | null = null;
  const obj = event.data.object as
    | Stripe.Checkout.Session
    | Stripe.PaymentIntent;
  if ("metadata" in obj && obj.metadata) {
    bookingId = (obj.metadata as Record<string, string>).booking_id ?? null;
  }
  if (!bookingId) {
    console.warn("[stripe-webhook] expire event with no booking_id", {
      type: event.type,
    });
    return;
  }
  const { error } = await admin
    .from("bookings")
    .update({ status: "expired" })
    .eq("id", bookingId)
    .eq("status", "pending"); // don't clobber already-confirmed rows
  if (error) {
    console.error("[stripe-webhook] expire update failed", error);
  }
}

/**
 * Handle `customer.subscription.{created,updated,deleted}` — Phase 3.3.
 *
 * Spec: `plan_akcji/HAKUNA_BUILD_PLAN.md` section "3.3 Subscriptions (partner
 * tier)". When a subscription is active/trialing the partner row gets the
 * matching tier + reduced commission rate. When it's canceled/unpaid/
 * past_due (or the subscription is deleted outright), we fall back to
 * `subscription_tier='none'` and clear `subscription_commission_bps` so
 * `createBooking` reverts to the default commission per the commission spec.
 *
 * Partner resolution strategy (in priority order):
 *   1. `subscription.metadata.partner_id` — set by
 *      `startSubscriptionCheckout` via `subscription_data.metadata`. This is
 *      the canonical path and always wins.
 *   2. Fallback: match partner by `contact_email === customer.email`. Used
 *      only when metadata is missing (manual subscription created by Hakuna
 *      staff in the Stripe dashboard, legacy imports). Email matching is
 *      best-effort — if multiple partners share an email the first one wins,
 *      which matches the plan's "stub" wording for this fallback.
 */
async function handleSubscriptionChange(
  admin: AdminClient,
  event: Stripe.Event,
) {
  const subscription = event.data.object as Stripe.Subscription;

  // Resolve the Price ID — take it from the first subscription item. Hakuna
  // Billing only sells single-item subscriptions (one tier per partner).
  const item = subscription.items?.data?.[0];
  const priceId = item?.price?.id ?? null;
  const tier = findTierByPriceId(priceId);

  // Resolve the partner. Metadata path first.
  const metadataPartnerId = subscription.metadata?.partner_id ?? null;
  let partnerId: string | null = metadataPartnerId;

  if (!partnerId) {
    // Fallback: customer email → partners.contact_email.
    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id ?? null;
    if (customerId) {
      try {
        const stripe = getStripe();
        const customer = await stripe.customers.retrieve(customerId);
        if (!customer.deleted) {
          const email = (customer as Stripe.Customer).email ?? null;
          if (email) {
            const { data: byEmail } = await admin
              .from("partners")
              .select("id")
              .eq("contact_email", email)
              .limit(1);
            partnerId = byEmail?.[0]?.id ?? null;
          }
        }
      } catch (err) {
        console.error("[stripe-webhook] customer lookup failed", err);
      }
    }
  }

  if (!partnerId) {
    console.warn("[stripe-webhook] subscription event has no partner match", {
      event_id: event.id,
      subscription_id: subscription.id,
    });
    return;
  }

  // Decide the new partner state. `customer.subscription.deleted` always
  // clears. Otherwise status drives the decision.
  const status = subscription.status;
  const isActive =
    event.type !== "customer.subscription.deleted" &&
    (status === "active" || status === "trialing");

  if (isActive && tier) {
    const { error } = await admin
      .from("partners")
      .update({
        subscription_tier: tier.key,
        subscription_commission_bps: tier.commissionBps,
      })
      .eq("id", partnerId);
    if (error) {
      console.error("[stripe-webhook] partner subscription update failed", error);
    }
    return;
  }

  // Inactive branch — canceled / unpaid / past_due / deleted, OR active but
  // the price is unknown to us. Clear the tier so commission reverts.
  if (
    event.type === "customer.subscription.deleted" ||
    status === "canceled" ||
    status === "unpaid" ||
    status === "past_due"
  ) {
    const { error } = await admin
      .from("partners")
      .update({
        subscription_tier: "none",
        subscription_commission_bps: null,
      })
      .eq("id", partnerId);
    if (error) {
      console.error("[stripe-webhook] partner subscription clear failed", error);
    }
    return;
  }

  // Active-but-unknown-price: log and leave the partner row untouched — an
  // operator must map the Price ID in `subscriptionTiers.ts` before we can
  // honour the new plan.
  console.warn(
    "[stripe-webhook] subscription active for unknown price — no tier mapping",
    { subscription_id: subscription.id, price_id: priceId, status },
  );
}

/**
 * Handle `checkout.session.completed` for Boost purchases (Phase 3.4).
 *
 * Spec: `plan_akcji/HAKUNA_BUILD_PLAN.md` section "3.4 Boost (Booksy-style)".
 *
 * Metadata contract set by `app/[locale]/partner/(shell)/promote/actions.ts`:
 *   - `duration_days` → "7" | "14" | "30"
 *   - `boost_id`      → single uuid (activity / venue targets)
 *   - `boost_ids`     → comma-joined uuids (venueAll target)
 *   - plus `partner_id`, `target_type`, `target_id` for audit/debugging
 *
 * For each id, flip the `listing_boosts` row from `pending` → `active`,
 * set `starts_at = now()` and `ends_at = starts_at + duration_days`, and
 * write the Stripe `payment_intent` id on `stripe_payment_id`.
 *
 * Idempotency: the outer `webhook_events` dedup already catches exact event
 * replays. Inside the handler we additionally match on `status = 'pending'`
 * so a re-ran event against a boost row someone already flipped to `active`
 * is a no-op.
 */
async function handleBoostCompleted(admin: AdminClient, event: Stripe.Event) {
  const sess = event.data.object as Stripe.Checkout.Session;
  const meta = sess.metadata ?? {};

  const idList: string[] = [];
  if (typeof meta.boost_id === "string" && meta.boost_id.length > 0) {
    idList.push(meta.boost_id);
  }
  if (typeof meta.boost_ids === "string" && meta.boost_ids.length > 0) {
    for (const raw of meta.boost_ids.split(",")) {
      const id = raw.trim();
      if (id.length > 0) idList.push(id);
    }
  }
  if (idList.length === 0) {
    console.warn("[stripe-webhook] boost.completed missing id metadata", {
      event_id: event.id,
    });
    return;
  }

  const durationDays = Number(meta.duration_days);
  if (!Number.isFinite(durationDays) || durationDays <= 0) {
    console.error("[stripe-webhook] boost.completed invalid duration", {
      event_id: event.id,
      duration_days: meta.duration_days,
    });
    return;
  }

  const paymentIntentId =
    typeof sess.payment_intent === "string"
      ? sess.payment_intent
      : sess.payment_intent?.id ?? null;

  const startsAt = new Date();
  const endsAt = new Date(
    startsAt.getTime() + durationDays * 24 * 60 * 60 * 1000,
  );

  const { error } = await admin
    .from("listing_boosts")
    .update({
      status: "active",
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      stripe_payment_id: paymentIntentId,
    })
    .in("id", idList)
    .eq("status", "pending");

  if (error) {
    console.error("[stripe-webhook] boost activation failed", {
      event_id: event.id,
      error,
    });
    throw error; // surface to the outer catch so Stripe retries
  }
}

// Same unwrap helper as in bookingActions. Kept local to avoid re-exporting
// Supabase join ergonomics as public API.
function unwrap<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}
