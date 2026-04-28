"use server";

/**
 * Partner → Promote (Boost) Server Actions.
 *
 * Spec: `plan_akcji/HAKUNA_BUILD_PLAN.md` section 3.4 "Boost (Booksy-style)".
 *
 * Flow:
 *   1. Guard: signed in + partner member, re-resolve the partner server-side
 *      (we never trust a partner id supplied by the client).
 *   2. Validate inputs with Zod (`target_type` enum, uuid, duration in [7,14,30]).
 *   3. Insert PENDING `listing_boosts` row(s). `starts_at` is a placeholder
 *      (set to `now()` at insert time, rewritten to `now()` by the webhook
 *      on successful payment). `ends_at` is set so the row is internally
 *      consistent even pre-payment; the webhook recomputes it from the
 *      confirmation time.
 *   4. Stripe Checkout Session (`mode: 'payment'`, PLN, card/blik/p24).
 *      Metadata carries every boost id we just inserted so the webhook can
 *      flip them to `active` in one shot (important for `venueAll`, where
 *      we insert one pending row per venue to stay inside the 0002 XOR
 *      constraint: exactly one of activity_id / venue_id must be set).
 *   5. `redirect(session.url)` — terminal.
 *
 * Pricing is hardcoded in `DURATION_PRICES_CENTS` below. Hakuna keeps 100%
 * of the boost revenue (platform charge), so there is NO `transfer_data` on
 * the checkout session — this is NOT a Connect charge.
 */

import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentUser, createClient } from "@/src/lib/db/server";
import { createAdminClient } from "@/src/lib/db/admin";
import { getStripe } from "@/src/lib/payments/stripe";
import { env } from "@/src/env";

import { DURATIONS, DURATION_PRICES_CENTS, type Duration } from "./pricing";

const LOCALES = ["pl", "en"] as const;
type Locale = (typeof LOCALES)[number];

/** Stripe metadata values cap at 500 characters. Keep a safety margin. */
const STRIPE_METADATA_VALUE_MAX = 450;

const TARGET_TYPES = ["activity", "venue", "venueAll"] as const;

const FormSchema = z.object({
  target_type: z.enum(TARGET_TYPES),
  target_id: z.string(),
  duration_days: z.coerce.number().refine(
    (n): n is Duration => (DURATIONS as readonly number[]).includes(n),
    { message: "duration must be one of 7, 14, 30" },
  ),
  locale: z.enum(LOCALES),
});

type PartnerRow = {
  id: string;
  name: string;
  contact_email: string;
};

type RequiredPartner = {
  partner: PartnerRow;
  userId: string;
  locale: Locale;
};

async function requirePartner(formData: FormData): Promise<RequiredPartner> {
  // Coerce locale defensively — the page always supplies it, but we still
  // want a valid redirect target even if the field is missing.
  const localeRaw = formData.get("locale");
  const localeParsed = z.enum(LOCALES).safeParse(localeRaw);
  const locale: Locale = localeParsed.success ? localeParsed.data : "pl";

  const current = await getCurrentUser();
  if (!current) {
    redirect(`/${locale}/login?next=/${locale}/partner/promote`);
  }

  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from("partner_members")
    .select("partner_id")
    .eq("user_id", current.user.id)
    .limit(1);

  const membership = memberships?.[0];
  if (!membership) notFound();

  const { data: partner } = await supabase
    .from("partners")
    .select("id, name, contact_email")
    .eq("id", membership.partner_id)
    .maybeSingle();

  if (!partner) notFound();

  return {
    partner: partner as PartnerRow,
    userId: current.user.id,
    locale,
  };
}

function originFromHeaders(host: string | null, proto: string | null): string {
  if (env.NEXT_PUBLIC_SITE_URL) {
    return env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (!host) return "";
  return `${proto ?? "https"}://${host}`;
}

/**
 * Purchase a Boost. Redirects to Stripe Checkout on success, to
 * `/partner/promote?boost=error` on failure. Never returns on the happy path.
 */
export async function promoteBoost(formData: FormData): Promise<void> {
  const serverEnv = env as typeof env & {
    STRIPE_SECRET_KEY?: string;
    SUPABASE_SERVICE_ROLE_KEY?: string;
  };

  // Validate inputs. `safeParse` on the raw FormData — `target_id` shape
  // depends on `target_type` (uuid for activity/venue, arbitrary partner-id
  // sentinel for venueAll), so we branch below rather than encoding it all
  // in the schema.
  const parsed = FormSchema.safeParse({
    target_type: formData.get("target_type"),
    target_id: formData.get("target_id"),
    duration_days: formData.get("duration_days"),
    locale: formData.get("locale"),
  });

  // Defensive: if validation fails, route back to the page with an error
  // flag so the UI can surface `errors.generic` without a crash.
  if (!parsed.success) {
    const fallbackLocale: Locale = "pl";
    redirect(`/${fallbackLocale}/partner/promote?boost=error`);
  }

  const { target_type, target_id, duration_days, locale } = parsed.data;
  const durationDays = duration_days as Duration;

  // Degrade gracefully pre-config. The page already shows a placeholder
  // card in these cases, so a stray POST shouldn't throw.
  if (
    !serverEnv.NEXT_PUBLIC_SUPABASE_URL ||
    !serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    !serverEnv.SUPABASE_SERVICE_ROLE_KEY ||
    !serverEnv.STRIPE_SECRET_KEY
  ) {
    redirect(`/${locale}/partner/promote?boost=error`);
  }

  const { partner } = await requirePartner(formData);

  // For activity/venue targets, enforce uuid shape and ownership.
  if (target_type === "activity" || target_type === "venue") {
    const uuid = z.string().uuid().safeParse(target_id);
    if (!uuid.success) {
      redirect(`/${locale}/partner/promote?boost=error`);
    }
  }

  const admin = createAdminClient();

  // --- Resolve target rows (ownership + shape) -----------------------------

  type InsertRow = {
    partner_id: string;
    activity_id: string | null;
    venue_id: string | null;
    starts_at: string;
    ends_at: string;
    status: "pending";
    stripe_payment_id: null;
  };

  const nowIso = new Date().toISOString();
  const endsAtIso = new Date(
    Date.now() + durationDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  const insertRows: InsertRow[] = [];

  if (target_type === "activity") {
    // Ownership check: activity must belong to a venue owned by this
    // partner.
    const { data: activityRow, error: activityErr } = await admin
      .from("activities")
      .select("id, venue:venues!inner (id, partner_id)")
      .eq("id", target_id)
      .maybeSingle();
    if (activityErr || !activityRow) {
      redirect(`/${locale}/partner/promote?boost=error`);
    }
    const venueRaw = (activityRow as { venue: unknown }).venue;
    const venue = (
      Array.isArray(venueRaw)
        ? (venueRaw[0] ?? null)
        : (venueRaw ?? null)
    ) as { partner_id: string } | null;
    if (!venue || venue.partner_id !== partner.id) {
      redirect(`/${locale}/partner/promote?boost=error`);
    }
    insertRows.push({
      partner_id: partner.id,
      activity_id: target_id,
      venue_id: null,
      starts_at: nowIso,
      ends_at: endsAtIso,
      status: "pending",
      stripe_payment_id: null,
    });
  } else if (target_type === "venue") {
    const { data: venueRow, error: venueErr } = await admin
      .from("venues")
      .select("id, partner_id")
      .eq("id", target_id)
      .maybeSingle();
    if (venueErr || !venueRow) {
      redirect(`/${locale}/partner/promote?boost=error`);
    }
    if ((venueRow as { partner_id: string }).partner_id !== partner.id) {
      redirect(`/${locale}/partner/promote?boost=error`);
    }
    insertRows.push({
      partner_id: partner.id,
      activity_id: null,
      venue_id: target_id,
      starts_at: nowIso,
      ends_at: endsAtIso,
      status: "pending",
      stripe_payment_id: null,
    });
  } else {
    // venueAll — insert one pending row per venue of this partner. The 0002
    // XOR constraint forbids (activity_id IS NULL AND venue_id IS NULL), so
    // we can't represent "all venues" as a single null-null row.
    const { data: venues, error: venuesErr } = await admin
      .from("venues")
      .select("id")
      .eq("partner_id", partner.id);
    if (venuesErr || !venues || venues.length === 0) {
      redirect(`/${locale}/partner/promote?boost=error`);
    }
    for (const v of venues as { id: string }[]) {
      insertRows.push({
        partner_id: partner.id,
        activity_id: null,
        venue_id: v.id,
        starts_at: nowIso,
        ends_at: endsAtIso,
        status: "pending",
        stripe_payment_id: null,
      });
    }
  }

  // --- Insert pending boost rows -------------------------------------------

  const { data: inserted, error: insertErr } = await admin
    .from("listing_boosts")
    .insert(insertRows)
    .select("id");

  if (insertErr || !inserted || inserted.length === 0) {
    console.error("[promoteBoost] insert failed", insertErr);
    redirect(`/${locale}/partner/promote?boost=error`);
  }

  const boostIds = (inserted as { id: string }[]).map((r) => r.id);

  // Stripe metadata caps each value at 500 chars. 36-char uuids + commas
  // means venueAll with many venues could exceed the cap. If it does, fall
  // back to a comma-joined truncation plus a sentinel telling the webhook
  // to look rows up by `stripe_payment_id` instead. In practice a partner
  // with ~13 venues fits; we log + error out on the edge case rather than
  // silently drop ids.
  const joined = boostIds.join(",");
  if (joined.length > STRIPE_METADATA_VALUE_MAX) {
    // Roll back the inserted rows so we don't leak orphans.
    await admin.from("listing_boosts").delete().in("id", boostIds);
    console.error(
      "[promoteBoost] boost_ids exceeds Stripe metadata cap; venueAll with " +
        `${boostIds.length} venues is too large (joined length ${joined.length}).`,
    );
    redirect(`/${locale}/partner/promote?boost=error`);
  }

  // --- Stripe Checkout -----------------------------------------------------

  const priceCents = DURATION_PRICES_CENTS[durationDays];
  const stripe = getStripe();

  const h = await headers();
  const origin = originFromHeaders(
    h.get("x-forwarded-host") ?? h.get("host"),
    h.get("x-forwarded-proto"),
  );
  const successUrl = `${origin}/${locale}/partner/promote?boost=success`;
  const cancelUrl = `${origin}/${locale}/partner/promote?boost=cancelled`;

  const stripeLocale: "pl" | "en" = locale === "en" ? "en" : "pl";
  const productName = `Hakuna Boost — ${durationDays} days`;

  // Metadata notes:
  //   - `boost_id`  (single-row target) — always present for activity/venue.
  //   - `boost_ids` (multi-row target)  — comma-joined for venueAll. The
  //     webhook branches on whichever key is set.
  //   - Keep every value well under 500 chars (Stripe cap).
  const metadata: Record<string, string> = {
    partner_id: partner.id,
    duration_days: String(durationDays),
    target_type,
    target_id,
  };
  if (boostIds.length === 1) {
    metadata.boost_id = boostIds[0];
  } else {
    metadata.boost_ids = joined;
  }

  let checkoutUrl: string | null = null;
  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "blik", "p24"],
      locale: stripeLocale,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "pln",
            unit_amount: priceCents,
            product_data: {
              name: productName,
            },
          },
        },
      ],
      metadata,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    // Persist the Stripe session id on every inserted row so the webhook
    // can join on it if metadata is ever truncated by a proxy.
    await admin
      .from("listing_boosts")
      .update({ stripe_payment_id: checkoutSession.id })
      .in("id", boostIds);

    checkoutUrl = checkoutSession.url;
  } catch (err) {
    console.error("[promoteBoost] stripe checkout failed", err);
    await admin.from("listing_boosts").delete().in("id", boostIds);
    redirect(`/${locale}/partner/promote?boost=error`);
  }

  if (!checkoutUrl) {
    await admin.from("listing_boosts").delete().in("id", boostIds);
    redirect(`/${locale}/partner/promote?boost=error`);
  }

  redirect(checkoutUrl);
}
