import { getTranslations } from "next-intl/server";

import { Icon } from "@/src/components/Icon";
import { createClient, getCurrentUser } from "@/src/lib/db/server";
import { SUBSCRIPTION_TIERS, type SubscriptionTier } from "@/src/lib/payments/subscriptionTiers";
import { env } from "@/src/env";

import { startSubscriptionCheckout } from "./actions";

/**
 * Partner → Plans (Stripe Billing subscription picker).
 *
 * Route: `/[locale]/partner/plans` (inside the partner shell group, so the
 * shell layout's partner-member guard applies). Per-session DB read, so
 * the page opts out of caching entirely.
 *
 * Degrades gracefully in the same places the /payments page does:
 *   - no Supabase env → placeholder card
 *   - no Stripe env   → placeholder card
 *   - partner has no tier → every tier shows "Upgrade"
 *   - current tier cards render "Active" and disable the submit button
 */

export const dynamic = "force-dynamic";

type ServerEnv = typeof env & {
  STRIPE_SECRET_KEY?: string;
};

type PartnerRow = {
  id: string;
  name: string;
  subscription_tier: string | null;
  stripe_account_id: string | null;
};

type Phase =
  | { kind: "supabase-missing" }
  | { kind: "stripe-missing" }
  | { kind: "ready"; currentTier: string }
  | { kind: "none-partner" };

async function resolvePhase(): Promise<Phase> {
  const serverEnv = env as ServerEnv;
  if (!serverEnv.NEXT_PUBLIC_SUPABASE_URL || !serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { kind: "supabase-missing" };
  }
  if (!serverEnv.STRIPE_SECRET_KEY) {
    return { kind: "stripe-missing" };
  }

  const current = await getCurrentUser();
  if (!current) {
    // Shell layout already redirects unauthenticated users. Defensive
    // fallback so a race doesn't crash the page.
    return { kind: "none-partner" };
  }

  const supabase = await createClient();
  const { data: memberships } = await supabase
    .from("partner_members")
    .select("partner_id")
    .eq("user_id", current.user.id)
    .limit(1);

  const membership = memberships?.[0];
  if (!membership) {
    return { kind: "none-partner" };
  }

  const { data: partnerData } = await supabase
    .from("partners")
    .select("id, name, subscription_tier, stripe_account_id")
    .eq("id", membership.partner_id)
    .maybeSingle();

  const partner = partnerData as PartnerRow | null;
  const currentTier = partner?.subscription_tier ?? "none";
  return { kind: "ready", currentTier };
}

function PlaceholderCard({
  icon,
  title,
  body,
}: {
  icon: string;
  title: string;
  body: string;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-[#FAEEDA] editorial-shadow p-12 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-primary-fixed text-primary flex items-center justify-center mb-6">
        <Icon name={icon} className="text-[32px]" />
      </div>
      <h2 className="font-headline font-bold text-2xl mb-2">{title}</h2>
      <p className="text-on-surface/60 max-w-md">{body}</p>
    </div>
  );
}

function formatAmount(minorUnits: number, locale: string): string {
  const major = minorUnits / 100;
  try {
    return new Intl.NumberFormat(locale === "en" ? "en-GB" : "pl-PL", {
      style: "currency",
      currency: "PLN",
      maximumFractionDigits: 0,
    }).format(major);
  } catch {
    return `${major.toFixed(0)} PLN`;
  }
}

function formatCommission(bps: number, locale: string): string {
  const pct = bps / 100;
  try {
    return new Intl.NumberFormat(locale === "en" ? "en-GB" : "pl-PL", {
      maximumFractionDigits: 1,
    }).format(pct) + "%";
  } catch {
    return `${pct.toFixed(1)}%`;
  }
}

type TierCardProps = {
  tier: SubscriptionTier;
  isCurrent: boolean;
  locale: string;
  labels: {
    tierName: string;
    monthlyLabel: string;
    commissionLabel: string;
    currentBadge: string;
    upgrade: string;
    active: string;
    notConfigured: string;
  };
};

function TierCard({ tier, isCurrent, locale, labels }: TierCardProps) {
  const disabled = isCurrent || tier.stripePriceId === null;

  return (
    <div
      className={`relative bg-surface-container-lowest rounded-2xl border editorial-shadow p-8 flex flex-col ${
        isCurrent
          ? "border-primary ring-2 ring-primary/30"
          : "border-[#FAEEDA]"
      }`}
    >
      {isCurrent && (
        <div className="absolute -top-3 left-6 bg-primary text-on-primary text-[0.65rem] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
          {labels.currentBadge}
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center">
          <Icon name="card_membership" className="text-[24px]" />
        </div>
        <div>
          <div className="font-headline font-bold text-xl">{labels.tierName}</div>
          <div className="text-[0.7rem] font-mono text-on-surface/50">{tier.key}</div>
        </div>
      </div>

      <div className="mt-2 mb-6">
        <div className="flex items-baseline gap-2">
          <span className="font-headline font-extrabold text-4xl tracking-tight">
            {formatAmount(tier.monthlyAmountCents, locale)}
          </span>
          <span className="text-on-surface/60 text-sm">{labels.monthlyLabel}</span>
        </div>
        <div className="mt-3 text-sm text-on-surface/70">
          <span className="font-semibold">{formatCommission(tier.commissionBps, locale)}</span>{" "}
          {labels.commissionLabel}
        </div>
      </div>

      <div className="mt-auto">
        {tier.stripePriceId === null ? (
          <button
            type="button"
            disabled
            className="w-full bg-surface-container-high text-on-surface/50 px-6 py-3 rounded-2xl font-headline uppercase tracking-widest text-[0.7rem] font-bold cursor-not-allowed"
          >
            {labels.notConfigured}
          </button>
        ) : isCurrent ? (
          <button
            type="button"
            disabled
            className="w-full bg-surface-container-high text-on-surface/60 px-6 py-3 rounded-2xl font-headline uppercase tracking-widest text-[0.7rem] font-bold cursor-default"
          >
            {labels.active}
          </button>
        ) : (
          <form action={startSubscriptionCheckout}>
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="tierKey" value={tier.key} />
            <button
              type="submit"
              disabled={disabled}
              className="w-full bg-primary text-on-primary px-6 py-3 rounded-2xl font-headline uppercase tracking-widest text-[0.7rem] font-bold hover:bg-tertiary transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="arrow_upward" className="text-[18px]" />
              {labels.upgrade}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default async function PartnerPlansPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Partner.plans" });

  const phase = await resolvePhase();

  if (phase.kind === "supabase-missing") {
    return (
      <div className="p-8">
        <h1 className="font-headline font-extrabold text-4xl tracking-tight mb-8">
          {t("title")}
        </h1>
        <PlaceholderCard
          icon="cloud_off"
          title={t("title")}
          body={t("placeholder.supabaseMissing")}
        />
      </div>
    );
  }

  if (phase.kind === "stripe-missing") {
    return (
      <div className="p-8">
        <h1 className="font-headline font-extrabold text-4xl tracking-tight mb-8">
          {t("title")}
        </h1>
        <PlaceholderCard
          icon="card_membership"
          title={t("title")}
          body={t("placeholder.stripeMissing")}
        />
      </div>
    );
  }

  const currentTier = phase.kind === "ready" ? phase.currentTier : "none";

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-10">
        <h1 className="font-headline font-extrabold text-4xl tracking-tight mb-2">
          {t("title")}
        </h1>
        <p className="text-on-surface/60 max-w-2xl">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SUBSCRIPTION_TIERS.map((tier) => {
          const isCurrent = currentTier === tier.key;
          return (
            <TierCard
              key={tier.key}
              tier={tier}
              isCurrent={isCurrent}
              locale={locale}
              labels={{
                tierName: t(`tierNames.${tier.key}`),
                monthlyLabel: t("monthlyLabel"),
                commissionLabel: t("commissionLabel"),
                currentBadge: t("currentBadge"),
                upgrade: t("upgrade"),
                active: t("active"),
                notConfigured: t("errors.tierNotConfigured"),
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
