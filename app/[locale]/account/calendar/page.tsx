import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  getCalendarIntegration,
  type CalendarIntegrationStatus,
} from "@/src/lib/calendar/storage";
import { getCurrentUser } from "@/src/lib/db/server";

import CalendarConnectControls from "./CalendarConnectControls";

export const dynamic = "force-dynamic";

function statusKey(s: CalendarIntegrationStatus | null): string {
  if (!s) return "disconnected";
  if (!s.syncEnabled) return "paused";
  return "connected";
}

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
  const lastSyncedLabel = integration?.lastSyncedAt
    ? new Intl.DateTimeFormat(locale === "pl" ? "pl-PL" : "en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(integration.lastSyncedAt))
    : null;

  return (
    <>
      <header className="mb-8">
        <h1 className="font-headline text-3xl md:text-4xl font-bold mb-2">
          {t("calendar.title")}
        </h1>
        <p className="text-on-surface/70">{t("calendar.subtitle")}</p>
      </header>

      <section className="rounded-2xl bg-surface-container-lowest border border-on-surface/10 p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <div>
            <p className="text-sm text-on-surface/60 mb-1">
              {t("calendar.statusLabel")}
            </p>
            <p className="font-semibold text-base">
              {t(`calendar.status.${key}`)}
            </p>
          </div>
          <CalendarConnectControls
            connected={!!integration}
            syncEnabled={integration?.syncEnabled ?? false}
          />
        </div>

        {lastSyncedLabel && (
          <p className="text-sm text-on-surface/60">
            {t("calendar.lastSynced", { when: lastSyncedLabel })}
          </p>
        )}

        <p className="text-sm text-on-surface/70 mt-4">
          {t("calendar.about")}
        </p>
      </section>
    </>
  );
}
