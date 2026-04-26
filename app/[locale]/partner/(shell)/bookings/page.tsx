import { getTranslations, setRequestLocale } from "next-intl/server";

import { Icon } from "@/app/components/Icon";
import {
  getBookingsByPartner,
  type PartnerBookingRow_UI,
} from "@/src/lib/db/queries";
import { getPartnerIdForCurrentUser } from "@/src/lib/db/queries/analytics";
import { routing } from "@/src/i18n/routing";
import type { Locale } from "@/src/lib/db/types";

function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value);
}

function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
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

const STATUS_TONE: Record<PartnerBookingRow_UI["status"], string> = {
  pending: "bg-secondary-container text-on-secondary-container",
  confirmed: "bg-tertiary-container text-on-tertiary-container",
  cancelled: "bg-error-container/40 text-on-error-container",
  expired: "bg-surface-container-high text-on-surface/60",
};

export default async function PartnerBookingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale: Locale = isLocale(raw) ? raw : "pl";

  const t = await getTranslations({ locale, namespace: "Partner.bookings" });
  const tStatus = await getTranslations({
    locale,
    namespace: "BookingDetail.status",
  });

  const partnerId = await getPartnerIdForCurrentUser();
  const bookings = partnerId
    ? await getBookingsByPartner(partnerId, locale)
    : [];

  return (
    <div className="p-8">
      <div className="mb-6">
        <span className="inline-block bg-primary-fixed/60 px-3 py-1 rounded-full text-[0.6rem] font-bold uppercase tracking-widest text-primary mb-3">
          {t("badge", { count: bookings.length })}
        </span>
        <h1 className="font-headline font-extrabold text-4xl tracking-tight">
          {t("title")}
        </h1>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl border border-[#FAEEDA] p-12 text-center text-on-surface/60">
          {t("emptyState")}
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-2xl border border-[#FAEEDA] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-low text-[0.6rem] font-bold uppercase tracking-widest text-on-surface/60">
              <tr>
                <th className="text-left px-5 py-3">{t("col.activity")}</th>
                <th className="text-left px-5 py-3">{t("col.session")}</th>
                <th className="text-left px-5 py-3">{t("col.amount")}</th>
                <th className="text-left px-5 py-3">{t("col.status")}</th>
                <th className="text-left px-5 py-3">{t("col.created")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-on-surface/5">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-surface-container-low/50">
                  <td className="px-5 py-3">
                    <div className="font-headline font-bold text-on-surface">
                      {b.activityTitle}
                    </div>
                    <div className="text-[0.7rem] text-on-surface/50 flex items-center gap-1">
                      <Icon name="place" className="text-[12px]" />
                      {b.venueName}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-on-surface/80">
                    {formatDate(b.startsAt, locale)}
                  </td>
                  <td className="px-5 py-3 font-bold">
                    {formatAmount(b.amountCents, b.currency, locale)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase tracking-widest ${STATUS_TONE[b.status]}`}
                    >
                      {tStatus(b.status)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-on-surface/60">
                    {formatDate(b.createdAt, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
