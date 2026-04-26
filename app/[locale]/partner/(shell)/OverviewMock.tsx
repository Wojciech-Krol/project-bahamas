"use client";

/**
 * Pre-launch mock overview. Rendered by the server `page.tsx` when
 * Supabase env isn't configured (fresh clone / design previews).
 * When env is set, the server component swaps in the real analytics
 * dashboard instead.
 *
 * This is the original client component that was in `page.tsx` —
 * moved verbatim so the design reference keeps working exactly as
 * before.
 */

import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";
import { Icon } from "@/app/components/Icon";
import MetricCard from "@/app/components/partner/MetricCard";
import ScheduleRow from "@/app/components/partner/ScheduleRow";
import ActionQueueItem from "@/app/components/partner/ActionQueueItem";
import {
  OVERVIEW_METRICS,
  SPARKLINE_PATHS,
} from "@/src/lib/partnerMockData";

type ScheduleEntry = {
  id: string;
  time: string;
  duration: number;
  classKey: string;
  instructor: string;
  room: string;
  booked: number;
  capacity: number;
  waitlist?: number;
  accent: "primary" | "secondary";
};

function Sparkline({ fill, line }: { fill: string; line: string }) {
  return (
    <svg viewBox="0 0 120 32" className="w-full h-8">
      <path
        d={fill}
        stroke="none"
        className="fill-primary-fixed"
        style={{ opacity: 0.5 }}
      />
      <path d={line} fill="none" strokeWidth={2} className="stroke-primary" />
    </svg>
  );
}

function FillBar({ pct }: { pct: number }) {
  return (
    <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden flex">
      <div className="bg-primary h-full" style={{ width: `${pct}%` }} />
    </div>
  );
}

function StarRow() {
  return (
    <div className="flex gap-0.5 text-secondary-fixed-dim">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="material-symbols-outlined text-[16px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          star
        </span>
      ))}
    </div>
  );
}

export default function OverviewMock() {
  const t = useTranslations("Partner");
  const tOv = useTranslations("Partner.overview");
  const tMetric = useTranslations("Partner.overview.metrics");
  const tMock = useTranslations("Partner.mock");
  const tSchedMock = useTranslations("Partner.mock");
  const tClass = useTranslations("Partner.mock.classes");
  const tInst = useTranslations("Partner.mock.instructors");
  const tActions = useTranslations("Partner.overview.actions");

  const schedule = tSchedMock.raw("schedule") as ScheduleEntry[];
  const weekday = tMock("dateBadge.weekday");
  const dateLabel = tMock("dateBadge.date");
  const userFirst = tMock("user.firstName");

  const reviewsCount = 2;
  const classesToday = schedule.length;

  return (
    <div className="p-8">
      <div className="flex items-start justify-between gap-6 mb-8 flex-wrap">
        <div>
          <span className="inline-block bg-primary-fixed/60 px-3 py-1 rounded-full text-[0.6rem] font-bold uppercase tracking-widest text-primary mb-3">
            {tOv("dateBadge", { weekday, date: dateLabel })}
          </span>
          <h1 className="font-headline font-extrabold text-4xl md:text-5xl tracking-tight leading-[1.05]">
            {tOv("greetingStart")}{" "}
            <span className="italic text-primary">{userFirst}</span>
            {tOv("greetingEnd")}
          </h1>
          <p className="text-on-surface/60 mt-2">
            {tOv("subtitle", { classes: classesToday, reviews: reviewsCount })}
          </p>
        </div>
        <Link
          href="/partner/classes"
          className="bg-primary text-on-primary px-6 py-3 rounded-2xl font-headline uppercase tracking-widest text-[0.7rem] font-bold hover:bg-tertiary transition-colors flex items-center gap-2 shrink-0"
        >
          <Icon name="add" className="text-[18px]" />
          {t("common.newClass")}
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          eyebrow={tMetric("bookings")}
          icon="confirmation_number"
          value={OVERVIEW_METRICS.bookings.value}
          delta={{ text: OVERVIEW_METRICS.bookings.delta, positive: true }}
        >
          <Sparkline {...SPARKLINE_PATHS.bookings} />
        </MetricCard>
        <MetricCard
          eyebrow={tMetric("revenue")}
          icon="payments"
          iconTone="secondary"
          value={OVERVIEW_METRICS.revenue.value}
          delta={{ text: OVERVIEW_METRICS.revenue.delta, positive: true }}
        >
          <Sparkline {...SPARKLINE_PATHS.revenue} />
        </MetricCard>
        <MetricCard
          eyebrow={tMetric("fillRate")}
          icon="groups"
          value={OVERVIEW_METRICS.fillRate.value}
          delta={{ text: tMetric("ofCapacity"), muted: true }}
        >
          <FillBar pct={OVERVIEW_METRICS.fillRate.percent} />
        </MetricCard>
        <MetricCard
          eyebrow={tMetric("rating")}
          icon="star"
          iconTone="secondary"
          value={OVERVIEW_METRICS.rating.value}
          delta={{
            text: tMetric("reviewsCount", { count: OVERVIEW_METRICS.rating.count }),
            muted: true,
          }}
        >
          <StarRow />
        </MetricCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
        <div className="bg-surface-container-lowest rounded-2xl border border-[#FAEEDA] editorial-shadow overflow-hidden">
          <div className="p-6 pb-4 flex items-center justify-between">
            <div>
              <span className="text-[0.6rem] font-bold uppercase tracking-widest text-primary">
                {tOv("schedule.eyebrow")}
              </span>
              <h3 className="font-headline font-bold text-2xl tracking-tight">
                {tOv("schedule.heading")}
              </h3>
            </div>
            <button
              type="button"
              className="text-[0.7rem] font-bold uppercase tracking-widest text-primary hover:underline"
            >
              {t("common.viewWeek")}
            </button>
          </div>
          <div className="px-6 pb-6 space-y-3">
            {schedule.map((s) => (
              <ScheduleRow
                key={s.id}
                time={s.time}
                durationMinutes={s.duration}
                title={tClass(`${s.classKey}.title`)}
                instructor={tInst(`${s.instructor}.name`)}
                room={s.room}
                booked={s.booked}
                capacity={s.capacity}
                waitlist={s.waitlist}
                accent={s.accent}
              />
            ))}
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl border border-[#FAEEDA] editorial-shadow overflow-hidden">
          <div className="p-6 pb-4">
            <span className="text-[0.6rem] font-bold uppercase tracking-widest text-primary">
              {tOv("actions.eyebrow")}
            </span>
            <h3 className="font-headline font-bold text-2xl tracking-tight">
              {tOv("actions.heading")}
            </h3>
          </div>
          <div className="px-6 pb-6 space-y-3">
            <ActionQueueItem
              icon="reviews"
              tone="primary"
              title={tActions("reviewsReply", { count: 2 })}
              sub={tActions("reviewsOldest", { age: "2 days ago" })}
            />
            <ActionQueueItem
              icon="event_busy"
              tone="secondary"
              title={tActions("noInstructorTitle", { day: "Sat", time: "10:00" })}
              sub={tActions("noInstructorSub", {
                classTitle: tClass("kidsLab.title"),
              })}
            />
            <ActionQueueItem
              icon="trending_down"
              tone="primary"
              title={tActions("lowBookingsTitle", {
                classTitle: tClass("proLab.title"),
              })}
              sub={tActions("lowBookingsSub", {
                booked: 4,
                capacity: 16,
                day: "Sunday",
              })}
            />
            <ActionQueueItem
              icon="receipt_long"
              tone="muted"
              title={tActions("payoutTitle", { amount: "€1,840", day: "Monday" })}
              sub={tActions("payoutSub")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
