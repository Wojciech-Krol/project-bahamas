import { getTranslations } from "next-intl/server";

import type { BookingDetail } from "@/src/lib/db/queries";
import { Icon } from "@/src/components/Icon";
import { Link } from "@/src/i18n/navigation";

type BookingRowProps = {
  booking: BookingDetail;
  locale: string;
};

const STATUS_TONE: Record<BookingDetail["status"], string> = {
  pending: "bg-amber-100 text-amber-900",
  confirmed: "bg-emerald-100 text-emerald-900",
  cancelled: "bg-on-surface/[0.08] text-on-surface/60",
  expired: "bg-on-surface/[0.08] text-on-surface/60",
};

export default async function BookingRow({
  booking,
  locale,
}: BookingRowProps) {
  const t = await getTranslations({ locale, namespace: "Account" });
  const intlLocale = locale === "pl" ? "pl-PL" : "en-GB";
  const startsAt = new Date(booking.session.startsAt);
  const dayLabel = new Intl.DateTimeFormat(intlLocale, {
    day: "2-digit",
  }).format(startsAt);
  const monthLabel = new Intl.DateTimeFormat(intlLocale, {
    month: "short",
  }).format(startsAt);
  const weekdayLabel = new Intl.DateTimeFormat(intlLocale, {
    weekday: "long",
  }).format(startsAt);
  const timeLabel = new Intl.DateTimeFormat(intlLocale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(startsAt);
  const priceLabel = new Intl.NumberFormat(intlLocale, {
    style: "currency",
    currency: booking.currency,
    maximumFractionDigits: 2,
  }).format(booking.amountCents / 100);

  return (
    <article className="rounded-[1.5rem] bg-surface-container-lowest border border-on-surface/[0.06] editorial-shadow p-4 md:p-5 flex gap-4 md:gap-5 items-stretch hover:-translate-y-0.5 transition-transform duration-200">
      {/* Calendar tile — visual anchor for the booking */}
      <div className="shrink-0 w-16 md:w-20 rounded-2xl bg-primary-fixed text-primary flex flex-col items-center justify-center py-2">
        <span className="text-[0.6rem] font-bold uppercase tracking-widest leading-none">
          {monthLabel}
        </span>
        <span className="font-headline font-extrabold text-2xl md:text-3xl leading-tight">
          {dayLabel}
        </span>
        <span className="text-[0.65rem] font-semibold opacity-80 leading-none">
          {timeLabel}
        </span>
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-widest ${
              STATUS_TONE[booking.status]
            }`}
          >
            {t(`bookings.status.${booking.status}`)}
          </span>
          <span className="text-xs text-on-surface/50 capitalize">
            {weekdayLabel}
          </span>
        </div>
        <h4 className="font-headline font-bold text-base md:text-lg text-on-surface line-clamp-1">
          {booking.activity.title}
        </h4>
        <p className="text-sm text-on-surface/65 flex items-center gap-1 mt-0.5 min-w-0">
          <Icon name="location_on" className="text-[14px] shrink-0 text-primary" />
          <span className="truncate">
            {booking.venue.name}
            {booking.venue.location ? ` · ${booking.venue.location}` : ""}
          </span>
        </p>
      </div>

      <div className="shrink-0 flex flex-col items-end justify-between gap-2 ml-2">
        <span className="font-headline font-bold text-primary text-lg">
          {priceLabel}
        </span>
        <Link
          href={{
            pathname: "/bookings/[id]",
            params: { id: booking.id },
          }}
          className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-surface-container-low text-on-surface text-xs font-bold hover:bg-primary hover:text-on-primary transition-colors"
        >
          {t("bookings.viewDetail")}
          <Icon name="arrow_forward" className="text-[14px]" />
        </Link>
      </div>
    </article>
  );
}
