import { getTranslations, setRequestLocale } from "next-intl/server";

import { Icon } from "@/app/components/Icon";
import { Link } from "@/src/i18n/navigation";
import {
  getPartnerIdForCurrentUser,
  getPartnerNetSummary,
} from "@/src/lib/db/queries/analytics";
import { getPartnerProfile } from "@/src/lib/db/queries";
import { listPartnerPayouts } from "@/src/lib/payments/stripePayouts";
import { routing } from "@/src/i18n/routing";
import type { Locale } from "@/src/lib/db/types";

export const dynamic = "force-dynamic";

function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value);
}

function formatPln(cents: number, locale: string): string {
  try {
    return new Intl.NumberFormat(locale === "pl" ? "pl-PL" : "en-GB", {
      style: "currency",
      currency: "PLN",
      maximumFractionDigits: 0,
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(0)} PLN`;
  }
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

function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

const STATUS_TONE: Record<string, string> = {
  paid: "bg-tertiary-container text-on-tertiary-container",
  pending: "bg-secondary-container text-on-secondary-container",
  in_transit: "bg-secondary-container text-on-secondary-container",
  failed: "bg-error-container/40 text-on-error-container",
  canceled: "bg-surface-container-high text-on-surface/60",
};

export default async function PartnerPayoutsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale: Locale = isLocale(raw) ? raw : "pl";

  const t = await getTranslations({ locale, namespace: "Partner.payouts" });

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

  const [profile, net] = await Promise.all([
    getPartnerProfile(partnerId),
    getPartnerNetSummary(partnerId),
  ]);

  const accountId = profile?.stripeAccountId ?? null;
  const payouts = accountId ? await listPartnerPayouts(accountId) : null;

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div>
        <span className="inline-block bg-primary-fixed/60 px-3 py-1 rounded-full text-[0.6rem] font-bold uppercase tracking-widest text-primary mb-3">
          {t("badge")}
        </span>
        <h1 className="font-headline font-extrabold text-4xl tracking-tight">
          {t("title")}
        </h1>
        <p className="text-on-surface/60 mt-2">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Tile label={t("net.last30d")} value={formatPln(net.last30dCents, locale)} />
        <Tile label={t("net.last90d")} value={formatPln(net.last90dCents, locale)} />
        <Tile label={t("net.ytd")} value={formatPln(net.ytdCents, locale)} />
        <Tile label={t("net.lifetime")} value={formatPln(net.lifetimeCents, locale)} />
      </div>

      <section>
        <h2 className="font-headline font-bold text-2xl mb-4">
          {t("stripe.title")}
        </h2>

        {!accountId && (
          <ConnectCta
            title={t("stripe.notConnected")}
            body={t("stripe.notConnectedBody")}
            cta={t("stripe.connectCta")}
          />
        )}

        {accountId && payouts === null && (
          <div className="bg-surface-container-lowest rounded-2xl border border-[#FAEEDA] p-6 text-on-surface/60">
            {t("stripe.unavailable")}
          </div>
        )}

        {accountId && payouts && payouts.length === 0 && (
          <div className="bg-surface-container-lowest rounded-2xl border border-[#FAEEDA] p-6 text-on-surface/60">
            {t("stripe.empty")}
          </div>
        )}

        {accountId && payouts && payouts.length > 0 && (
          <div className="bg-surface-container-lowest rounded-2xl border border-[#FAEEDA] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low text-[0.6rem] font-bold uppercase tracking-widest text-on-surface/60">
                <tr>
                  <th className="text-left px-5 py-3">{t("col.amount")}</th>
                  <th className="text-left px-5 py-3">{t("col.arrival")}</th>
                  <th className="text-left px-5 py-3">{t("col.status")}</th>
                  <th className="text-left px-5 py-3">{t("col.descriptor")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-on-surface/5">
                {payouts.map((p) => (
                  <tr key={p.id}>
                    <td className="px-5 py-3 font-bold">
                      {formatAmount(p.amountCents, p.currency, locale)}
                    </td>
                    <td className="px-5 py-3 text-on-surface/80">
                      {formatDate(p.arrivalDate, locale)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase tracking-widest ${
                          STATUS_TONE[p.status] ??
                          "bg-surface-container-high text-on-surface/60"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-on-surface/60 font-mono text-xs">
                      {p.statementDescriptor ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-[#FAEEDA] p-5">
      <div className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface/50 mb-2">
        {label}
      </div>
      <div className="font-headline font-extrabold text-2xl text-on-surface">
        {value}
      </div>
    </div>
  );
}

function ConnectCta({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta: string;
}) {
  return (
    <div className="bg-secondary-container/40 border border-secondary/30 rounded-2xl p-6 flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0">
        <Icon name="account_balance" className="text-[20px]" />
      </div>
      <div className="flex-1">
        <div className="font-headline font-bold text-lg mb-1">{title}</div>
        <p className="text-sm text-on-surface/70 mb-4">{body}</p>
        <Link
          href="/partner/payments"
          className="inline-block bg-primary text-on-primary px-5 py-2.5 rounded-xl font-headline uppercase tracking-widest text-[0.7rem] font-bold hover:bg-tertiary"
        >
          {cta}
        </Link>
      </div>
    </div>
  );
}
