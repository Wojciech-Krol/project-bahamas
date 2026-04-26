import { getTranslations } from "next-intl/server";

import { Icon } from "@/app/components/Icon";
import { createClient, getCurrentUser } from "@/src/lib/db/server";
import { env } from "@/src/env";
import { CONNECTABLE_PROVIDERS, IMPLEMENTED_PROVIDERS, type PosProvider } from "@/src/lib/pos/adapter";
import { isPosCryptoConfigured } from "@/src/lib/pos/crypto";

import CsvIntegrationCard from "./CsvIntegrationCard";

/**
 * Partner → Integrations page.
 *
 * Renders one card per POS provider the operator can theoretically connect
 * (`CONNECTABLE_PROVIDERS`). Only providers in `IMPLEMENTED_PROVIDERS`
 * actually have interactive UI; the rest render a muted "coming soon" pill.
 *
 * Graceful degradation ladder (matches payments/plans pages):
 *   - Supabase env missing      → placeholder card
 *   - POS_CONFIG_ENCRYPTION_KEY → placeholder card
 *   - authed partner            → full UI
 */

export const dynamic = "force-dynamic";

type ServerEnv = typeof env & {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
};

type IntegrationRow = {
  id: string;
  provider: PosProvider;
  status: "active" | "disabled" | "error";
  last_synced_at: string | null;
  last_error: string | null;
  consecutive_failures: number;
};

type PartnerActivity = {
  id: string;
  title_i18n: Record<string, string> | null;
};

type Phase =
  | { kind: "supabase-missing" }
  | { kind: "crypto-missing" }
  | {
      kind: "ready";
      locale: "pl" | "en";
      integrations: Record<PosProvider, IntegrationRow | null>;
      activities: PartnerActivity[];
    };

async function resolvePhase(locale: "pl" | "en"): Promise<Phase> {
  const serverEnv = env as ServerEnv;
  if (!serverEnv.NEXT_PUBLIC_SUPABASE_URL || !serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { kind: "supabase-missing" };
  }
  if (!isPosCryptoConfigured()) {
    return { kind: "crypto-missing" };
  }

  const current = await getCurrentUser();
  if (!current) {
    // Shell layout redirects unauthenticated users already; keep a fallback
    // so we never crash here.
    return { kind: "ready", locale, integrations: emptyIntegrationMap(), activities: [] };
  }

  const supabase = await createClient();
  const { data: memberships } = await supabase
    .from("partner_members")
    .select("partner_id")
    .eq("user_id", current.user.id)
    .limit(1);
  const partnerId = memberships?.[0]?.partner_id as string | undefined;
  if (!partnerId) {
    return { kind: "ready", locale, integrations: emptyIntegrationMap(), activities: [] };
  }

  const [{ data: rows }, { data: activities }] = await Promise.all([
    supabase
      .from("pos_integrations")
      .select("id, provider, status, last_synced_at, last_error, consecutive_failures")
      .eq("partner_id", partnerId),
    supabase
      .from("activities")
      .select("id, title_i18n, venues!inner(partner_id)")
      .eq("venues.partner_id", partnerId)
      .order("created_at", { ascending: false }),
  ]);

  const integrations = emptyIntegrationMap();
  for (const row of (rows ?? []) as IntegrationRow[]) {
    integrations[row.provider] = row;
  }

  return {
    kind: "ready",
    locale,
    integrations,
    activities: (activities ?? []) as PartnerActivity[],
  };
}

function emptyIntegrationMap(): Record<PosProvider, IntegrationRow | null> {
  return {
    manual: null,
    csv: null,
    activenow: null,
    wodguru: null,
    efitness: null,
    langlion: null,
  };
}

function PlaceholderCard({ icon, title, body }: { icon: string; title: string; body: string }) {
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
  tone: "neutral" | "warn" | "ok" | "error";
  label: string;
  icon: string;
}) {
  const palette: Record<typeof tone, string> = {
    neutral: "bg-surface-container-high text-on-surface/70",
    warn: "bg-secondary-fixed text-on-secondary-fixed",
    ok: "bg-primary-fixed text-primary",
    error: "bg-error-container text-on-error-container",
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

function ComingSoonCard({
  provider,
  providerLabel,
  comingSoonLabel,
}: {
  provider: PosProvider;
  providerLabel: string;
  comingSoonLabel: string;
}) {
  return (
    <div
      className="bg-surface-container-lowest rounded-2xl border border-[#FAEEDA] p-6 opacity-60"
      aria-disabled="true"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-surface-container-high text-on-surface/40 flex items-center justify-center">
          <Icon name="sync_disabled" className="text-[24px]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-headline font-bold text-lg">{providerLabel}</div>
          <div className="text-xs text-on-surface/50 mt-1">{comingSoonLabel}</div>
        </div>
        <span
          className="text-[0.65rem] font-bold uppercase tracking-widest bg-surface-container-high text-on-surface/40 px-3 py-1 rounded-full"
          data-provider={provider}
        >
          {comingSoonLabel}
        </span>
      </div>
    </div>
  );
}

function statusTone(row: IntegrationRow | null): "neutral" | "warn" | "ok" | "error" {
  if (!row) return "neutral";
  if (row.status === "error") return "error";
  if (row.status === "disabled") return "warn";
  return "ok";
}

function statusIcon(row: IntegrationRow | null): string {
  if (!row) return "circle";
  if (row.status === "error") return "error";
  if (row.status === "disabled") return "pause_circle";
  return "check_circle";
}

function statusLabel(
  row: IntegrationRow | null,
  t: (key: string) => string,
): string {
  if (!row) return t("statusNotConnected");
  if (row.status === "error") return t("statusError");
  if (row.status === "disabled") return t("statusDisabled");
  return t("statusActive");
}

function formatSyncedAt(iso: string | null, locale: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });
}

export default async function PartnerIntegrationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const normalisedLocale: "pl" | "en" = locale === "en" ? "en" : "pl";
  const t = await getTranslations({ locale: normalisedLocale, namespace: "Partner.integrations" });

  const phase = await resolvePhase(normalisedLocale);

  if (phase.kind === "supabase-missing") {
    return (
      <div className="p-8">
        <h1 className="font-headline font-extrabold text-4xl tracking-tight mb-8">{t("title")}</h1>
        <PlaceholderCard icon="cloud_off" title={t("title")} body={t("placeholder.supabaseMissing")} />
      </div>
    );
  }

  if (phase.kind === "crypto-missing") {
    return (
      <div className="p-8">
        <h1 className="font-headline font-extrabold text-4xl tracking-tight mb-8">{t("title")}</h1>
        <PlaceholderCard icon="key_off" title={t("title")} body={t("placeholder.cryptoMissing")} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="font-headline font-extrabold text-4xl tracking-tight mb-2">{t("title")}</h1>
        <p className="text-on-surface/60">{t("subtitle")}</p>
      </div>

      <div className="space-y-4">
        {CONNECTABLE_PROVIDERS.map((provider) => {
          const implemented = IMPLEMENTED_PROVIDERS.includes(provider);
          const providerLabel = t(`providers.${provider}`);

          if (!implemented) {
            return (
              <ComingSoonCard
                key={provider}
                provider={provider}
                providerLabel={providerLabel}
                comingSoonLabel={t("comingSoon")}
              />
            );
          }

          if (provider === "csv") {
            const row = phase.integrations.csv;
            return (
              <CsvIntegrationCard
                key={provider}
                locale={normalisedLocale}
                providerLabel={providerLabel}
                activities={phase.activities.map((a) => ({
                  id: a.id,
                  label: pickTitle(a.title_i18n, normalisedLocale) ?? a.id,
                }))}
                statusChip={
                  <StatusChip
                    tone={statusTone(row)}
                    icon={statusIcon(row)}
                    label={statusLabel(row, (k) => t(k))}
                  />
                }
                lastSyncedLabel={
                  row
                    ? formatSyncedAt(row.last_synced_at, normalisedLocale) !== null
                      ? t("lastSynced", {
                          time: formatSyncedAt(row.last_synced_at, normalisedLocale) as string,
                        })
                      : t("lastSyncedNever")
                    : null
                }
                lastErrorLabel={row?.last_error ? t("lastError", { error: row.last_error }) : null}
                isConnected={Boolean(row)}
              />
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

function pickTitle(
  titles: Record<string, string> | null,
  locale: "pl" | "en",
): string | null {
  if (!titles) return null;
  return titles[locale] ?? titles.pl ?? titles.en ?? null;
}
