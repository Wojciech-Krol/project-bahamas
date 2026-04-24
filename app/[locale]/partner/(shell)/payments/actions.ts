"use server";

import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUser, createClient } from "@/src/lib/db/server";
import { createAdminClient } from "@/src/lib/db/admin";
import {
  createAccountLink,
  createExpressAccount,
  getAccountStatus,
  type AccountStatus,
} from "@/src/lib/payments/stripeConnect";
import { env } from "@/src/env";

/**
 * Partner → Stripe Connect onboarding server actions.
 *
 * `startConnectOnboarding` lazily provisions a Stripe Express account for
 * the partner (if one does not already exist), persists the account id on
 * `partners.stripe_account_id`, then redirects the partner into Stripe's
 * hosted onboarding UI. Stripe calls us back at `/partner/payments?done=1`.
 *
 * `refreshConnectStatus` re-reads the live Stripe account and returns the
 * resulting flags to the caller so the page can revalidate without a full
 * round-trip through Stripe's webhook.
 *
 * Trust model: every action independently re-resolves the partner from the
 * signed-in user. The form POST carries only the locale. Never trust a
 * `partner_id` claimed by the client payload.
 */

const LOCALES = ["pl", "en"] as const;
type Locale = (typeof LOCALES)[number];

const FormSchema = z.object({
  locale: z.enum(LOCALES),
});

type PartnerRow = {
  id: string;
  name: string;
  contact_email: string;
  stripe_account_id: string | null;
};

type LoadedPartner = {
  partner: PartnerRow;
  locale: Locale;
};

async function requirePartner(formData: FormData): Promise<LoadedPartner> {
  const parsed = FormSchema.safeParse({
    locale: formData.get("locale"),
  });
  const locale: Locale = parsed.success ? parsed.data.locale : "pl";

  const current = await getCurrentUser();
  if (!current) {
    redirect(`/${locale}/login?next=/${locale}/partner/payments`);
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
    .select("id, name, contact_email, stripe_account_id")
    .eq("id", membership.partner_id)
    .maybeSingle();

  if (!partner) {
    notFound();
  }

  return { partner: partner as PartnerRow, locale };
}

function originFromHeaders(host: string | null, proto: string | null): string {
  if (env.NEXT_PUBLIC_SITE_URL) {
    return env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (!host) return "";
  return `${proto ?? "https"}://${host}`;
}

/**
 * Kick off (or resume) Stripe Express onboarding for the current partner.
 *
 * Terminal step: `redirect(accountLink.url)` — never returns normally on
 * the happy path. Stripe's account-link URL is absolute, so we use the
 * plain `next/navigation` redirect, not the locale-aware wrapper.
 */
export async function startConnectOnboarding(formData: FormData): Promise<void> {
  const { partner, locale } = await requirePartner(formData);

  let accountId = partner.stripe_account_id;

  if (!accountId) {
    accountId = await createExpressAccount(partner.id, {
      email: partner.contact_email,
      country: "PL",
      businessType: "company",
    });

    const admin = createAdminClient();
    const { error } = await admin
      .from("partners")
      .update({ stripe_account_id: accountId })
      .eq("id", partner.id);

    if (error) {
      throw new Error(
        `Failed to persist stripe_account_id for partner ${partner.id}: ${error.message}`,
      );
    }
  }

  const headerList = await headers();
  const origin = originFromHeaders(
    headerList.get("x-forwarded-host") ?? headerList.get("host"),
    headerList.get("x-forwarded-proto"),
  );

  const refreshUrl = `${origin}/${locale}/partner/payments?refresh=1`;
  const returnUrl = `${origin}/${locale}/partner/payments?done=1`;

  const linkUrl = await createAccountLink(accountId, {
    refreshUrl,
    returnUrl,
  });

  redirect(linkUrl);
}

export type RefreshConnectStatusResult =
  | { ok: true; status: AccountStatus }
  | { ok: false; error: string };

/**
 * Re-read the partner's Stripe account and revalidate the payments page.
 *
 * The returned object is for `useFormState` consumers — for the default
 * no-JS `<form action={refreshConnectStatus}>` path, `revalidatePath` is
 * the load-bearing side effect. React's form `action` prop only accepts
 * `void`-returning actions, so we provide two entry points:
 *   - `refreshConnectStatus`        → `void`, for `<form action={...}>`
 *   - `refreshConnectStatusState`   → typed result, for `useFormState`
 */
async function doRefresh(formData: FormData): Promise<RefreshConnectStatusResult> {
  const { partner, locale } = await requirePartner(formData);

  if (!partner.stripe_account_id) {
    return { ok: false, error: "not-connected" };
  }

  try {
    const status = await getAccountStatus(partner.stripe_account_id);
    revalidatePath(`/${locale}/partner/payments`);
    return { ok: true, status };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}

export async function refreshConnectStatus(formData: FormData): Promise<void> {
  await doRefresh(formData);
}

export async function refreshConnectStatusState(
  _prev: RefreshConnectStatusResult | null,
  formData: FormData,
): Promise<RefreshConnectStatusResult> {
  return doRefresh(formData);
}
