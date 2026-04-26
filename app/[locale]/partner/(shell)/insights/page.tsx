import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  getPartnerAnalytics,
  getPartnerIdForCurrentUser,
} from "@/src/lib/db/queries/analytics";
import { pick } from "@/src/lib/db/queries/_i18n";
import { createClient } from "@/src/lib/db/server";
import { routing } from "@/src/i18n/routing";
import type { Locale } from "@/src/lib/db/types";

import BookingsTrendChart from "@/app/components/partner/analytics/BookingsTrendChart";
import OccupancyHeatmap from "@/app/components/partner/analytics/OccupancyHeatmap";
import TopActivitiesList from "@/app/components/partner/analytics/TopActivitiesList";

function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value);
}

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

export default async function PartnerInsightsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale: Locale = isLocale(raw) ? raw : "pl";

  const t = await getTranslations({ locale, namespace: "Partner.insights" });
  const tAnalytics = await getTranslations({
    locale,
    namespace: "Partner.analytics",
  });

  const partnerId = await getPartnerIdForCurrentUser();
  if (!partnerId) {
    return (
      <div className="p-8">
        <div className="bg-surface-container-lowest rounded-2xl border border-[#FAEEDA] p-12 text-center text-on-surface/60">
          {t("emptyPartner")}
        </div>
      </div>
    );
  }

  const analytics = await getPartnerAnalytics(partnerId);

  // Resolve activity titles for the top list — same pattern as overview.
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
            pick(row.title_i18n, locale) ?? row.id,
          ]),
        );
      }
    } catch {
      // ignore — fall through to ids
    }
  }

  // Derived metrics — sit on top of the same dataset so we don't fan out
  // additional queries.
  const trendBookings30d = analytics.trend.reduce((acc, p) => acc + p.count, 0);
  const avgBookingCents =
    trendBookings30d > 0
      ? Math.round(analytics.revenue.last30dCents / trendBookings30d)
      : 0;
  const totalActivityBookings = analytics.topActivities.reduce(
    (acc, r) => acc + r.bookingCount,
    0,
  );

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

  const weekdayLabels = tAnalytics.raw("weekdays") as string[];

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <div>
        <span className="inline-block bg-primary-fixed/60 px-3 py-1 rounded-full text-[0.6rem] font-bold uppercase tracking-widest text-primary mb-3">
          {t("badge")}
        </span>
        <h1 className="font-headline font-extrabold text-4xl md:text-5xl tracking-tight leading-[1.05]">
          {t("title")}
        </h1>
        <p className="text-on-surface/60 mt-2">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Tile label={t("kpis.bookings30d")} value={String(trendBookings30d)} />
        <Tile
          label={t("kpis.avgBooking")}
          value={formatPln(avgBookingCents, locale)}
        />
        <Tile
          label={t("kpis.totalGrossYtd")}
          value={formatPln(analytics.revenue.ytdCents, locale)}
        />
        <Tile
          label={t("kpis.activityBookings")}
          value={String(totalActivityBookings)}
        />
      </div>

      <BookingsTrendChart
        title={t("trend.title")}
        subtitle={t("trend.subtitle")}
        emptyLabel={tAnalytics("trend.empty")}
        tooltipLabel={tAnalytics("trend.tooltipLabel")}
        data={analytics.trend}
      />

      <TopActivitiesList
        title={t("top.title")}
        subtitle={t("top.subtitle")}
        emptyLabel={tAnalytics("top.empty")}
        bookingsLabel={tAnalytics("top.bookingsLabel")}
        rows={topRows}
      />

      <OccupancyHeatmap
        title={t("heatmap.title")}
        subtitle={t("heatmap.subtitle")}
        emptyLabel={tAnalytics("heatmap.empty")}
        weekdayLabels={weekdayLabels}
        cells={analytics.heatmap}
      />
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-[#FAEEDA] p-5">
      <div className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface/50 mb-2">
        {label}
      </div>
      <div className="font-headline font-extrabold text-3xl text-on-surface">
        {value}
      </div>
    </div>
  );
}
