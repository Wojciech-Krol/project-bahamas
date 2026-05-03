import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  getBookingsByCurrentUser,
  type BookingDetail,
} from "@/src/lib/db/queries";
import { Icon } from "@/src/components/Icon";
import { Link } from "@/src/i18n/navigation";

import BookingRow from "./BookingRow";

export const dynamic = "force-dynamic";

function partition(rows: BookingDetail[]): {
  upcoming: BookingDetail[];
  past: BookingDetail[];
} {
  const now = Date.now();
  const upcoming: BookingDetail[] = [];
  const past: BookingDetail[] = [];
  for (const b of rows) {
    const startsMs = new Date(b.session.startsAt).getTime();
    if (
      b.status !== "cancelled" &&
      b.status !== "expired" &&
      startsMs >= now
    ) {
      upcoming.push(b);
    } else {
      past.push(b);
    }
  }
  upcoming.sort(
    (a, b) =>
      new Date(a.session.startsAt).getTime() -
      new Date(b.session.startsAt).getTime(),
  );
  past.sort(
    (a, b) =>
      new Date(b.session.startsAt).getTime() -
      new Date(a.session.startsAt).getTime(),
  );
  return { upcoming, past };
}

export default async function AccountBookingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Account" });
  const bookings = await getBookingsByCurrentUser(
    locale === "en" ? "en" : "pl",
  );
  const { upcoming, past } = partition(bookings);

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-headline font-bold text-2xl md:text-3xl tracking-tight">
            {t("bookings.title")}
          </h2>
          <p className="text-on-surface/60 mt-1">{t("bookings.subtitle")}</p>
        </div>
        {bookings.length > 0 && (
          <a
            href={`/api/account/export?type=bookings`}
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all"
          >
            <Icon name="download" className="text-[18px]" />
            {t("bookings.exportCsv")}
          </a>
        )}
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-on-surface/20 bg-surface-container-lowest/50 p-12 text-center editorial-shadow">
          <span className="inline-flex w-16 h-16 rounded-2xl bg-primary-fixed text-primary items-center justify-center mb-5">
            <Icon name="event" className="text-[28px]" />
          </span>
          <h3 className="font-headline font-bold text-xl text-on-surface mb-2">
            {t("bookings.empty")}
          </h3>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 mt-3 rounded-full bg-primary text-on-primary px-6 py-3 text-sm font-headline uppercase tracking-widest font-bold hover:bg-tertiary transition-colors"
          >
            <Icon name="search" className="text-[18px]" />
            {t("bookings.browseCta")}
          </Link>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                <h3 className="font-headline font-bold text-lg text-on-surface">
                  {t("bookings.upcoming")}
                </h3>
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface/40">
                  {upcoming.length}
                </span>
              </div>
              <div className="space-y-3">
                {upcoming.map((b) => (
                  <BookingRow key={b.id} booking={b} locale={locale} />
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-block w-2 h-2 rounded-full bg-on-surface/30" />
                <h3 className="font-headline font-bold text-lg text-on-surface/70">
                  {t("bookings.past")}
                </h3>
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface/40">
                  {past.length}
                </span>
              </div>
              <div className="space-y-3 opacity-90">
                {past.map((b) => (
                  <BookingRow key={b.id} booking={b} locale={locale} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
