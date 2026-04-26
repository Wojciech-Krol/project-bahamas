"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";
import { Icon } from "@/src/components/Icon";
import type { PartnerActivity } from "@/src/lib/db/queries";

type Tab = "published" | "drafts" | "archived";

function ClassRow({ a }: { a: PartnerActivity }) {
  const tCommon = useTranslations("Partner.common");
  const tRow = useTranslations("Partner.classes.row");
  return (
    <div className="bg-surface-container-lowest rounded-[1.5rem] border border-[#FAEEDA] editorial-shadow p-4 flex items-center gap-5 hover:scale-[1.005] transition-transform">
      <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-primary-fixed/40 flex items-center justify-center">
        {a.heroImage ? (
          <img src={a.heroImage} alt="" className="w-full h-full object-cover" />
        ) : (
          <Icon name="event" className="text-[28px] text-primary" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h3 className="font-headline font-bold text-lg truncate">{a.title}</h3>
          {a.level && (
            <span className="text-[0.6rem] font-bold uppercase tracking-widest bg-primary-fixed text-primary px-2 py-0.5 rounded-full shrink-0">
              {a.level}
            </span>
          )}
          {!a.isPublished && (
            <span className="text-[0.6rem] font-bold uppercase tracking-widest bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full shrink-0">
              {tRow("draftBadge")}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-[0.75rem] text-on-surface/60 flex-wrap">
          <span className="flex items-center gap-1">
            <Icon name="place" className="text-[14px]" />
            {a.venueName}
          </span>
          <span className="flex items-center gap-1">
            <Icon name="timer" className="text-[14px]" />
            {a.durationLabel}
          </span>
          {a.category && (
            <span className="flex items-center gap-1">
              <Icon name="category" className="text-[14px]" />
              {a.category}
            </span>
          )}
        </div>
      </div>

      <div className="text-right shrink-0">
        <div className="font-headline font-bold">{a.priceLabel}</div>
        <div className="text-[0.65rem] text-on-surface/50 uppercase tracking-widest">
          {tRow("perClass")}
        </div>
      </div>

      <div className="flex gap-1 shrink-0">
        <Link
          href={`/partner/classes/${a.id}`}
          title={tCommon("edit")}
          className="w-9 h-9 rounded-full bg-surface-container-low hover:bg-primary-fixed text-on-surface/60 hover:text-primary flex items-center justify-center transition-colors"
        >
          <Icon name="edit" className="text-[18px]" />
        </Link>
      </div>
    </div>
  );
}

export default function PartnerClassesClient({
  activities,
}: {
  activities: PartnerActivity[];
}) {
  const t = useTranslations("Partner");
  const tCl = useTranslations("Partner.classes");
  const [tab, setTab] = useState<Tab>("published");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    let published = 0;
    let drafts = 0;
    for (const a of activities) {
      if (a.isPublished) published++;
      else drafts++;
    }
    return { published, drafts, archived: 0 };
  }, [activities]);

  const filtered = useMemo(() => {
    const byTab = activities.filter((a) => {
      if (tab === "published") return a.isPublished;
      if (tab === "drafts") return !a.isPublished;
      return false; // no archived flag yet
    });
    if (!query.trim()) return byTab;
    const q = query.trim().toLowerCase();
    return byTab.filter((a) => a.title.toLowerCase().includes(q));
  }, [activities, tab, query]);

  return (
    <div className="p-8">
      <div className="flex items-end justify-between gap-6 mb-6 flex-wrap">
        <div>
          <span className="inline-block bg-secondary-container px-3 py-1 rounded-full text-[0.6rem] font-bold uppercase tracking-widest text-on-secondary-container mb-3">
            {tCl("countBadge", { live: counts.published, drafts: counts.drafts })}
          </span>
          <h1 className="font-headline font-extrabold text-4xl tracking-tight">
            {tCl("title")}{" "}
            <span className="italic text-primary">{tCl("titleEmph")}</span>
          </h1>
        </div>
        <Link
          href="/partner/classes/new"
          className="bg-primary text-on-primary px-6 py-3 rounded-2xl font-headline uppercase tracking-widest text-[0.7rem] font-bold hover:bg-tertiary flex items-center gap-2 shrink-0"
        >
          <Icon name="add" className="text-[18px]" />
          {t("common.newClass")}
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex-1 min-w-[280px] bg-surface-container-lowest rounded-2xl border border-[#FAEEDA] editorial-shadow flex items-center px-5 py-3">
          <Icon name="search" className="text-[18px] text-on-surface/40 mr-3" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tCl("searchPlaceholder")}
            className="bg-transparent flex-1 text-sm font-medium focus:outline-none placeholder:text-on-surface/30"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 mb-4 border-b border-on-surface/5">
        {(["published", "drafts", "archived"] as Tab[]).map((key) => {
          const active = tab === key;
          const count = counts[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-4 py-3 text-[0.7rem] font-headline font-bold uppercase tracking-widest border-b-2 transition-colors ${
                active
                  ? "text-primary border-primary"
                  : "text-on-surface/50 border-transparent hover:text-on-surface/80"
              }`}
            >
              {tCl(`tabs.${key}`)}{" "}
              <span className="ml-1 font-normal text-on-surface/40">{count}</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-[1.5rem] border border-[#FAEEDA] p-12 text-center text-on-surface/60">
          {tCl("emptyState")}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <ClassRow key={a.id} a={a} />
          ))}
        </div>
      )}
    </div>
  );
}
