import { notFound, redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";

import SiteFooter from "@/app/components/SiteFooter";
import SiteNavbar from "@/app/components/SiteNavbar";
import { Icon } from "@/app/components/Icon";
import { Link } from "@/src/i18n/navigation";
import { getBookingById } from "@/src/lib/db/queries";
import { getCurrentUser } from "@/src/lib/db/server";
import { routing } from "@/src/i18n/routing";
import type { Locale } from "@/src/lib/db/types";

import CancelBookingButton from "./CancelBookingButton";

const CANCEL_CUTOFF_MS = 48 * 60 * 60 * 1000;

function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value);
}

function formatDateTime(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatAmount(cents: number, currency: string, locale: Locale): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}

export default async function BookingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ checkout?: string }>;
}) {
  const [{ locale: raw, id }, sp] = await Promise.all([params, searchParams]);
  setRequestLocale(raw);
  const locale: Locale = isLocale(raw) ? raw : "pl";

  const current = await getCurrentUser();
  if (!current) {
    const next = encodeURIComponent(`/${locale}/bookings/${id}`);
    redirect(`/${locale}/login?next=${next}`);
  }

  const booking = await getBookingById(id, locale);
  if (!booking) notFound();

  if (booking.userId !== current.user.id) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "BookingDetail" });
  const checkoutFlag = sp.checkout === "success" || sp.checkout === "cancelled"
    ? sp.checkout
    : null;

  const banner =
    checkoutFlag === "success"
      ? { tone: "success" as const, title: t("checkoutSuccessTitle"), body: t("checkoutSuccessBody") }
      : checkoutFlag === "cancelled"
      ? { tone: "warning" as const, title: t("checkoutCancelledTitle"), body: t("checkoutCancelledBody") }
      : null;

  const statusKey = `status.${booking.status}` as const;
  const canCancel =
    booking.status === "confirmed" &&
    new Date(booking.session.startsAt).getTime() > Date.now() + CANCEL_CUTOFF_MS;

  return (
    <>
      <SiteNavbar />
      <main className="pt-24 pb-20 max-w-3xl mx-auto px-4 md:px-6">
        <h1 className="font-headline font-extrabold text-3xl md:text-5xl tracking-tight text-on-surface mb-2">
          {t("title")}
        </h1>
        <p className="text-on-surface/60 mb-8">
          {t("referenceLabel")}{" "}
          <code className="font-mono text-sm bg-surface-container-low px-2 py-0.5 rounded">
            {booking.id.slice(0, 8)}
          </code>
        </p>

        {banner && (
          <div
            role="status"
            className={`mb-8 rounded-2xl p-5 border ${
              banner.tone === "success"
                ? "bg-tertiary-container/40 border-tertiary/30 text-on-tertiary-container"
                : "bg-secondary-container/40 border-secondary/30 text-on-secondary-container"
            }`}
          >
            <div className="font-headline font-bold text-lg mb-1">
              {banner.title}
            </div>
            <p className="text-sm">{banner.body}</p>
          </div>
        )}

        <article className="bg-surface-container-lowest rounded-[2rem] editorial-shadow border border-on-surface/[0.05] overflow-hidden">
          {booking.activity.heroImage && (
            <img
              src={booking.activity.heroImage}
              alt=""
              className="w-full h-48 md:h-64 object-cover"
            />
          )}
          <div className="p-6 md:p-8 space-y-6">
            <div>
              <Link
                href={`/activity/${booking.activity.id}`}
                className="text-sm font-bold uppercase tracking-widest text-primary hover:underline"
              >
                {booking.activity.title}
              </Link>
              <h2 className="font-headline font-bold text-2xl md:text-3xl text-on-surface mt-1">
                {booking.venue.name}
              </h2>
              {booking.venue.location && (
                <div className="flex items-center gap-2 text-on-surface/70 mt-2">
                  <Icon name="location_on" className="text-[18px] text-primary" />
                  <span className="text-sm">{booking.venue.location}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-surface-container-low rounded-2xl p-4">
                <div className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface/50 mb-1">
                  {t("whenLabel")}
                </div>
                <div className="font-bold text-on-surface">
                  {formatDateTime(booking.session.startsAt, locale)}
                </div>
              </div>
              <div className="bg-surface-container-low rounded-2xl p-4">
                <div className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface/50 mb-1">
                  {t("amountLabel")}
                </div>
                <div className="font-bold text-on-surface">
                  {formatAmount(booking.amountCents, booking.currency, locale)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-4 border-t border-on-surface/[0.06]">
              <div>
                <div className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface/50 mb-1">
                  {t("statusLabel")}
                </div>
                <div className="font-bold text-on-surface">{t(statusKey)}</div>
              </div>
              <Link
                href="/"
                className="text-sm font-bold uppercase tracking-widest text-primary hover:underline"
              >
                {t("backHome")}
              </Link>
            </div>

            {canCancel && (
              <div className="pt-4 border-t border-on-surface/[0.06]">
                <CancelBookingButton bookingId={booking.id} />
              </div>
            )}
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
