"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useMessages, useTranslations } from "next-intl";
import { Icon } from "../Icon";
import SearchSegment from "./SearchSegment";
import { ActivityPanel, NeighborhoodPanel, WhenPanel, AgePanel } from "./panels";
import { useSequencedTypewriter } from "./useTypewriterPlaceholder";
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
  const messages = useMessages() as {
    Home?: {
      hero?: {
        placeholders?: string[];
        placeholdersNeighborhood?: string[];
        placeholdersWhen?: string[];
        placeholdersAge?: string[];
      };
    };
  };
  const placeholders = messages.Home?.hero?.placeholders ?? [];
  const placeholdersNeighborhood =
    messages.Home?.hero?.placeholdersNeighborhood ?? [];
  const placeholdersWhen = messages.Home?.hero?.placeholdersWhen ?? [];
  const placeholdersAge = messages.Home?.hero?.placeholdersAge ?? [];
  const [activeField, setActiveField] = useState<SearchField>(null);
  const [lastActiveField, setLastActiveField] = useState<SearchField>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isExpanded = activeField !== null;
  const renderField = activeField || lastActiveField;

  const fieldPrompts = [
    placeholders,
    placeholdersNeighborhood,
    placeholdersWhen,
    placeholdersAge,
  ];
  const sequencerEnabled = activeField === null;
  const seq = useSequencedTypewriter(fieldPrompts, sequencerEnabled);

  const fieldEmpty = [!activities, !neighborhood, !when, !ageLabel];
  const fieldKeys: SearchField[] = ["activities", "neighborhood", "when", "age"];
  const typewriterShownIdx =
    sequencerEnabled && fieldEmpty[seq.activeIdx] ? seq.activeIdx : -1;

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
      const target = e.target as Node;
      if (
        barRef.current &&
        !barRef.current.contains(target) &&
        (!panelRef.current || !panelRef.current.contains(target))
      ) {
        close();
      }
    };
    if (isExpanded) {
      document.addEventListener("mousedown", handler);
    }
    return () => document.removeEventListener("mousedown", handler);
  }, [isExpanded, close]);

  const toggle = (f: SearchField) => {
    const next = activeField === f ? null : f;
    setActiveField(next);
    // Track the last non-null field so the dropdown can keep rendering
    // its content while collapsing without a flash to empty.
    if (next !== null) setLastActiveField(next);
  };

  const baseFields: {
    field: SearchField;
    icon: string;
    label: string;
    value: string;
    staticPlaceholder: string;
  }[] = [
    {
      field: "activities",
      icon: "search",
      label: t("Search.field.activitiesLabel"),
      value: formatMultiSelectDisplay(formatActivities(activities)),
      staticPlaceholder: t("Search.field.activitiesPlaceholder"),
    },
    {
      field: "neighborhood",
      icon: "near_me",
      label: t("Search.field.neighborhoodLabel"),
      value: neighborhood,
      staticPlaceholder: t("Search.field.neighborhoodPlaceholder"),
    },
    {
      field: "when",
      icon: "calendar_today",
      label: t("Search.field.whenLabel"),
      value: when,
      staticPlaceholder: t("Search.field.whenPlaceholder"),
    },
    {
      field: "age",
      icon: "person",
      label: t("Search.field.ageLabel"),
      value: ageLabel,
      staticPlaceholder: t("Search.field.agePlaceholder"),
    },
  ];

  const fields = baseFields.map((f, i) => {
    const showTypewriter =
      typewriterShownIdx === i && fieldKeys[i] === fieldKeys[seq.activeIdx];
    return {
      ...f,
      placeholder: showTypewriter
        ? seq.text || f.staticPlaceholder
        : f.staticPlaceholder,
      placeholderClassName: showTypewriter ? "typewriter-caret" : undefined,
    };
  });

  return (
    <div ref={containerRef} className={`${className} relative z-30`}>
      <div ref={barRef} className="relative" style={{ zIndex: 30 }}>
        <div
          className={`rounded-full transition-all duration-500 ease-[cubic-bezier(.4,0,.2,1)] relative ${
            isExpanded
              ? "bg-surface-container-high shadow-[0_20px_60px_-15px_rgba(232,64,122,0.25)] scale-[1.02]"
              : "bg-surface-container-lowest shadow-[0_10px_40px_-10px_rgba(232,64,122,0.12)] hover:shadow-[0_20px_60px_-15px_rgba(232,64,122,0.25)] hover:scale-[1.015]"
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
                  placeholderClassName={f.placeholderClassName}
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

        {isExpanded && (
          <div
            ref={panelRef}
            className="absolute left-0 right-0 mt-3 bg-surface-container-lowest rounded-[2rem] editorial-shadow overflow-hidden"
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
        )}
      </div>
    </div>
  );
}
