/**
 * Stripe Connect (Express) lifecycle helpers.
 *
 * Wraps the three operations we need for the partner onboarding flow:
 *   1. `createExpressAccount` — provision a new Express connected account.
 *   2. `createAccountLink` — generate a one-shot onboarding URL.
 *   3. `getAccountStatus` — read capability + requirements state so the
 *      dashboard can show "connected" vs. "still needs info".
 *
 * Every helper normalises Stripe SDK errors into a prefixed `Error` so call
 * sites can surface the failure without leaking stack traces.
 *
 * Server-only — depends on the Stripe secret key singleton in `./stripe`.
 */

import type Stripe from "stripe";

import { getStripe } from "./stripe";

export interface CreateExpressAccountOptions {
  email?: string;
  country?: string;
  businessType?: Stripe.AccountCreateParams.BusinessType;
}

export interface AccountStatus {
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirementsCurrent: string[];
}

function wrap(err: unknown, prefix = "Stripe Connect"): Error {
  const message = err instanceof Error ? err.message : String(err);
  return new Error(`${prefix}: ${message}`);
}

/**
 * Create a Stripe Express connected account for a partner.
 *
 * `partnerId` is stored in the account's `metadata` so Stripe webhooks can
 * map back to a Hakuna partner row without an extra DB lookup.
 */
export async function createExpressAccount(
  partnerId: string,
  { email, country, businessType }: CreateExpressAccountOptions = {},
): Promise<string> {
  const stripe = getStripe();

  try {
    const account = await stripe.accounts.create({
      type: "express",
      country: country ?? "PL",
      email,
      business_type: businessType ?? "company",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        hakuna_partner_id: partnerId,
      },
    });

    return account.id;
  } catch (err) {
    throw wrap(err);
  }
}

/**
 * Generate a single-use onboarding URL for the given Express account.
 *
 * Callers are responsible for redirecting the user to the returned URL. The
 * link is short-lived — Stripe mints a fresh one per session, so we never
 * cache it.
 */
export async function createAccountLink(
  accountId: string,
  { refreshUrl, returnUrl }: { refreshUrl: string; returnUrl: string },
): Promise<string> {
  const stripe = getStripe();

  try {
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });

    return link.url;
  } catch (err) {
    throw wrap(err);
  }
}

/**
 * Fetch the capability + requirements state of a connected account.
 *
 * `requirementsCurrent` is Stripe's list of fields the account still has to
 * provide before it can transact — an empty array plus `chargesEnabled:true`
 * means the partner is fully onboarded.
 */
export async function getAccountStatus(
  accountId: string,
): Promise<AccountStatus> {
  const stripe = getStripe();

  try {
    const account = await stripe.accounts.retrieve(accountId);

    return {
      chargesEnabled: account.charges_enabled ?? false,
      payoutsEnabled: account.payouts_enabled ?? false,
      detailsSubmitted: account.details_submitted ?? false,
      requirementsCurrent: account.requirements?.currently_due ?? [],
    };
  } catch (err) {
    throw wrap(err);
  }
}
