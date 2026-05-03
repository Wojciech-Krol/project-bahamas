import { getTranslations, setRequestLocale } from "next-intl/server";

import { Icon } from "@/src/components/Icon";
import { createClient, getCurrentUser } from "@/src/lib/db/server";

import ResourceTabs from "./ResourceTabs";

export const dynamic = "force-dynamic";

type RecentJob = {
  id: string;
  resource_type: string;
  status: string;
  total_rows: number | null;
  successful_rows: number | null;
  error_count: number | null;
  started_at: string;
};

export default async function PartnerImportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const normalisedLocale: "pl" | "en" = locale === "en" ? "en" : "pl";
  const t = await getTranslations({
    locale: normalisedLocale,
    namespace: "Partner.import",
  });

  const current = await getCurrentUser();
  if (!current) {
    return (
      <div className="p-8">
        <h1 className="font-headline font-extrabold text-3xl tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-3 text-on-surface/65">{t("authRequired")}</p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: memberships } = await supabase
    .from("partner_members")
    .select("partner_id")
    .eq("user_id", current.user.id)
    .limit(1);
  const partnerId = (memberships?.[0] as { partner_id: string } | undefined)
    ?.partner_id;

  if (!partnerId) {
    return (
      <div className="p-8">
        <h1 className="font-headline font-extrabold text-3xl tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-3 text-on-surface/65">{t("noPartner")}</p>
      </div>
    );
  }

  const { data: recent } = await supabase
    .from("pos_import_jobs")
    .select(
      "id, resource_type, status, total_rows, successful_rows, error_count, started_at",
    )
    .eq("partner_id", partnerId)
    .order("started_at", { ascending: false })
    .limit(10);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <header className="mb-8">
        <span className="inline-block bg-primary-fixed/60 px-4 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-widest text-primary mb-3">
          {t("badge")}
        </span>
        <h1 className="font-headline font-extrabold text-3xl md:text-4xl tracking-tight">
          {t("title")}
        </h1>
        <p className="text-on-surface/60 mt-2">{t("subtitle")}</p>
      </header>

      <ResourceTabs partnerId={partnerId} locale={normalisedLocale} />

      {recent && recent.length > 0 && (
        <section className="mt-12">
          <h2 className="font-headline font-bold text-xl mb-4">
            {t("recent.title")}
          </h2>
          <div className="rounded-[1.5rem] bg-surface-container-lowest border border-on-surface/[0.06] editorial-shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="text-[0.7rem] font-bold uppercase tracking-widest text-on-surface/55 bg-surface-container-low">
                <tr>
                  <th className="text-left px-4 py-3">{t("recent.resource")}</th>
                  <th className="text-left px-4 py-3">{t("recent.status")}</th>
                  <th className="text-right px-4 py-3">{t("recent.rows")}</th>
                  <th className="text-right px-4 py-3">{t("recent.errors")}</th>
                  <th className="text-right px-4 py-3">{t("recent.when")}</th>
                </tr>
              </thead>
              <tbody>
                {(recent as RecentJob[]).map((j) => (
                  <tr
                    key={j.id}
                    className="border-t border-on-surface/[0.06]"
                  >
                    <td className="px-4 py-3 font-semibold capitalize">
                      {j.resource_type}
                    </td>
                    <td className="px-4 py-3">
                      <StatusChip status={j.status} t={t} />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {j.successful_rows ?? 0} / {j.total_rows ?? 0}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {j.error_count ?? 0}
                    </td>
                    <td className="px-4 py-3 text-right text-on-surface/55 text-xs">
                      {new Intl.DateTimeFormat(
                        normalisedLocale === "pl" ? "pl-PL" : "en-GB",
                        { dateStyle: "short", timeStyle: "short" },
                      ).format(new Date(j.started_at))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function StatusChip({
  status,
  t,
}: {
  status: string;
  t: (k: string) => string;
}) {
  const tone =
    status === "completed"
      ? "bg-emerald-100 text-emerald-900"
      : status === "failed"
        ? "bg-red-100 text-red-900"
        : "bg-amber-100 text-amber-900";
  const icon =
    status === "completed"
      ? "check_circle"
      : status === "failed"
        ? "error"
        : "schedule";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold uppercase tracking-widest ${tone}`}
    >
      <Icon name={icon} className="text-[14px]" />
      {t(`recent.statusLabel.${status}`)}
    </span>
  );
}
