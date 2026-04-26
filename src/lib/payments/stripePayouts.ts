/**
 * Stripe payouts wrapper for the partner dashboard.
 *
 * Pulls recent payouts the connected account received from Stripe — these
 * represent money that left Hakuna's platform balance and arrived in the
 * partner's bank account. The list is read live from Stripe (no DB cache)
 * so it reflects the canonical state without any sync code.
 */

import type Stripe from "stripe";

import { getStripe } from "@/src/lib/payments/stripe";

export type PartnerPayout = {
  id: string;
  amountCents: number;
  currency: string;
  arrivalDate: string; // ISO date
  status: string;
  description: string | null;
  statementDescriptor: string | null;
};

function compose(p: Stripe.Payout): PartnerPayout {
  return {
    id: p.id,
    amountCents: p.amount,
    currency: p.currency.toUpperCase(),
    arrivalDate: new Date(p.arrival_date * 1000).toISOString(),
    status: p.status,
    description: p.description ?? null,
    statementDescriptor: p.statement_descriptor ?? null,
  };
}

/**
 * List recent payouts for a connected Stripe account. Returns `null` when
 * Stripe is not configured or the call fails — callers render a friendly
 * fallback rather than crashing the whole page on a transient outage.
 */
export async function listPartnerPayouts(
  stripeAccountId: string | null,
  limit = 25,
): Promise<PartnerPayout[] | null> {
  if (!stripeAccountId) return null;
  let stripe;
  try {
    stripe = getStripe();
  } catch {
    return null;
  }

  try {
    const result = await stripe.payouts.list(
      { limit },
      { stripeAccount: stripeAccountId },
    );
    return result.data.map(compose);
  } catch (err) {
    console.error("[listPartnerPayouts] failed", err);
    return null;
  }
}
