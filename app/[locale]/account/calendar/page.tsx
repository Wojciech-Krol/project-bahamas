import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  getCalendarIntegration,
  type CalendarIntegrationStatus,
} from "@/src/lib/calendar/storage";
import { Icon } from "@/src/components/Icon";
import { getCurrentUser } from "@/src/lib/db/server";

import CalendarConnectControls from "./CalendarConnectControls";

export const dynamic = "force-dynamic";

type StatusKey = "disconnected" | "paused" | "connected";

function statusKey(s: CalendarIntegrationStatus | null): StatusKey {
  if (!s) return "disconnected";
  if (!s.syncEnabled) return "paused";
  return "connected";
}

const STATUS_TONE: Record<StatusKey, { dot: string; chip: string }> = {
  disconnected: {
    dot: "bg-on-surface/40",
    chip: "bg-surface-container-high text-on-surface/65",
  },
  paused: {
    dot: "bg-amber-500",
    chip: "bg-amber-100 text-amber-900",
  },
  connected: {
    dot: "bg-emerald-500",
    chip: "bg-emerald-100 text-emerald-900",
  },
};

export default async function AccountCalendarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Account" });
  const current = await getCurrentUser();
  const integration = current
    ? await getCalendarIntegration(current.user.id)
    : null;

  const key = statusKey(integration);
  const tone = STATUS_TONE[key];
  const lastSyncedLabel = integration?.lastSyncedAt
    ? new Intl.DateTimeFormat(locale === "pl" ? "pl-PL" : "en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(integration.lastSyncedAt))
    : null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-headline font-bold text-2xl md:text-3xl tracking-tight">
          {t("calendar.title")}
        </h2>
        <p className="text-on-surface/60 mt-1">{t("calendar.subtitle")}</p>
      </div>

      {/* Status hero */}
      <section className="rounded-[1.75rem] bg-surface-container-lowest border border-on-surface/[0.06] editorial-shadow p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-5 min-w-0">
            <span className="w-14 h-14 rounded-2xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shrink-0">
              <Icon name="calendar_month" className="text-[28px]" />
            </span>
            <div className="min-w-0">
              <p className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface/50 mb-1">
                {t("calendar.statusLabel")}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full ${tone.dot}`}
                />
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${tone.chip}`}
                >
                  {t(`calendar.status.${key}`)}
                </span>
              </div>
              {lastSyncedLabel && (
                <p className="text-sm text-on-surface/55 mt-2">
                  {t("calendar.lastSynced", { when: lastSyncedLabel })}
                </p>
              )}
            </div>
          </div>
          <CalendarConnectControls
            connected={!!integration}
            syncEnabled={integration?.syncEnabled ?? false}
          />
        </div>
      </section>

      {/* Explainer + perks grid */}
      <section className="rounded-[1.75rem] bg-surface-container-lowest border border-on-surface/[0.06] editorial-shadow p-6 md:p-8">
        <h3 className="font-headline font-bold text-lg text-on-surface mb-2">
          {t("calendar.howTitle")}
        </h3>
        <p className="text-sm text-on-surface/65 leading-relaxed mb-6">
          {t("calendar.about")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: "event", key: "perkOne" },
            { icon: "sync", key: "perkTwo" },
            { icon: "lock", key: "perkThree" },
          ].map((p) => (
            <div
              key={p.key}
              className="rounded-2xl bg-surface-container-low p-4 flex flex-col gap-2"
            >
              <span className="w-10 h-10 rounded-xl bg-primary-fixed text-primary flex items-center justify-center">
                <Icon name={p.icon} className="text-[20px]" />
              </span>
              <p className="text-sm font-semibold text-on-surface">
                {t(`calendar.${p.key}.title`)}
              </p>
              <p className="text-xs text-on-surface/55 leading-relaxed">
                {t(`calendar.${p.key}.body`)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
