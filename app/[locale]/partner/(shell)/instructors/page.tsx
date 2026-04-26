import { getTranslations, setRequestLocale } from "next-intl/server";

import { Icon } from "@/app/components/Icon";
import { getPartnerMembers } from "@/src/lib/db/queries";
import { getPartnerIdForCurrentUser } from "@/src/lib/db/queries/analytics";

export default async function PartnerInstructorsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({
    locale,
    namespace: "Partner.instructorsAdmin",
  });

  const partnerId = await getPartnerIdForCurrentUser();
  const members = partnerId ? await getPartnerMembers(partnerId) : [];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-end justify-between gap-6 mb-8 flex-wrap">
        <div>
          <span className="inline-block bg-primary-fixed/60 px-3 py-1 rounded-full text-[0.6rem] font-bold uppercase tracking-widest text-primary mb-3">
            {t("badge", { count: members.length })}
          </span>
          <h1 className="font-headline font-extrabold text-4xl tracking-tight">
            {t("title")}
          </h1>
        </div>
        <button
          type="button"
          disabled
          title={t("comingSoon")}
          className="bg-surface-container-low text-on-surface/50 px-6 py-3 rounded-2xl font-headline uppercase tracking-widest text-[0.7rem] font-bold flex items-center gap-2 shrink-0 cursor-not-allowed"
        >
          <Icon name="person_add" className="text-[18px]" />
          {t("comingSoon")}
        </button>
      </div>

      {members.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl border border-[#FAEEDA] p-12 text-center text-on-surface/60">
          {t("emptyState")}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {members.map((m) => (
            <article
              key={m.userId}
              className="bg-surface-container-lowest rounded-2xl border border-[#FAEEDA] p-5 flex items-center gap-3"
            >
              {m.avatarUrl ? (
                <img
                  src={m.avatarUrl}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-headline font-bold shrink-0">
                  {(m.fullName || "?").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="font-headline font-bold truncate">
                  {m.fullName || m.userId.slice(0, 8)}
                </div>
                <div className="text-[0.65rem] uppercase tracking-widest text-on-surface/50">
                  {m.role}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
