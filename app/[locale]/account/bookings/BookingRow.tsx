import { getTranslations } from "next-intl/server";

import type { BookingDetail } from "@/src/lib/db/queries";
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
  const dateLabel = new Intl.DateTimeFormat(intlLocale, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(startsAt);
  const priceLabel = new Intl.NumberFormat(intlLocale, {
    style: "currency",
    currency: booking.currency,
    maximumFractionDigits: 2,
  }).format(booking.amountCents / 100);

  return (
    <article className="rounded-2xl bg-surface-container-lowest border border-on-surface/10 p-4 md:p-5 flex flex-col md:flex-row gap-4 md:items-center">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-widest ${
              STATUS_TONE[booking.status]
            }`}
          >
            {t(`bookings.status.${booking.status}`)}
          </span>
          <span className="text-xs text-on-surface/50">{dateLabel}</span>
        </div>
        <h3 className="font-headline font-bold text-base text-on-surface line-clamp-1">
          {booking.activity.title}
        </h3>
        <p className="text-sm text-on-surface/70 line-clamp-1">
          {booking.venue.name}
          {booking.venue.location ? ` · ${booking.venue.location}` : ""}
        </p>
      </div>

      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        <span className="font-semibold text-primary">{priceLabel}</span>
        <Link
          href={{
            pathname: "/bookings/[id]",
            params: { id: booking.id },
          }}
          className="px-4 py-2 rounded-full bg-surface-container-low text-on-surface text-xs font-bold hover:bg-primary-fixed transition-colors"
        >
          {t("bookings.viewDetail")}
        </Link>
      </div>
    </article>
  );
}
