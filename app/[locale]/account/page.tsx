import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  getBookingsByCurrentUser,
  getFavoriteActivities,
} from "@/src/lib/db/queries";
import { Icon } from "@/src/components/Icon";
import { Link } from "@/src/i18n/navigation";
import { getCurrentUser } from "@/src/lib/db/server";
import { getCalendarIntegration } from "@/src/lib/calendar/storage";

import AccountForms from "./AccountForms";

export const dynamic = "force-dynamic";

type ProfileHref = "/account/bookings" | "/account/favorites" | "/account/calendar";

type SummaryCard = {
  href: ProfileHref;
  icon: string;
  titleKey: string;
  value: string;
  subtitleKey: string;
  tone: "primary" | "tertiary" | "secondary";
};

const TONE_BG: Record<SummaryCard["tone"], string> = {
  primary: "bg-primary-fixed text-primary",
  tertiary: "bg-tertiary-container text-on-tertiary-container",
  secondary: "bg-secondary-fixed text-on-secondary-fixed",
};

export default async function AccountProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const current = await getCurrentUser();
  if (!current) return null;

  const t = await getTranslations({ locale, namespace: "Account" });
  const dbLocale = locale === "en" ? "en" : "pl";

  const [bookings, favorites, calendar] = await Promise.all([
    getBookingsByCurrentUser(dbLocale, 200),
    getFavoriteActivities(dbLocale),
    getCalendarIntegration(current.user.id),
  ]);
  // Server component; recomputing per request is the correct semantics.
  // eslint-disable-next-line react-hooks/purity
  const nowMs = Date.now();
  const upcomingCount = bookings.filter(
    (b) =>
      b.status !== "cancelled" &&
      b.status !== "expired" &&
      new Date(b.session.startsAt).getTime() >= nowMs,
  ).length;

  const calendarStatus =
    calendar === null
      ? t("calendar.status.disconnected")
      : calendar.syncEnabled
        ? t("calendar.status.connected")
        : t("calendar.status.paused");

  const summary: SummaryCard[] = [
    {
      href: "/account/bookings",
      icon: "event",
      titleKey: "summary.upcomingBookings",
      value: String(upcomingCount),
      subtitleKey: "summary.upcomingBookingsSub",
      tone: "primary",
    },
    {
      href: "/account/favorites",
      icon: "favorite",
      titleKey: "summary.savedActivities",
      value: String(favorites.length),
      subtitleKey: "summary.savedActivitiesSub",
      tone: "tertiary",
    },
    {
      href: "/account/calendar",
      icon: "calendar_month",
      titleKey: "summary.calendar",
      value: calendarStatus,
      subtitleKey: "summary.calendarSub",
      tone: "secondary",
    },
  ];

  const deletionRequestedAt = current.profile?.deletion_requested_at as
    | string
    | undefined;
  const deletionReadableDate = deletionRequestedAt
    ? new Date(
        new Date(deletionRequestedAt).getTime() + 30 * 24 * 60 * 60 * 1000,
      ).toLocaleDateString(locale)
    : null;

  return (
    <div className="space-y-10 md:space-y-14">
      {/* Snapshot rail */}
      <section>
        <div className="flex items-end justify-between mb-5">
          <h2 className="font-headline font-bold text-2xl md:text-3xl tracking-tight">
            {t("summary.title")}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {summary.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group bg-surface-container-lowest rounded-[1.75rem] p-6 border border-on-surface/[0.06] editorial-shadow hover:-translate-y-0.5 transition-transform duration-200 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${TONE_BG[card.tone]}`}
                >
                  <Icon
                    name={card.icon}
                    filled={card.icon === "favorite"}
                    className="text-[24px]"
                  />
                </span>
                <Icon
                  name="arrow_forward"
                  className="text-[20px] text-on-surface/40 group-hover:text-primary group-hover:translate-x-1 transition-all"
                />
              </div>
              <div>
                <p className="text-[0.7rem] font-bold uppercase tracking-widest text-on-surface/50 mb-1">
                  {t(card.titleKey)}
                </p>
                <p className="font-headline font-extrabold text-2xl md:text-3xl text-on-surface leading-none">
                  {card.value}
                </p>
                <p className="text-sm text-on-surface/60 mt-2">
                  {t(card.subtitleKey)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Account management */}
      <section>
        <div className="mb-5">
          <h2 className="font-headline font-bold text-2xl md:text-3xl tracking-tight">
            {t("management.title")}
          </h2>
          <p className="text-on-surface/60 mt-1">{t("management.subtitle")}</p>
        </div>
        <AccountForms
          locale={locale}
          deletionPending={!!deletionRequestedAt}
          deletionDate={deletionReadableDate}
        />
      </section>
    </div>
  );
}
