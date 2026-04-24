"use server";

/**
 * Phase 3.2 — booking flow Server Actions.
 *
 * Authoritative spec: `plan_akcji/HAKUNA_BUILD_PLAN.md` sections
 *   - "Phase 3.2 Booking flow" (createBooking)
 *   - "Webhook handler" (see app/api/webhooks/stripe/route.ts)
 *   - "Cancellation"
 *   - "Commission spec — single source of truth"
 *
 * Invariants:
 *   - Commission math lives in `./commission.ts` — use as-is, never
 *     reimplement.
 *   - `bookings` rows are inserted via the admin (service-role) client. The
 *     public RLS policy has no INSERT for anon/authenticated — the plan is
 *     explicit: "the client never inserts bookings directly".
 *   - `customer_partner_attribution` is written on `checkout.session.completed`
 *     in the webhook handler, NOT at booking creation. Attribution must only
 *     materialise once payment succeeds — otherwise abandoned checkouts would
 *     poison the attribution record and flip every future booking from the
 *     same user to "returning customer" pricing.
 *   - `currency` is read per-activity (`activities.currency`) — bookings
 *     inherit the activity currency verbatim.
 *   - External call failures roll the booking row to `status='expired'` so a
 *     failed createBooking never leaves a pending row with no checkout
 *     session.
 */

import { headers } from "next/headers";

import { createClient, getCurrentUser } from "@/src/lib/db/server";
import { createAdminClient } from "@/src/lib/db/admin";
import { getStripe } from "@/src/lib/payments/stripe";
import { computeCommission } from "@/src/lib/payments/commission";
import { sendEmail } from "@/src/lib/email/resend";
import { BookingCancelled } from "@/src/lib/email/templates/BookingCancelled";

// ---------- local types (intentionally NOT exported) ----------

type SessionRow = {
  id: string;
  starts_at: string;
  capacity: number;
  spots_taken: number;
  status: string;
  activity: ActivityRow | ActivityRow[] | null;
};

type ActivityRow = {
  id: string;
  title_i18n: Record<string, string> | null;
  price_cents: number;
  currency: string;
  venue: VenueRow | VenueRow[] | null;
};

type VenueRow = {
  id: string;
  name: string;
  partner: PartnerRow | PartnerRow[] | null;
};

type PartnerRow = {
  id: string;
  commission_rate_bps: number;
  subscription_tier: string | null;
  subscription_commission_bps: number | null;
  stripe_account_id: string | null;
};

type BookingRow = {
  id: string;
  user_id: string;
  session_id: string;
  amount_cents: number;
  currency: string;
  status: string;
  stripe_payment_intent_id: string | null;
};

// Supabase returns nested relationships as either an object or an array
// depending on the shape of the FK chain. Normalise.
function unwrap<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

// ---------- error helpers ----------

type CreateBookingResult =
  | { ok: true; checkoutUrl: string }
  | { error: string };

function isNotConfigured(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("Supabase is not configured") ||
    msg.includes("Supabase admin client is not configured") ||
    msg.includes("Stripe is not configured")
  );
}

// ---------- createBooking ----------

export async function createBooking(
  sessionId: string,
): Promise<CreateBookingResult> {
  // 1. Auth — anonymous users can't book.
  let currentUser;
  try {
    currentUser = await getCurrentUser();
  } catch (err) {
    if (isNotConfigured(err)) {
      console.warn("[createBooking] Supabase not configured; noop.");
      return { error: "not_configured" };
    }
    console.error("[createBooking] auth failed", err);
    return { error: "internal" };
  }
  if (!currentUser) return { error: "not_signed_in" };

  // 2. Load session + activity + venue + partner via the REQUEST-SCOPED
  //    client. RLS allows the anon/user role to see sessions whose parent
  //    activity is published — that is the exact discovery guarantee the
  //    booker needs. Using the user-scoped client means we inherit the
  //    user's visibility rules; a session the user can't see, they can't
  //    book.
  let supabase;
  try {
    supabase = await createClient();
  } catch (err) {
    if (isNotConfigured(err)) {
      console.warn("[createBooking] Supabase not configured; noop.");
      return { error: "not_configured" };
    }
    throw err;
  }

  const { data: sessionRaw, error: sessionErr } = await supabase
    .from("sessions")
    .select(
      `
      id,
      starts_at,
      capacity,
      spots_taken,
      status,
      activity:activities!inner (
        id,
        title_i18n,
        price_cents,
        currency,
        venue:venues!inner (
          id,
          name,
          partner:partners!inner (
            id,
            commission_rate_bps,
            subscription_tier,
            subscription_commission_bps,
            stripe_account_id
          )
        )
      )
    `,
    )
    .eq("id", sessionId)
    .maybeSingle();

  if (sessionErr) {
    console.error("[createBooking] session lookup failed", sessionErr);
    return { error: "internal" };
  }
  const session = sessionRaw as SessionRow | null;
  if (!session) return { error: "session_not_found" };

  const activity = unwrap(session.activity);
  if (!activity) return { error: "session_not_found" };
  const venue = unwrap(activity.venue);
  if (!venue) return { error: "session_not_found" };
  const partner = unwrap(venue.partner);
  if (!partner) return { error: "session_not_found" };

  // Eligibility checks.
  if (!partner.stripe_account_id) {
    return { error: "partner_not_connected" };
  }
  if (session.status !== "scheduled") return { error: "session_not_bookable" };
  if (new Date(session.starts_at).getTime() <= Date.now()) {
    return { error: "session_in_past" };
  }
  if (session.spots_taken >= session.capacity) {
    return { error: "session_full" };
  }

  // Admin client — used for attribution lookup (RLS on attribution would
  // return the user's own row only, which is what we need, but we still
  // use admin for the later booking insert so use it consistently here).
  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    if (isNotConfigured(err)) {
      console.warn("[createBooking] Admin client not configured; noop.");
      return { error: "not_configured" };
    }
    throw err;
  }

  // 3. Attribution lookup — (user, partner).
  const { data: attributionRow, error: attrErr } = await admin
    .from("customer_partner_attribution")
    .select("user_id, partner_id, was_boost_attributed")
    .eq("user_id", currentUser.user.id)
    .eq("partner_id", partner.id)
    .maybeSingle();

  if (attrErr) {
    console.error("[createBooking] attribution lookup failed", attrErr);
    return { error: "internal" };
  }

  // 4. Active boost lookup — partner's boost active NOW that targets this
  //    session's activity OR its parent venue OR is venue-wide (null venue).
  const nowIso = new Date().toISOString();
  const { data: boostRows, error: boostErr } = await admin
    .from("listing_boosts")
    .select("id, activity_id, venue_id, starts_at, ends_at, status")
    .eq("partner_id", partner.id)
    .eq("status", "active")
    .lte("starts_at", nowIso)
    .gte("ends_at", nowIso);

  if (boostErr) {
    console.error("[createBooking] boost lookup failed", boostErr);
    return { error: "internal" };
  }

  const activeBoost = (boostRows ?? []).find((b) => {
    // activity-specific boost
    if (b.activity_id === activity.id) return true;
    // venue-specific boost
    if (b.venue_id === venue.id) return true;
    // partner-wide boost: both activity_id and venue_id null. Note: the
    // 0002 migration's XOR constraint requires exactly one of activity_id /
    // venue_id to be set, so "venue_id IS NULL AND activity_id IS NULL"
    // would violate that constraint and never actually appear in the row.
    // We still honour the spec's "(activity_id = a OR venue_id = v OR
    // venue_id IS NULL)" OR-clause here for forward compatibility if the
    // constraint is ever relaxed for partner-wide boosts.
    if (b.venue_id === null && b.activity_id === null) return true;
    return false;
  }) ?? null;

  // 6. Subscription detection. Per spec: "subscription_tier !== 'none' &&
  //    subscription_tier != null".
  const hasActiveSubscription =
    partner.subscription_tier != null && partner.subscription_tier !== "none";

  // 7. Commission computation — pure function from commission.ts.
  const commission = computeCommission({
    basePriceCents: activity.price_cents,
    partner: {
      commissionRateBps: partner.commission_rate_bps,
      subscriptionCommissionBps: partner.subscription_commission_bps,
      hasActiveSubscription,
    },
    customer: {
      attribution: attributionRow
        ? { wasBoostAttributed: attributionRow.was_boost_attributed }
        : null,
    },
    boost: {
      activeOnSession: activeBoost !== null,
    },
  });

  // 8. Insert the booking row via the admin client. The booking is born
  //    `pending` — the webhook flips it to `confirmed` on successful
  //    payment.
  const { data: inserted, error: insertErr } = await admin
    .from("bookings")
    .insert({
      session_id: session.id,
      user_id: currentUser.user.id,
      amount_cents: activity.price_cents,
      currency: activity.currency,
      commission_bps: commission.commissionBps,
      commission_cents: commission.commissionCents,
      is_boost_first_booking: commission.isBoostFirstBooking,
      boost_commission_bps: commission.boostCommissionBps,
      boost_id: activeBoost?.id ?? null,
      status: "pending",
    })
    .select("id")
    .single();

  if (insertErr || !inserted) {
    console.error("[createBooking] booking insert failed", insertErr);
    return { error: "internal" };
  }
  const bookingId = inserted.id as string;

  // 9. Stripe Checkout. On ANY external failure from here on, roll the
  //    booking row back to `expired` so we don't leave a dangling pending.
  try {
    const stripe = getStripe();

    // Locale — user profile wins, fall back to 'pl' per plan.
    const locale =
      (currentUser.profile?.locale as string | undefined) ?? "pl";
    const stripeLocale: "pl" | "en" =
      locale === "en" ? "en" : "pl";

    // Compose the origin. Prefer the request's own host so dev + preview
    // deploys don't all redirect to production.
    const h = await headers();
    const proto = h.get("x-forwarded-proto") ?? "https";
    const host = h.get("x-forwarded-host") ?? h.get("host") ?? "hakuna.app";
    const origin = `${proto}://${host}`;

    // Product name — pick a locale-appropriate title from title_i18n.
    const productName =
      activity.title_i18n?.[locale] ??
      activity.title_i18n?.pl ??
      activity.title_i18n?.en ??
      "Hakuna booking";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "blik", "p24"],
      locale: stripeLocale,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: activity.currency.toLowerCase(),
            unit_amount: activity.price_cents,
            product_data: {
              name: productName,
            },
          },
        },
      ],
      payment_intent_data: {
        application_fee_amount: commission.commissionCents,
        transfer_data: {
          destination: partner.stripe_account_id,
        },
      },
      metadata: {
        booking_id: bookingId,
      },
      success_url: `${origin}/${locale}/bookings/${bookingId}?checkout=success`,
      cancel_url: `${origin}/${locale}/bookings/${bookingId}?checkout=cancelled`,
    });

    // 10. Attach the Checkout session id to the booking row.
    const { error: updateErr } = await admin
      .from("bookings")
      .update({ stripe_checkout_id: checkoutSession.id })
      .eq("id", bookingId);

    if (updateErr) {
      console.error(
        "[createBooking] failed to attach checkout id — rolling booking back",
        updateErr,
      );
      await admin
        .from("bookings")
        .update({ status: "expired" })
        .eq("id", bookingId);
      return { error: "internal" };
    }

    if (!checkoutSession.url) {
      await admin
        .from("bookings")
        .update({ status: "expired" })
        .eq("id", bookingId);
      return { error: "internal" };
    }

    return { ok: true, checkoutUrl: checkoutSession.url };
  } catch (err) {
    if (isNotConfigured(err)) {
      console.warn(
        "[createBooking] Stripe not configured; rolling booking back.",
      );
      await admin
        .from("bookings")
        .update({ status: "expired" })
        .eq("id", bookingId);
      return { error: "not_configured" };
    }
    console.error("[createBooking] stripe checkout failed", err);
    await admin
      .from("bookings")
      .update({ status: "expired" })
      .eq("id", bookingId);
    return { error: "internal" };
  }
}

// ---------- cancelBooking ----------

type CancelBookingResult = { ok: true } | { error: string };

export async function cancelBooking(
  bookingId: string,
): Promise<CancelBookingResult> {
  let currentUser;
  try {
    currentUser = await getCurrentUser();
  } catch (err) {
    if (isNotConfigured(err)) {
      console.warn("[cancelBooking] Supabase not configured; noop.");
      return { error: "not_configured" };
    }
    throw err;
  }
  if (!currentUser) return { error: "not_signed_in" };

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    if (isNotConfigured(err)) {
      console.warn("[cancelBooking] Admin client not configured; noop.");
      return { error: "not_configured" };
    }
    throw err;
  }

  // Load booking + joined session.
  const { data: row, error: loadErr } = await admin
    .from("bookings")
    .select(
      `
      id,
      user_id,
      session_id,
      status,
      stripe_payment_intent_id,
      session:sessions!inner (
        id,
        starts_at,
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

  if (loadErr || !row) {
    console.error("[cancelBooking] load failed", loadErr);
    return { error: "not_found" };
  }

  // Authorization: only the booker can cancel their own booking.
  if ((row as { user_id: string }).user_id !== currentUser.user.id) {
    return { error: "forbidden" };
  }
  if ((row as { status: string }).status !== "confirmed") {
    return { error: "not_cancellable" };
  }

  // Typed navigation through nested joins.
  const sessionRow = unwrap(
    (row as unknown as { session: unknown }).session as
      | {
          id: string;
          starts_at: string;
          spots_taken: number;
          activity: unknown;
        }
      | { id: string; starts_at: string; spots_taken: number; activity: unknown }[]
      | null,
  );
  if (!sessionRow) return { error: "not_found" };

  // 48-hour rule — per ToS, cancellations less than 48h from start are not
  // self-service.
  const startsAt = new Date(sessionRow.starts_at).getTime();
  const cutoff = Date.now() + 48 * 60 * 60 * 1000;
  if (startsAt < cutoff) {
    return { error: "too_late" };
  }

  const paymentIntentId = (row as { stripe_payment_intent_id: string | null })
    .stripe_payment_intent_id;
  if (!paymentIntentId) {
    // Confirmed booking with no payment intent would be a data-integrity
    // bug; refuse to proceed rather than silently skipping the refund.
    console.error(
      "[cancelBooking] confirmed booking has no stripe_payment_intent_id",
      { bookingId },
    );
    return { error: "internal" };
  }

  // Stripe refund. `refund_application_fee: true` is MANDATORY per the
  // plan — without it Hakuna keeps the commission on a refunded booking,
  // which is both unethical and a guaranteed support complaint.
  try {
    const stripe = getStripe();
    await stripe.refunds.create({
      payment_intent: paymentIntentId,
      refund_application_fee: true,
    });
  } catch (err) {
    if (isNotConfigured(err)) {
      return { error: "not_configured" };
    }
    console.error("[cancelBooking] stripe refund failed", err);
    return { error: "refund_failed" };
  }

  // Decrement spots_taken atomically via the SQL helper from migration
  // 0008. The helper clamps at zero, so concurrent cancels can't drive
  // the counter negative. Previous read-then-write pattern lost
  // decrements under races (two cancels each reading N → both writing
  // N-1 → counter ends one too high).
  const { error: decErr } = await admin.rpc("decrement_spots", {
    s_id: sessionRow.id,
  });
  if (decErr) {
    // Refund already went through — don't fail the whole cancel here.
    // Operator gets a Sentry hit; in the meantime the session row's
    // counter is mildly stale and the next confirmation/expiry will
    // eventually self-correct via the same helper.
    console.error("[cancelBooking] spots_taken decrement failed", decErr);
  }

  // Flip booking status.
  const { error: bookingUpdateErr } = await admin
    .from("bookings")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  if (bookingUpdateErr) {
    console.error("[cancelBooking] booking status update failed", bookingUpdateErr);
    return { error: "internal" };
  }

  // Fire emails. Stubs OK — the Resend client already no-ops without API
  // key configured. Both sides.
  const activityRow = unwrap(
    (sessionRow as { activity: unknown }).activity as
      | { title_i18n: Record<string, string> | null; venue: unknown }
      | { title_i18n: Record<string, string> | null; venue: unknown }[]
      | null,
  );
  const venueRow = unwrap(
    (activityRow as { venue: unknown } | null)?.venue as
      | { name: string; partner: unknown }
      | { name: string; partner: unknown }[]
      | null,
  );
  const partnerRow = unwrap(
    (venueRow as { partner: unknown } | null)?.partner as
      | { contact_email: string }
      | { contact_email: string }[]
      | null,
  );

  const locale =
    (currentUser.profile?.locale as "pl" | "en" | undefined) ?? "pl";
  const activityTitle =
    activityRow?.title_i18n?.[locale] ??
    activityRow?.title_i18n?.pl ??
    "Hakuna booking";

  const userEmail = currentUser.user.email;
  try {
    if (userEmail) {
      await sendEmail({
        to: userEmail,
        subject:
          locale === "pl" ? "Rezerwacja anulowana" : "Booking cancelled",
        react: BookingCancelled({
          locale,
          activityTitle,
          bookingId,
          audience: "user",
        }),
      });
    }
    if (partnerRow?.contact_email) {
      await sendEmail({
        to: partnerRow.contact_email,
        subject:
          locale === "pl"
            ? "Klient anulował rezerwację"
            : "A customer cancelled a booking",
        react: BookingCancelled({
          locale,
          activityTitle,
          bookingId,
          audience: "partner",
        }),
      });
    }
  } catch (err) {
    // Email failures must not roll back the refund; log and proceed.
    console.error("[cancelBooking] email send failed", err);
  }

  return { ok: true };
}

export type { BookingRow };
