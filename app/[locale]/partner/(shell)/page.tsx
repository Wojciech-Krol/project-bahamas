/**
 * Partner dashboard overview — Phase 4.
 *
 * Server Component. When Supabase env is absent (pre-launch / fresh
 * clone) renders the original mock design so designers and PMs can
 * keep browsing. When Supabase is configured, resolves the current
 * user's partner_id and pulls the three analytics views into the
 * real revenue / trend / top-activities / heatmap sections.
 *
 * RLS handles tenant scoping — the request-scoped Supabase client
 * authenticates as the signed-in partner member, so the daily-
 * revenue / activity-conversion / session-occupancy views naturally
 * filter down to their partner's rows. Every query is wrapped so a
 * single failed read collapses to an empty aggregate instead of
 * crashing the whole page.
 */

import { getTranslations } from "next-intl/server";

import { env } from "@/src/env";
import {
  getPartnerAnalytics,
  getPartnerIdForCurrentUser,
} from "@/src/lib/db/queries/analytics";
import { pick } from "@/src/lib/db/queries/_i18n";
import { createClient } from "@/src/lib/db/server";
import type { Locale } from "@/src/lib/db/types";

import BookingsTrendChart from "@/src/components/partner/analytics/BookingsTrendChart";
import OccupancyHeatmap from "@/src/components/partner/analytics/OccupancyHeatmap";
import RevenueCards from "@/src/components/partner/analytics/RevenueCards";
import TopActivitiesList from "@/src/components/partner/analytics/TopActivitiesList";

import OverviewMock from "./OverviewMock";

function formatPln(cents: number, locale: string): string {
  const pln = cents / 100;
  try {
    return new Intl.NumberFormat(locale === "pl" ? "pl-PL" : "en-GB", {
      style: "currency",
      currency: "PLN",
      maximumFractionDigits: 0,
    }).format(pln);
  } catch {
    return `${pln.toFixed(0)} PLN`;
  }
}

type ActivityTitleRow = {
  id: string;
  title_i18n: Record<string, string | null | undefined> | null;
};

export default async function PartnerOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Pre-launch / no Supabase → keep the mock UI. The (shell) layout
  // already short-circuits auth checks on this same env condition.
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <OverviewMock />;
  }

  const partnerId = await getPartnerIdForCurrentUser();
  // If the user has no partner membership (admin-only, pending, etc),
  // fall back to the mock UI rather than blanking the screen. Auth
  // already gated the route, so we're not leaking here.
  if (!partnerId) {
    return <OverviewMock />;
  }

  const analytics = await getPartnerAnalytics(partnerId);
  const t = await getTranslations({ locale, namespace: "Partner.analytics" });

  // Resolve activity titles for the top-5 list. Best-effort — if the
  // query fails we render activity ids, which is ugly but functional.
  let activityTitles = new Map<string, string>();
  if (analytics.topActivities.length > 0) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("activities")
        .select("id, title_i18n")
        .in(
          "id",
          analytics.topActivities.map((r) => r.activityId),
        );
      if (data) {
        activityTitles = new Map(
          (data as ActivityTitleRow[]).map((row) => [
            row.id,
            pick(row.title_i18n, locale as Locale) ?? row.id,
          ]),
        );
      }
    } catch {
      // ignore — titles fall through to activity ids below.
    }
  }

  const maxGross = Math.max(
    1,
    ...analytics.topActivities.map((r) => r.grossCents),
  );

  const topRows = analytics.topActivities.map((r) => ({
    activityId: r.activityId,
    title: activityTitles.get(r.activityId) ?? r.activityId,
    amount: formatPln(r.grossCents, locale),
    bookings: r.bookingCount,
    shareOfMax: r.grossCents / maxGross,
  }));

  const weekdayLabels = t.raw("weekdays") as string[];

  return (
    <div className="p-8 space-y-8">
      <div>
        <span className="inline-block bg-primary-fixed/60 px-3 py-1 rounded-full text-[0.6rem] font-bold uppercase tracking-widest text-primary mb-3">
          {t("eyebrow")}
        </span>
        <h1 className="font-headline font-extrabold text-4xl md:text-5xl tracking-tight leading-[1.05]">
          {t("heading")}
        </h1>
        <p className="text-on-surface/60 mt-2">{t("subtitle")}</p>
      </div>

      <RevenueCards
        title={t("revenue.title")}
        netLabel={t("revenue.netLabel")}
        thirtyDay={{
          label: t("revenue.last30d"),
          value: formatPln(analytics.revenue.last30dCents, locale),
          net: formatPln(analytics.revenue.net30dCents, locale),
        }}
        ninetyDay={{
          label: t("revenue.last90d"),
          value: formatPln(analytics.revenue.last90dCents, locale),
          net: formatPln(analytics.revenue.net90dCents, locale),
        }}
        ytd={{
          label: t("revenue.ytd"),
          value: formatPln(analytics.revenue.ytdCents, locale),
          net: formatPln(analytics.revenue.netYtdCents, locale),
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6">
        <BookingsTrendChart
          title={t("trend.title")}
          subtitle={t("trend.subtitle")}
          emptyLabel={t("trend.empty")}
          tooltipLabel={t("trend.tooltipLabel")}
          data={analytics.trend}
        />
        <TopActivitiesList
          title={t("top.title")}
          subtitle={t("top.subtitle")}
          emptyLabel={t("top.empty")}
          bookingsLabel={t("top.bookingsLabel")}
          rows={topRows}
        />
      </div>

      <OccupancyHeatmap
        title={t("heatmap.title")}
        subtitle={t("heatmap.subtitle")}
        emptyLabel={t("heatmap.empty")}
        weekdayLabels={weekdayLabels}
        cells={analytics.heatmap}
      />
    </div>
  );
}
