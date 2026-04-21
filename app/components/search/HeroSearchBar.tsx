"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "../Icon";
import SearchSegment from "./SearchSegment";
import { ActivityPanel, NeighborhoodPanel, WhenPanel, AgePanel } from "./panels";
import {
  formatMultiSelectDisplay,
  type AgeCounts,
  type SearchField,
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

export default function HeroSearchBar({
  containerRef,
  activities,
  neighborhood,
  when,
  ageCounts,
  ageLabel,
  onActivitiesChange,
  onNeighborhoodChange,
  onWhenChange,
  onAgeUpdate,
  onSubmit,
  className = "w-full max-w-5xl mb-12",
}: {
  containerRef?: React.RefObject<HTMLDivElement | null>;
  activities: string;
  neighborhood: string;
  when: string;
  ageCounts: AgeCounts;
  ageLabel: string;
  onActivitiesChange: (v: string) => void;
  onNeighborhoodChange: (v: string) => void;
  onWhenChange: (v: string) => void;
  onAgeUpdate: (key: keyof AgeCounts, delta: number) => void;
  onSubmit?: () => void;
  className?: string;
}) {
  const t = useTranslations();
  const formatActivities = useFormatActivities();
  const [activeField, setActiveField] = useState<SearchField>(null);
  const [lastActiveField, setLastActiveField] = useState<SearchField>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const isExpanded = activeField !== null;
  const renderField = activeField || lastActiveField;

  useEffect(() => {
    if (activeField !== null) {
      setLastActiveField(activeField);
    }
  }, [activeField]);

  const close = useCallback(() => setActiveField(null), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [close]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        close();
      }
    };
    if (isExpanded) {
      document.addEventListener("mousedown", handler);
    }
    return () => document.removeEventListener("mousedown", handler);
  }, [isExpanded, close]);

  const toggle = (f: SearchField) =>
    setActiveField((prev) => (prev === f ? null : f));

  const fields: {
    field: SearchField;
    icon: string;
    label: string;
    value: string;
    placeholder: string;
  }[] = [
    {
      field: "activities",
      icon: "search",
      label: t("Search.field.activitiesLabel"),
      value: formatMultiSelectDisplay(formatActivities(activities)),
      placeholder: t("Search.field.activitiesPlaceholder"),
    },
    {
      field: "neighborhood",
      icon: "near_me",
      label: t("Search.field.neighborhoodLabel"),
      value: neighborhood,
      placeholder: t("Search.field.neighborhoodPlaceholder"),
    },
    {
      field: "when",
      icon: "calendar_today",
      label: t("Search.field.whenLabel"),
      value: when,
      placeholder: t("Search.field.whenPlaceholder"),
    },
    {
      field: "age",
      icon: "person",
      label: t("Search.field.ageLabel"),
      value: ageLabel,
      placeholder: t("Search.field.agePlaceholder"),
    },
  ];

  return (
    <div ref={containerRef} className={`${className} relative z-30`}>
      <div
        className={`fixed inset-0 bg-on-surface/30 transition-opacity duration-300 ${
          isExpanded
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{ zIndex: 25 }}
        onClick={close}
      />

      <div ref={barRef} className="relative" style={{ zIndex: 30 }}>
        <div
          className={`rounded-full transition-all duration-500 ease-[cubic-bezier(.4,0,.2,1)] relative border-2 ${
            isExpanded
              ? "bg-surface-container-high shadow-[0_20px_60px_-15px_rgba(232,64,122,0.25)] scale-[1.02] border-transparent"
              : "bg-surface-container-lowest shadow-[0_10px_40px_-10px_rgba(232,64,122,0.12)] hover:shadow-[0_20px_60px_-15px_rgba(232,64,122,0.25)] hover:scale-[1.015] border-[#AD1F53]"
          }`}
        >
          <div className="flex flex-col md:flex-row items-center gap-1 md:gap-0 p-2.5 transition-all duration-300 relative z-10">
            {fields.map((f, i) => (
              <Fragment key={f.field}>
                <SearchSegment
                  field={f.field}
                  activeField={activeField}
                  isExpanded={isExpanded}
                  icon={f.icon}
                  label={f.label}
                  displayValue={f.value}
                  placeholder={f.placeholder}
                  onClick={() => toggle(f.field)}
                />
                {i < fields.length - 1 && (
                  <div
                    className={`hidden md:block w-px h-8 bg-on-surface/[0.08] transition-opacity shrink-0 ${
                      activeField === fields[i].field ||
                      activeField === fields[i + 1].field
                        ? "opacity-0"
                        : ""
                    }`}
                  />
                )}
              </Fragment>
            ))}

            <div className="p-1 pl-4 shrink-0">
              <button
                type="button"
                onClick={onSubmit}
                className={`bg-primary text-on-primary flex items-center justify-center hover:scale-105 transition-all duration-300 shadow-[0_8px_20px_rgba(180,15,85,0.3)] active:scale-95 h-14 rounded-full ${
                  isExpanded ? "px-6" : "px-[16px]"
                }`}
              >
                <Icon name="search" className="text-[24px] shrink-0" />
                <div
                  className={`flex items-center overflow-hidden transition-all duration-300 ease-out ${
                    isExpanded
                      ? "max-w-[100px] opacity-100 ml-2"
                      : "max-w-0 opacity-0 ml-0"
                  }`}
                >
                  <span className="font-headline font-bold text-sm uppercase tracking-wider">
                    {t("Common.search")}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div
          className={`absolute left-0 right-0 mt-3 bg-surface-container-lowest rounded-[2rem] editorial-shadow overflow-hidden transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)] ${
            isExpanded
              ? "opacity-100 translate-y-0 max-h-[500px]"
              : "opacity-0 -translate-y-4 max-h-0 pointer-events-none"
          }`}
        >
          {renderField === "activities" && (
            <ActivityPanel value={activities} onChange={onActivitiesChange} />
          )}
          {renderField === "neighborhood" && (
            <NeighborhoodPanel value={neighborhood} onChange={onNeighborhoodChange} />
          )}
          {renderField === "when" && (
            <WhenPanel value={when} onChange={onWhenChange} />
          )}
          {renderField === "age" && (
            <AgePanel counts={ageCounts} onUpdate={onAgeUpdate} />
          )}
        </div>
      </div>
    </div>
  );
}
