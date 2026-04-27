"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Icon } from "../Icon";
import SearchSegment from "./SearchSegment";
import { ActivityPanel, NeighborhoodPanel, AgePanel } from "./panels";
import {
  formatMultiSelectDisplay,
  type AgeCounts,
  type SearchField,
} from "./constants";

const WhenPanel = dynamic(() => import("./WhenPanel"), { ssr: false });

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

export default function NavExpandedSearch({
  isOpen,
  initialField,
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
  onSubmit,
}: {
  isOpen: boolean;
  initialField: SearchField;
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
  onSubmit: () => void;
}) {
  const t = useTranslations();
  const formatActivities = useFormatActivities();
  const [activeField, setActiveField] = useState<SearchField>(initialField);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const barRef = useRef<HTMLDivElement>(null);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setActiveField(initialField);
    }
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const fields: {
    field: SearchField;
    icon: string;
    label: string;
    value: string;
    placeholder: string;
  }[] = [
    {
      field: "activities",
      icon: "category",
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
    <div className={`fixed inset-0 z-[200] max-md:hidden transition-all duration-500 ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
      <div
        className={`absolute inset-0 bg-on-surface/40 transition-opacity duration-500 ease-[cubic-bezier(.4,0,.2,1)] ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <div
        ref={barRef}
        className={`absolute top-0 left-0 right-0 bg-[#fdf9f0] shadow-[0_10px_30px_rgba(0,0,0,0.12)] pt-[88px] pb-6 px-6 transition-transform duration-500 ease-[cubic-bezier(.32,.72,0,1)] ${isOpen ? "translate-y-0" : "-translate-y-full"}`}
      >
        <div className="max-w-5xl mx-auto relative">
          <div className="bg-surface-container-high rounded-full shadow-[0_20px_60px_-15px_rgba(232,64,122,0.25)]">
            <div className="flex flex-col md:flex-row items-center gap-1 md:gap-0 p-2.5 relative z-10">
              {fields.map((f, i) => (
                <Fragment key={f.field}>
                  <SearchSegment
                    field={f.field}
                    activeField={activeField}
                    isExpanded={true}
                    icon={f.icon}
                    label={f.label}
                    displayValue={f.value}
                    placeholder={f.placeholder}
                    onClick={() => setActiveField(f.field)}
                  />
                  {i < fields.length - 1 && (
                    <div
                      className={`hidden md:block w-px h-8 bg-on-surface/[0.08] transition-opacity shrink-0 ${activeField === fields[i].field || activeField === fields[i + 1].field
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
                  className="bg-primary text-on-primary flex items-center justify-center rounded-full px-6 h-14 gap-2 hover:scale-105 transition-all duration-300 shadow-[0_8px_20px_rgba(180,15,85,0.3)] active:scale-95"
                >
                  <Icon name="search" className="text-[24px]" />
                  <span className="font-headline font-bold text-sm uppercase tracking-wider">
                    {t("Common.search")}
                  </span>
                </button>
              </div>
            </div>
          </div>
          <div
            className={`mt-3 bg-surface-container-lowest rounded-[2rem] editorial-shadow transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)] ${activeField
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-4 max-h-0 pointer-events-none"
              }`}
          >
            {activeField === "activities" && (
              <ActivityPanel value={activities} onChange={onActivitiesChange} />
            )}
            {activeField === "neighborhood" && (
              <NeighborhoodPanel value={neighborhood} onChange={onNeighborhoodChange} />
            )}
            {activeField === "when" && (
              <WhenPanel value={when} onChange={onWhenChange} />
            )}
            {activeField === "age" && (
              <AgePanel counts={ageCounts} onUpdate={onAgeUpdate} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
