import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  getBookingsByCurrentUser,
  type BookingDetail,
} from "@/src/lib/db/queries";
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
  // Upcoming sorted by soonest first; past by most recent.
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
    <>
      <header className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold mb-2">
            {t("bookings.title")}
          </h1>
          <p className="text-on-surface/70">{t("bookings.subtitle")}</p>
        </div>
        {bookings.length > 0 && (
          <a
            href={`/api/account/export?type=bookings`}
            className="text-sm font-semibold text-primary underline underline-offset-2"
          >
            {t("bookings.exportCsv")}
          </a>
        )}
      </header>

      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-on-surface/20 p-10 text-center">
          <p className="text-on-surface/60 mb-4">{t("bookings.empty")}</p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-full bg-primary text-on-primary px-5 py-2.5 text-sm font-bold"
          >
            {t("bookings.browseCta")}
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {upcoming.length > 0 && (
            <section>
              <h2 className="font-headline text-lg font-semibold mb-3">
                {t("bookings.upcoming")}
              </h2>
              <div className="space-y-3">
                {upcoming.map((b) => (
                  <BookingRow key={b.id} booking={b} locale={locale} />
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="font-headline text-lg font-semibold mb-3">
                {t("bookings.past")}
              </h2>
              <div className="space-y-3 opacity-80">
                {past.map((b) => (
                  <BookingRow key={b.id} booking={b} locale={locale} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </>
  );
}
