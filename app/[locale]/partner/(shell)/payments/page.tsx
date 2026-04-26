import { getTranslations } from "next-intl/server";

import { Icon } from "@/app/components/Icon";
import { createClient, getCurrentUser } from "@/src/lib/db/server";
import { getAccountStatus, type AccountStatus } from "@/src/lib/payments/stripeConnect";
import { env } from "@/src/env";

import { refreshConnectStatus, startConnectOnboarding } from "./actions";

/**
 * Partner → Payments (Stripe Connect onboarding).
 *
 * Route: `/[locale]/partner/payments` (inside the partner shell group, so the
 * shell layout's partner-member guard applies). Per-session DB + Stripe
 * reads, so this page opts out of caching entirely.
 *
 * The page degrades gracefully:
 *   - no Supabase env → placeholder card (keeps `next build` green on a
 *     fresh clone)
 *   - no Stripe env   → placeholder card
 *   - partner has no stripe_account_id yet → "Connect Stripe" CTA
 *   - partner has account but onboarding incomplete → "Resume onboarding"
 *   - partner is fully onboarded → status card + "Refresh status"
 */

export const dynamic = "force-dynamic";

// `env` is typed as the union of server + client schemas, but TypeScript
// narrows to the client shape in some module graphs. This page is server-only
// (the actions file is `"use server"` and the Stripe/Supabase calls only run
// on the server) — re-type locally to include the server-only keys.
type ServerEnv = typeof env & {
  STRIPE_SECRET_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

type PartnerRow = {
  id: string;
  name: string;
  contact_email: string;
  stripe_account_id: string | null;
};

type Phase =
  | { kind: "supabase-missing" }
  | { kind: "stripe-missing" }
  | { kind: "none"; locale: string }
  | { kind: "incomplete"; locale: string; status: AccountStatus | null }
  | { kind: "connected"; locale: string; status: AccountStatus };

async function resolvePhase(locale: string): Promise<Phase> {
  const serverEnv = env as ServerEnv;
  if (!serverEnv.NEXT_PUBLIC_SUPABASE_URL || !serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { kind: "supabase-missing" };
  }
  if (!serverEnv.STRIPE_SECRET_KEY) {
    return { kind: "stripe-missing" };
  }

  const current = await getCurrentUser();
  // Shell layout already redirects unauthenticated users to /login. If we
  // somehow get here without a session, fall through to the "none" state so
  // the page still renders something sensible rather than crashing.
  if (!current) {
    return { kind: "none", locale };
  }

  const supabase = await createClient();
  const { data: memberships } = await supabase
    .from("partner_members")
    .select("partner_id")
    .eq("user_id", current.user.id)
    .limit(1);

  const membership = memberships?.[0];
  if (!membership) {
    // Same reasoning — shell layout calls notFound() for non-members. If a
    // race slipped through, show the empty state rather than throwing.
    return { kind: "none", locale };
  }

  const { data: partnerData } = await supabase
    .from("partners")
    .select("id, name, contact_email, stripe_account_id")
    .eq("id", membership.partner_id)
    .maybeSingle();

  const partner = partnerData as PartnerRow | null;

  if (!partner?.stripe_account_id) {
    return { kind: "none", locale };
  }

  try {
    const status = await getAccountStatus(partner.stripe_account_id);
    if (status.chargesEnabled && status.detailsSubmitted) {
      return { kind: "connected", locale, status };
    }
    return { kind: "incomplete", locale, status };
  } catch {
    // Stripe API hiccup — surface as "incomplete" with no detail so the
    // partner can still retry via the onboarding link.
    return { kind: "incomplete", locale, status: null };
  }
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

function StatusChip({
  tone,
  label,
  icon,
}: {
  tone: "neutral" | "warn" | "ok";
  label: string;
  icon: string;
}) {
  const palette: Record<typeof tone, string> = {
    neutral: "bg-surface-container-high text-on-surface/70",
    warn: "bg-secondary-fixed text-on-secondary-fixed",
    ok: "bg-primary-fixed text-primary",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-widest ${palette[tone]}`}
    >
      <Icon name={icon} className="text-[14px]" />
      {label}
    </span>
  );
}

export default async function PartnerPaymentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Partner.stripe" });

  const phase = await resolvePhase(locale);

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
          icon="payments"
          title={t("title")}
          body={t("placeholder.stripeMissing")}
        />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-headline font-extrabold text-4xl tracking-tight mb-2">
          {t("title")}
        </h1>
        <p className="text-on-surface/60">{t("subtitle")}</p>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-[#FAEEDA] editorial-shadow p-8 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center">
              <Icon name="account_balance" className="text-[28px]" />
            </div>
            <div>
              <div className="font-headline font-bold text-xl">Stripe Connect</div>
              {phase.kind === "none" && (
                <div className="mt-1">
                  <StatusChip tone="neutral" icon="circle" label={t("status.none")} />
                </div>
              )}
              {phase.kind === "incomplete" && (
                <div className="mt-1">
                  <StatusChip
                    tone="warn"
                    icon="hourglass_top"
                    label={t("status.incomplete")}
                  />
                </div>
              )}
              {phase.kind === "connected" && (
                <div className="mt-1">
                  <StatusChip
                    tone="ok"
                    icon="check_circle"
                    label={t("status.connected")}
                  />
                </div>
              )}
            </div>
          </div>

          {(phase.kind === "none" || phase.kind === "incomplete") && (
            <form action={startConnectOnboarding}>
              <input type="hidden" name="locale" value={locale} />
              <button
                type="submit"
                className="bg-primary text-on-primary px-6 py-3 rounded-2xl font-headline uppercase tracking-widest text-[0.7rem] font-bold hover:bg-tertiary transition-colors flex items-center gap-2"
              >
                <Icon name="open_in_new" className="text-[18px]" />
                {phase.kind === "none" ? t("cta.connect") : t("cta.resume")}
              </button>
            </form>
          )}

          {phase.kind === "connected" && (
            <form action={refreshConnectStatus}>
              <input type="hidden" name="locale" value={locale} />
              <button
                type="submit"
                className="bg-surface-container-high text-on-surface px-6 py-3 rounded-2xl font-headline uppercase tracking-widest text-[0.7rem] font-bold hover:bg-surface-container-highest transition-colors flex items-center gap-2"
              >
                <Icon name="refresh" className="text-[18px]" />
                {t("cta.refresh")}
              </button>
            </form>
          )}
        </div>

        {phase.kind === "incomplete" && phase.status && (
          <dl className="grid grid-cols-2 gap-4 text-sm border-t border-on-surface/5 pt-6">
            <div>
              <dt className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface/50 mb-1">
                charges_enabled
              </dt>
              <dd className="font-mono">{String(phase.status.chargesEnabled)}</dd>
            </div>
            <div>
              <dt className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface/50 mb-1">
                payouts_enabled
              </dt>
              <dd className="font-mono">{String(phase.status.payoutsEnabled)}</dd>
            </div>
            <div>
              <dt className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface/50 mb-1">
                details_submitted
              </dt>
              <dd className="font-mono">{String(phase.status.detailsSubmitted)}</dd>
            </div>
            <div>
              <dt className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface/50 mb-1">
                requirements.currently_due
              </dt>
              <dd className="font-mono text-xs break-all">
                {phase.status.requirementsCurrent.length > 0
                  ? phase.status.requirementsCurrent.join(", ")
                  : "—"}
              </dd>
            </div>
          </dl>
        )}

        {phase.kind === "connected" && (
          <dl className="grid grid-cols-2 gap-4 text-sm border-t border-on-surface/5 pt-6">
            <div>
              <dt className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface/50 mb-1">
                charges_enabled
              </dt>
              <dd className="font-mono flex items-center gap-1">
                <Icon name="check" className="text-[16px] text-primary" />
                {String(phase.status.chargesEnabled)}
              </dd>
            </div>
            <div>
              <dt className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface/50 mb-1">
                payouts_enabled
              </dt>
              <dd className="font-mono flex items-center gap-1">
                <Icon name="check" className="text-[16px] text-primary" />
                {String(phase.status.payoutsEnabled)}
              </dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
}
