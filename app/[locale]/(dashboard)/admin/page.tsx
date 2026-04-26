import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";

import { createClient } from "@/src/lib/db/server";
import { approvePartner, rejectPartner } from "./actions";

// Admin dashboard is per-request and gated on session — never prerender it.
// `getCurrentUser()` in the layout touches cookies anyway, but we're explicit
// to avoid ambiguity and so the build doesn't try to statically export a page
// that legitimately cannot exist without a live DB + authenticated admin.
export const dynamic = "force-dynamic";

/**
 * Admin dashboard — list pending partner applications.
 *
 * Server Component. The request-scoped Supabase client is used instead of
 * the service role client — the layout already gated entry on
 * `profile.role === 'admin'`, and the `partners` RLS policy grants admins
 * full SELECT access via the `is_admin()` helper. Staying on the
 * user-scoped client keeps the audit trail honest (service role is a
 * tenant-boundary escape hatch, not the default).
 */

type PendingPartner = {
  id: string;
  name: string;
  contact_email: string;
  city: string | null;
  created_at: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin" });
  return {
    title: t("page.title"),
    robots: { index: false, follow: false },
  };
}

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Admin" });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partners")
    .select("id, name, contact_email, city, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(100);

  const partners = (data ?? []) as PendingPartner[];

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-bold text-on-surface">
          {t("page.title")}
        </h1>
        <p className="text-on-surface/70">{t("page.subtitle")}</p>
      </header>

      {error ? (
        <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary">
          {t("errors.generic")}
        </div>
      ) : null}

      {partners.length === 0 ? (
        <div className="rounded-xl border border-dashed border-on-surface/20 bg-surface-container-lowest px-6 py-12 text-center">
          <p className="text-on-surface/70">{t("page.empty")}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-on-surface/10 bg-surface-container-lowest">
          <table className="w-full text-left text-sm">
            <thead className="bg-on-surface/5 text-xs uppercase tracking-wide text-on-surface/60">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  {t("columns.name")}
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  {t("columns.email")}
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  {t("columns.city")}
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  {t("columns.applied")}
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-right">
                  {t("columns.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-on-surface/10">
              {partners.map((p) => (
                <PartnerRow key={p.id} partner={p} locale={locale} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PartnerRow({
  partner,
  locale,
}: {
  partner: PendingPartner;
  locale: string;
}) {
  return (
    <tr className="align-top">
      <td className="px-4 py-4 font-medium text-on-surface">{partner.name}</td>
      <td className="px-4 py-4 text-on-surface/80">
        <a
          href={`mailto:${partner.contact_email}`}
          className="hover:text-primary hover:underline"
        >
          {partner.contact_email}
        </a>
      </td>
      <td className="px-4 py-4 text-on-surface/80">{partner.city ?? "—"}</td>
      <td className="px-4 py-4 text-on-surface/70 whitespace-nowrap">
        <FormattedDate iso={partner.created_at} />
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-end gap-2">
          <ApproveForm partnerId={partner.id} locale={locale} />
          <RejectForm partnerId={partner.id} locale={locale} />
        </div>
      </td>
    </tr>
  );
}

function FormattedDate({ iso }: { iso: string }) {
  const d = new Date(iso);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  return <time dateTime={iso}>{`${dd}.${mm}.${yyyy}`}</time>;
}

async function ApproveForm({
  partnerId,
  locale,
}: {
  partnerId: string;
  locale: string;
}) {
  const t = await getTranslations({ locale, namespace: "Admin" });
  return (
    <form action={approvePartner}>
      <input type="hidden" name="partner_id" value={partnerId} />
      <input type="hidden" name="locale" value={locale} />
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:bg-primary/90 transition-colors"
      >
        {t("actions.approve")}
      </button>
    </form>
  );
}

async function RejectForm({
  partnerId,
  locale,
}: {
  partnerId: string;
  locale: string;
}) {
  const t = await getTranslations({ locale, namespace: "Admin" });
  return (
    <details className="group">
      <summary className="list-none cursor-pointer inline-flex items-center justify-center rounded-full border border-on-surface/20 px-4 py-2 text-sm font-semibold text-on-surface hover:bg-on-surface/5 transition-colors">
        {t("actions.reject")}
      </summary>
      <form action={rejectPartner} className="mt-3 space-y-2 md:w-64">
        <input type="hidden" name="partner_id" value={partnerId} />
        <input type="hidden" name="locale" value={locale} />
        <label className="block text-xs font-medium text-on-surface/70">
          {t("reject.reasonLabel")}
        </label>
        <textarea
          name="reason"
          maxLength={500}
          rows={3}
          placeholder={t("reject.reasonPlaceholder")}
          className="w-full rounded-lg border border-on-surface/20 bg-surface px-3 py-2 text-sm text-on-surface placeholder:text-on-surface/40 focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          type="submit"
          className="w-full inline-flex items-center justify-center rounded-full border border-on-surface/30 px-4 py-2 text-sm font-semibold text-on-surface hover:bg-on-surface/5 transition-colors"
        >
          {t("reject.confirm")}
        </button>
      </form>
    </details>
  );
}
