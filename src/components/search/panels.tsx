"use client";

import { useTranslations } from "next-intl";
import { Icon } from "../Icon";
import { TablerIcon } from "../TablerIcon";
import { CATEGORY_ICONS } from "@/src/lib/categoryIcons";
import {
  ACTIVITY_CATEGORIES,
  NEIGHBORHOOD_SUGGESTIONS,
  AGE_GROUPS,
  type AgeCounts,
} from "./constants";

export function ActivityPanel({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const t = useTranslations("Search");
  const tCat = useTranslations("Search.categories");
  const tLabel = useTranslations("Search.activityLabels");

  const selectedKeys = value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const toggleActivity = (key: string) => {
    if (selectedKeys.includes(key)) {
      onChange(selectedKeys.filter((k) => k !== key).join(", "));
    } else {
      onChange([...selectedKeys, key].join(", "));
    }
  };

  return (
    <div className="p-6">
      <div className="space-y-6">
        {ACTIVITY_CATEGORIES.map((category) => (
          <div key={category.key}>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-on-surface/40 mb-3">
              {tCat(category.key)}
            </p>
            <div className="flex flex-wrap gap-2">
              {category.items.map((a) => {
                const isSelected = selectedKeys.includes(a.key);
                return (
                  <button
                    key={a.key}
                    onClick={() => toggleActivity(a.key)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 border ${
                      isSelected
                        ? "bg-primary text-on-primary border-primary shadow-[0_4px_12px_rgba(180,15,85,0.2)]"
                        : "bg-surface-container-lowest border-on-surface/[0.06] text-on-surface hover:bg-primary-fixed/40 hover:border-primary/20 active:scale-95"
                    }`}
                  >
                    <TablerIcon name={CATEGORY_ICONS[a.key]} size={18} />
                    {tLabel(a.key)}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">{t("looking")}</span>
    </div>
  );
}

export function NeighborhoodPanel({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const t = useTranslations("Search.panels");
  const tHood = useTranslations("Search.neighborhoods");
  return (
    <div className="p-6">
      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("searchNeighborhoods")}
        className="w-full bg-surface-container-low rounded-2xl px-5 py-3.5 text-base font-semibold text-on-surface placeholder:text-on-surface/30 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all mb-5"
      />
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-on-surface/40 mb-3">
        {t("popularNeighborhoods")}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {NEIGHBORHOOD_SUGGESTIONS.filter((n) => {
          const name = tHood(`${n.key}.name`);
          return !value || name.toLowerCase().includes(value.toLowerCase());
        }).map((n) => {
          const name = tHood(`${n.key}.name`);
          const sub = tHood(`${n.key}.sub`);
          return (
            <button
              key={n.key}
              onClick={() => onChange(name)}
              className="flex items-center gap-3 p-3 rounded-2xl hover:bg-surface-container-low active:scale-[0.98] transition-all duration-200 text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-fixed/30 flex items-center justify-center shrink-0">
                <TablerIcon name={n.icon} size={22} className="text-primary" />
              </div>
              <div>
                <div className="font-semibold text-sm text-on-surface">{name}</div>
                <div className="text-xs text-on-surface/40">{sub}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AgePanel({
  counts,
  onUpdate,
}: {
  counts: AgeCounts;
  onUpdate: (key: keyof AgeCounts, delta: number) => void;
}) {
  const tPanels = useTranslations("Search.panels");
  const tAge = useTranslations("Search.ageGroups");
  return (
    <div className="p-6">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-on-surface/40 mb-4">
        {tPanels("whoQuestion")}
      </p>
      <div className="space-y-1">
        {AGE_GROUPS.map((g, i) => (
          <div key={g.key}>
            <div className="flex items-center justify-between py-4">
              <div>
                <div className="font-semibold text-on-surface">{tAge(g.key)}</div>
                <div className="text-sm text-on-surface/40">{tAge(`${g.key}Sub`)}</div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => onUpdate(g.key, -1)}
                  disabled={counts[g.key] <= 0}
                  className="w-9 h-9 rounded-full border border-on-surface/20 flex items-center justify-center text-on-surface/60 hover:border-on-surface/60 hover:text-on-surface disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-90"
                >
                  <Icon name="remove" className="text-[18px]" />
                </button>
                <span className="w-6 text-center font-semibold text-on-surface tabular-nums">
                  {counts[g.key]}
                </span>
                <button
                  onClick={() => onUpdate(g.key, 1)}
                  className="w-9 h-9 rounded-full border border-on-surface/20 flex items-center justify-center text-on-surface/60 hover:border-on-surface/60 hover:text-on-surface transition-all active:scale-90"
                >
                  <Icon name="add" className="text-[18px]" />
                </button>
              </div>
            </div>
            {i < AGE_GROUPS.length - 1 && <div className="h-px bg-on-surface/[0.06]" />}
          </div>
        ))}
      </div>
    </div>
  );
}
