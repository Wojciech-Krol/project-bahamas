/**
 * Hakuna commission calculation — pure function, no DB or runtime deps.
 *
 * Authoritative spec: `plan_akcji/HAKUNA_BUILD_PLAN.md` section
 * "Commission spec — single source of truth" (and the founder-provided
 * "Commission model" block near the top of the plan). Any change here must
 * be mirrored in the DB migrations, seeds, and `createBooking` server action.
 *
 * Model summary:
 *   - Base commission: `partners.commission_rate_bps` (default 2000 rack).
 *   - Subscription commission: `partners.subscription_commission_bps`
 *     (nullable). Used instead of base rate when the partner has an active
 *     subscription AND this column is non-null. If the partner has an
 *     active subscription but no override is stored, we fall back to the
 *     base `commission_rate_bps` — subscription presence alone does not
 *     grant a discount without an explicit tier rate.
 *   - Boost commission: one-time 35% target / 40% rack on the FIRST booking
 *     of a new-to-this-partner customer when Boost was active on the
 *     session at booking time. Boost REPLACES the base rate for that
 *     booking; it does not stack.
 *   - Returning customers (attribution row already exists for this partner)
 *     always pay the base/subscription rate regardless of Boost status —
 *     Boost never double-charges.
 *
 * Rounding: `Math.floor(basePriceCents * commissionBps / 10000)`. Stripe's
 * `application_fee_amount` is an integer in minor units and we round DOWN
 * in favor of the partner for any sub-grosz remainder.
 */

export const BOOST_COMMISSION_TARGET_BPS = 3500;
export const BOOST_COMMISSION_RACK_BPS = 4000;
/** Re-export of the plan's rack-rate default (20%). Useful for seeds/tests. */
export const BASE_COMMISSION_DEFAULT_BPS = 2000;

export type CommissionInput = {
  basePriceCents: number; // session price in minor units
  partner: {
    commissionRateBps: number; // base rate on the partner row
    subscriptionCommissionBps: number | null; // nullable subscription override
    hasActiveSubscription: boolean; // computed by caller (Billing status)
  };
  customer: {
    // null = first booking at this partner, else attribution row exists
    attribution: { wasBoostAttributed: boolean } | null;
  };
  boost: {
    // true when a listing_boosts row is active for this session's
    // activity or its parent venue at booking creation time
    activeOnSession: boolean;
  };
};

export type CommissionResult = {
  commissionBps: number;
  commissionCents: number;
  isBoostFirstBooking: boolean;
  boostCommissionBps: number | null;
  /** Audit: human-readable rationale for the chosen rate. */
  reason:
    | "returning-customer-base"
    | "returning-customer-subscription"
    | "new-customer-boost"
    | "new-customer-base"
    | "new-customer-base-subscription";
};

function resolveBaseRate(
  partner: CommissionInput["partner"],
): { bps: number; usedSubscription: boolean } {
  if (
    partner.hasActiveSubscription &&
    partner.subscriptionCommissionBps != null
  ) {
    return { bps: partner.subscriptionCommissionBps, usedSubscription: true };
  }
  return { bps: partner.commissionRateBps, usedSubscription: false };
}

export function computeCommission(input: CommissionInput): CommissionResult {
  const { basePriceCents, partner, customer, boost } = input;

  // Returning customer: attribution row exists. Boost never re-applies.
  if (customer.attribution !== null) {
    const { bps, usedSubscription } = resolveBaseRate(partner);
    // Math.floor — Stripe application_fee is integer minor units; platform
    // rounds down in favor of the partner.
    const commissionCents = Math.floor((basePriceCents * bps) / 10000);
    return {
      commissionBps: bps,
      commissionCents,
      isBoostFirstBooking: false,
      boostCommissionBps: null,
      reason: usedSubscription
        ? "returning-customer-subscription"
        : "returning-customer-base",
    };
  }

  // New customer at this partner.
  if (boost.activeOnSession) {
    const bps = BOOST_COMMISSION_TARGET_BPS;
    const commissionCents = Math.floor((basePriceCents * bps) / 10000);
    return {
      commissionBps: bps,
      commissionCents,
      isBoostFirstBooking: true,
      boostCommissionBps: BOOST_COMMISSION_TARGET_BPS,
      reason: "new-customer-boost",
    };
  }

  // New customer, no Boost — base (or subscription) rate still applies.
  const { bps, usedSubscription } = resolveBaseRate(partner);
  const commissionCents = Math.floor((basePriceCents * bps) / 10000);
  return {
    commissionBps: bps,
    commissionCents,
    isBoostFirstBooking: false,
    boostCommissionBps: null,
    reason: usedSubscription
      ? "new-customer-base-subscription"
      : "new-customer-base",
  };
}
