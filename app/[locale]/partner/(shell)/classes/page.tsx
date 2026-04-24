"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "../../../../components/Icon";
import ClassRowCard from "../../../../components/partner/ClassRowCard";
import {
  PARTNER_CLASSES,
  CLASS_STATUS_COUNTS,
} from "../../../../lib/partnerMockData";

type Tab = "published" | "drafts" | "archived";

export default function PartnerClassesListPage() {
  const t = useTranslations("Partner");
  const tCl = useTranslations("Partner.classes");
  const [tab, setTab] = useState<Tab>("published");
  const [query, setQuery] = useState("");

  const filtered = PARTNER_CLASSES.filter(
    (c) => c.status === (tab === "drafts" ? "draft" : tab === "archived" ? "archived" : "published"),
  );

  return (
    <div className="p-8">
      <div className="flex items-end justify-between gap-6 mb-6 flex-wrap">
        <div>
          <span className="inline-block bg-secondary-container px-3 py-1 rounded-full text-[0.6rem] font-bold uppercase tracking-widest text-on-secondary-container mb-3">
            {tCl("countBadge", {
              live: CLASS_STATUS_COUNTS.published,
              drafts: CLASS_STATUS_COUNTS.drafts,
            })}
          </span>
          <h1 className="font-headline font-extrabold text-4xl tracking-tight">
            {tCl("title")} <span className="italic text-primary">{tCl("titleEmph")}</span>
          </h1>
        </div>
        <button
          type="button"
          className="bg-primary text-on-primary px-6 py-3 rounded-2xl font-headline uppercase tracking-widest text-[0.7rem] font-bold hover:bg-tertiary flex items-center gap-2 shrink-0"
        >
          <Icon name="add" className="text-[18px]" />
          {t("common.newClass")}
        </button>
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
          <div className="h-4 w-px bg-on-surface/10 mx-3" />
          <span className="text-[0.7rem] font-semibold text-on-surface/40">⌘K</span>
        </div>
        <button
          type="button"
          className="bg-primary-fixed text-primary px-4 py-3 rounded-2xl text-[0.7rem] font-bold uppercase tracking-widest flex items-center gap-1.5"
        >
          {tCl("filterLevel")}
          <Icon name="expand_more" className="text-[14px]" />
        </button>
        <button
          type="button"
          className="bg-surface-container-lowest border border-[#FAEEDA] px-4 py-3 rounded-2xl text-[0.7rem] font-bold uppercase tracking-widest text-on-surface/70 flex items-center gap-1.5"
        >
          {tCl("filterInstructor")}
          <Icon name="expand_more" className="text-[14px]" />
        </button>
        <button
          type="button"
          className="bg-surface-container-lowest border border-[#FAEEDA] px-4 py-3 rounded-2xl text-[0.7rem] font-bold uppercase tracking-widest text-on-surface/70 flex items-center gap-1.5"
        >
          {tCl("filterStatus")}
          <Icon name="expand_more" className="text-[14px]" />
        </button>
      </div>

      <div className="flex items-center gap-1 mb-4 border-b border-on-surface/5">
        {(["published", "drafts", "archived"] as Tab[]).map((key) => {
          const active = tab === key;
          const count =
            key === "published"
              ? CLASS_STATUS_COUNTS.published
              : key === "drafts"
                ? CLASS_STATUS_COUNTS.drafts
                : CLASS_STATUS_COUNTS.archived;
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
              <span
                className={
                  active ? "text-on-surface/40 font-normal ml-1" : "ml-1 font-normal"
                }
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {filtered.map((c) => (
          <ClassRowCard key={c.id} data={c} />
        ))}
      </div>
    </div>
  );
}
