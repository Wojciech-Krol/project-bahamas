/**
 * Hakuna partner subscription tiers — Phase 3.3.
 *
 * Authoritative spec: `plan_akcji/HAKUNA_BUILD_PLAN.md` section
 * "3.3 Subscriptions (partner tier)" and "Commission spec — single source of
 * truth" (see "Subscription commission").
 *
 * This module is the ONE place that knows the mapping between Stripe Billing
 * Price IDs and Hakuna's internal tier metadata (commission rate, display
 * copy, monthly amount). The webhook handler, the Plans page, and the
 * checkout action all look up tiers through this module — never via
 * scattered literals. If you add a tier, update this file; the rest of the
 * system auto-discovers it.
 *
 * Design notes:
 *   - `stripePriceId` is nullable. When an operator has not yet created the
 *     Stripe Product/Price, the tier entry stays in the list so the UI can
 *     render it as "not available yet" without branching on env presence.
 *   - `key` is a stable slug — it persists on `partners.subscription_tier`
 *     and the commission logic in `bookingActions.ts` compares against
 *     `'none'` vs any other string to decide "has active subscription".
 *     Changing `key` values is a DB-level migration, not a no-op.
 *   - `commissionBps` replaces `partners.commission_rate_bps` for
 *     returning-customer bookings when the subscription is active AND
 *     `partners.subscription_commission_bps` is non-null. See
 *     `commission.ts` for the full resolution rule.
 *
 * Commission rates per founder spec:
 *   - none (implicit default, no subscription): 2000 bps (20% rack rate)
 *   - partner-plus-monthly:                     1500 bps (15% target)
 *   - partner-pro-monthly:                      1200 bps (12%)
 */

import { env } from "@/src/env";

// `env` on the server is the union of server + client schemas. On the
// browser it narrows to the client-only shape and loses the
// `STRIPE_PRICE_*` keys. This module is import-safe from either side but
// the env access is only meaningful on the server — re-type locally so
// TypeScript stays strict when we read the server-only keys.
type ServerEnv = typeof env & {
  STRIPE_PRICE_PARTNER_PLUS?: string;
  STRIPE_PRICE_PARTNER_PRO?: string;
};

export type SubscriptionTier = {
  /** Stable slug persisted on `partners.subscription_tier`. */
  key: string;
  /** UI label — resolve the translated copy via `Partner.plans.tierNames.{key}`. */
  displayName: string;
  /**
   * Stripe Billing Price ID (from the Stripe dashboard, e.g. `price_abc123`).
   * Null when the operator has not provisioned the Price yet — the Plans
   * page renders the tier card with a disabled CTA.
   */
  stripePriceId: string | null;
  /** Commission in basis points applied to returning-customer bookings. */
  commissionBps: number;
  /** Display-only monthly price (minor units, PLN). */
  monthlyAmountCents: number;
};

function serverEnv(): ServerEnv {
  return env as ServerEnv;
}

/**
 * Ordered list of subscription tiers offered to partners.
 *
 * The `none` tier is NOT included here — it is the implicit default for
 * partners without an active subscription and carries no checkout flow.
 * The Plans page synthesises a "current: none" chip from
 * `partners.subscription_tier === 'none' | null`.
 */
export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    key: "partner-plus-monthly",
    displayName: "Partner Plus",
    stripePriceId: serverEnv().STRIPE_PRICE_PARTNER_PLUS ?? null,
    commissionBps: 1500,
    // 149.00 PLN / month — display only. The authoritative price lives on
    // the Stripe Price record; this value is shown in the card header and
    // should be kept in sync manually.
    monthlyAmountCents: 14900,
  },
  {
    key: "partner-pro-monthly",
    displayName: "Partner Pro",
    stripePriceId: serverEnv().STRIPE_PRICE_PARTNER_PRO ?? null,
    commissionBps: 1200,
    // 299.00 PLN / month — display only; see note above.
    monthlyAmountCents: 29900,
  },
];

/**
 * Look up a tier by its Stripe Price ID. Returns null when the Price ID
 * does not match any tier in `SUBSCRIPTION_TIERS` (e.g. legacy Price ID
 * that was removed, or a Price ID from a different Stripe account). The
 * webhook handler treats a null result as "ignore this subscription event"
 * rather than an error — Stripe webhooks can deliver events for any
 * subscription on the account.
 */
export function findTierByPriceId(
  priceId: string | null,
): SubscriptionTier | null {
  if (!priceId) return null;
  return SUBSCRIPTION_TIERS.find((tier) => tier.stripePriceId === priceId) ?? null;
}

/**
 * Look up a tier by its internal `key`. Used by the Plans checkout action
 * to validate the slug coming in from the form submission.
 */
export function findTierByKey(key: string | null): SubscriptionTier | null {
  if (!key) return null;
  return SUBSCRIPTION_TIERS.find((tier) => tier.key === key) ?? null;
}
