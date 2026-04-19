"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "../Icon";
import { ActivityPanel, NeighborhoodPanel, WhenPanel, AgePanel } from "./panels";
import {
  formatMultiSelectDisplay,
  type SearchField,
  type AgeCounts,
} from "./constants";

function useFormatActivities() {
  const tLabel = useTranslations("Search.activityLabels");
  return (csvKeys: string) =>
    csvKeys
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((k) => {
        try {
          return tLabel(k);
        } catch {
          return k;
        }
      })
      .join(", ");
}

export function MobileSearchPill({ onClick }: { onClick: () => void }) {
  const t = useTranslations("Search");
  return (
    <button
      onClick={onClick}
      className="md:hidden w-full flex items-center gap-3 bg-surface-container-lowest rounded-full px-5 py-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.12)] active:scale-[0.98] transition-all duration-300 border border-on-surface/[0.06]"
    >
      <Icon name="search" className="text-[20px] text-on-surface/60" />
      <span className="text-[0.9rem] font-semibold text-on-surface/40 flex-1 text-left">
        {t("mobilePillPlaceholder")}
      </span>
    </button>
  );
}

export function MobileSearchOverlay({
  isOpen,
  onClose,
  activities,
  neighborhood,
  when,
  ageCounts,
  ageLabel,
  onActivitiesChange,
  onNeighborhoodChange,
  onWhenChange,
  onAgeUpdate,
  onClearAll,
}: {
  isOpen: boolean;
  onClose: () => void;
  activities: string;
  neighborhood: string;
  when: string;
  ageCounts: AgeCounts;
  ageLabel: string;
  onActivitiesChange: (v: string) => void;
  onNeighborhoodChange: (v: string) => void;
  onWhenChange: (v: string) => void;
  onAgeUpdate: (key: keyof AgeCounts, delta: number) => void;
  onClearAll: () => void;
}) {
  const t = useTranslations();
  const formatActivities = useFormatActivities();
  const [expandedField, setExpandedField] = useState<SearchField>("activities");

  useEffect(() => {
    if (isOpen) setExpandedField("activities");
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const fields = [
    {
      key: "activities" as SearchField,
      label: t("Search.field.activitiesLabel"),
      value: formatMultiSelectDisplay(formatActivities(activities)),
      emptyText: t("Search.field.activitiesEmpty"),
    },
    {
      key: "neighborhood" as SearchField,
      label: t("Search.field.neighborhoodLabel"),
      value: neighborhood,
      emptyText: t("Search.field.neighborhoodEmpty"),
    },
    {
      key: "when" as SearchField,
      label: t("Search.field.whenLabel"),
      value: when,
      emptyText: t("Search.field.whenEmpty"),
    },
    {
      key: "age" as SearchField,
      label: t("Search.field.whoLabel"),
      value: ageLabel,
      emptyText: t("Search.field.ageEmpty"),
    },
  ];

  const renderPanel = (field: SearchField) => {
    switch (field) {
      case "activities":
        return <ActivityPanel value={activities} onChange={onActivitiesChange} />;
      case "neighborhood":
        return <NeighborhoodPanel value={neighborhood} onChange={onNeighborhoodChange} />;
      case "when":
        return <WhenPanel value={when} onChange={onWhenChange} />;
      case "age":
        return <AgePanel counts={ageCounts} onUpdate={onAgeUpdate} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[300] md:hidden transition-all duration-500 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
    >
      <div
        className={`absolute inset-0 bg-on-surface/30 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"
          }`}
        onClick={onClose}
      />

      <div
        className={`absolute inset-0 bg-surface flex flex-col transition-transform duration-500 ease-[cubic-bezier(.32,.72,0,1)] ${isOpen ? "translate-y-0" : "translate-y-full"
          }`}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0">
          <span className="text-xl font-bold tracking-tighter text-primary font-headline">
            HAKUNA
          </span>
          <button
            onClick={onClose}
            aria-label={t("Common.close")}
            className="w-8 h-8 rounded-full border border-on-surface/10 flex items-center justify-center hover:bg-surface-container-low transition-colors"
          >
            <Icon name="close" className="text-[18px] text-on-surface/70" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-28">
          {fields.map((f, i) => (
            <div key={f.key}>
              {expandedField === f.key ? (
                <div className="bg-surface-container-lowest rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] mb-4 overflow-hidden mobile-accordion-enter">
                  <div className="flex items-center justify-between px-6 pt-5 pb-1">
                    <h3 className="text-xl font-bold text-on-surface font-headline">
                      {f.label}
                    </h3>
                    <button
                      onClick={() => setExpandedField(null)}
                      className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-surface-container-low transition-colors"
                    >
                      <Icon name="expand_less" className="text-[20px] text-on-surface/40" />
                    </button>
                  </div>
                  {renderPanel(f.key)}
                </div>
              ) : (
                <button
                  onClick={() => setExpandedField(f.key)}
                  className="w-full flex items-center justify-between py-4 px-1 text-left active:bg-surface-container-low/50 transition-colors rounded-xl"
                >
                  <span className="text-sm font-semibold text-on-surface/50">
                    {f.label}
                  </span>
                  <span className="text-sm font-bold text-on-surface">
                    {f.value || f.emptyText}
                  </span>
                </button>
              )}
              {expandedField !== f.key &&
                i < fields.length - 1 &&
                expandedField !== fields[i + 1]?.key && (
                  <div className="h-px bg-on-surface/[0.06] mx-1" />
                )}
            </div>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-lg border-t border-on-surface/[0.06] px-6 py-4 flex items-center justify-between">
          <button
            onClick={onClearAll}
            className="text-sm font-bold text-on-surface underline underline-offset-4 decoration-on-surface/30 hover:decoration-on-surface transition-colors"
          >
            {t("Common.clearAll")}
          </button>
          <button
            onClick={onClose}
            className="bg-primary text-on-primary px-7 py-3.5 rounded-full font-headline font-bold text-sm flex items-center gap-2 shadow-[0_8px_20px_rgba(180,15,85,0.3)] active:scale-95 transition-all"
          >
            <Icon name="search" className="text-[18px]" />
            {t("Common.search")}
          </button>
        </div>
      </div>
    </div>
  );
}
