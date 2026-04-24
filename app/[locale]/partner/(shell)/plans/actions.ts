"use server";

import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentUser, createClient } from "@/src/lib/db/server";
import { getStripe } from "@/src/lib/payments/stripe";
import { findTierByKey } from "@/src/lib/payments/subscriptionTiers";
import { env } from "@/src/env";

/**
 * Partner → Plans (Stripe Billing subscription) server actions.
 *
 * Authoritative spec: `plan_akcji/HAKUNA_BUILD_PLAN.md` section
 * "3.3 Subscriptions (partner tier)".
 *
 * Trust model mirrors `payments/actions.ts`: the form POST only carries
 * `locale` and `tierKey`. The partner record is always re-resolved from
 * the signed-in user — never from a `partner_id` field on the payload.
 *
 * Flow:
 *   1. Require signed-in user + partner membership.
 *   2. Look up the requested tier by slug. If the tier exists but has no
 *      Stripe Price ID (operator hasn't provisioned the Product), short
 *      circuit with `{ error: 'tier_not_configured' }` — the UI already
 *      renders a disabled button for that case, so this is a defensive
 *      guard against a concurrent env change.
 *   3. If the partner has no Stripe Connect account yet, redirect them
 *      to `/partner/payments` — we can't sell a subscription until the
 *      payout rails are in place.
 *   4. Create a `mode: 'subscription'` Checkout Session. Metadata
 *      `partner_id` + `tier_key` lives on the subscription (via
 *      `subscription_data.metadata`) so the webhook can resolve the
 *      right partner row without depending on email matching.
 *   5. `redirect(session.url)` — terminal step; never returns on the
 *      happy path.
 */

const LOCALES = ["pl", "en"] as const;
type Locale = (typeof LOCALES)[number];

const FormSchema = z.object({
  locale: z.enum(LOCALES),
  tierKey: z.string().min(1),
});

type PartnerRow = {
  id: string;
  name: string;
  contact_email: string;
  stripe_account_id: string | null;
  subscription_tier: string | null;
};

type LoadedPartner = {
  partner: PartnerRow;
  locale: Locale;
  tierKey: string;
};

async function requirePartner(formData: FormData): Promise<LoadedPartner> {
  const parsed = FormSchema.safeParse({
    locale: formData.get("locale"),
    tierKey: formData.get("tierKey"),
  });
  const locale: Locale = parsed.success ? parsed.data.locale : "pl";
  const tierKey = parsed.success ? parsed.data.tierKey : "";

  const current = await getCurrentUser();
  if (!current) {
    redirect(`/${locale}/login?next=/${locale}/partner/plans`);
  }

  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from("partner_members")
    .select("partner_id")
    .eq("user_id", current.user.id)
    .limit(1);

  const membership = memberships?.[0];
  if (!membership) {
    notFound();
  }

  const { data: partner } = await supabase
    .from("partners")
    .select(
      "id, name, contact_email, stripe_account_id, subscription_tier",
    )
    .eq("id", membership.partner_id)
    .maybeSingle();

  if (!partner) {
    notFound();
  }

  return { partner: partner as PartnerRow, locale, tierKey };
}

function originFromHeaders(host: string | null, proto: string | null): string {
  if (env.NEXT_PUBLIC_SITE_URL) {
    return env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (!host) return "";
  return `${proto ?? "https"}://${host}`;
}

/**
 * Start a Stripe Billing subscription checkout for the current partner.
 *
 * React form actions must return `void | Promise<void>`. To signal failure
 * back to the Plans page we redirect back with an `?error=...` query
 * parameter, which the page reads to render an inline banner. The happy
 * path ends in `redirect(session.url)` (to Stripe Checkout), so this
 * action never returns to its caller on success.
 */
export async function startSubscriptionCheckout(
  formData: FormData,
): Promise<void> {
  const { partner, locale, tierKey } = await requirePartner(formData);

  const tier = findTierByKey(tierKey);
  if (!tier) {
    redirect(`/${locale}/partner/plans?error=tier_not_found`);
  }
  if (!tier.stripePriceId) {
    redirect(`/${locale}/partner/plans?error=tier_not_configured`);
  }

  // Stripe Connect payout rails must be in place — we can't sell a
  // subscription to a partner who can't receive any booking payouts.
  if (!partner.stripe_account_id) {
    redirect(`/${locale}/partner/payments?reason=subscription`);
  }

  const headerList = await headers();
  const origin = originFromHeaders(
    headerList.get("x-forwarded-host") ?? headerList.get("host"),
    headerList.get("x-forwarded-proto"),
  );

  const successUrl = `${origin}/${locale}/partner/plans?subscribed=1`;
  const cancelUrl = `${origin}/${locale}/partner/plans?cancelled=1`;

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: tier.stripePriceId,
        quantity: 1,
      },
    ],
    customer_email: partner.contact_email,
    subscription_data: {
      metadata: {
        partner_id: partner.id,
        tier_key: tier.key,
      },
    },
    // Duplicate the metadata on the Checkout Session too — makes
    // debugging easier when inspecting events in the Stripe dashboard.
    metadata: {
      partner_id: partner.id,
      tier_key: tier.key,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    locale: locale === "en" ? "en" : "pl",
  });

  if (!session.url) {
    redirect(`/${locale}/partner/plans?error=checkout_failed`);
  }

  redirect(session.url);
}
