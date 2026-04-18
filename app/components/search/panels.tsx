"use client";

import { useState } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/style.css";
import { Icon } from "../Icon";
import {
  ACTIVITY_CATEGORIES,
  NEIGHBORHOOD_SUGGESTIONS,
  WHEN_OPTIONS,
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
  const selectedActivities = value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const toggleActivity = (label: string) => {
    if (selectedActivities.includes(label)) {
      onChange(selectedActivities.filter((l) => l !== label).join(", "));
    } else {
      onChange([...selectedActivities, label].join(", "));
    }
  };

  return (
    <div className="p-6">
      <div className="space-y-6">
        {ACTIVITY_CATEGORIES.map((category) => (
          <div key={category.name}>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-on-surface/40 mb-3">
              {category.name}
            </p>
            <div className="flex flex-wrap gap-2">
              {category.items.map((a) => {
                const isSelected = selectedActivities.includes(a.label);
                return (
                  <button
                    key={a.label}
                    onClick={() => toggleActivity(a.label)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 border ${
                      isSelected
                        ? "bg-primary text-on-primary border-primary shadow-[0_4px_12px_rgba(180,15,85,0.2)]"
                        : "bg-surface-container-lowest border-on-surface/[0.06] text-on-surface hover:bg-primary-fixed/40 hover:border-primary/20 active:scale-95"
                    }`}
                  >
                    <span className="text-lg">{a.emoji}</span>
                    {a.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
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
  return (
    <div className="p-6">
      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search neighborhoods..."
        className="w-full bg-surface-container-low rounded-2xl px-5 py-3.5 text-base font-semibold text-on-surface placeholder:text-on-surface/30 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all mb-5"
      />
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-on-surface/40 mb-3">
        Popular neighborhoods
      </p>
      <div className="grid grid-cols-2 gap-2">
        {NEIGHBORHOOD_SUGGESTIONS.filter(
          (n) => !value || n.name.toLowerCase().includes(value.toLowerCase())
        ).map((n) => (
          <button
            key={n.name}
            onClick={() => onChange(n.name)}
            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-surface-container-low active:scale-[0.98] transition-all duration-200 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-primary-fixed/30 flex items-center justify-center shrink-0">
              <Icon name={n.icon} className="text-[22px] text-primary" />
            </div>
            <div>
              <div className="font-semibold text-sm text-on-surface">{n.name}</div>
              <div className="text-xs text-on-surface/40">{n.sub}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function WhenPanel({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(undefined);

  const handleRangeSelect = (
    _range: DateRange | undefined,
    selectedDay: Date
  ) => {
    if (selectedRange?.from && selectedRange?.to) {
      setSelectedRange({ from: selectedDay, to: undefined });
      onChange(format(selectedDay, "MMM d, yyyy"));
      return;
    }

    if (selectedRange?.from && !selectedRange?.to) {
      if (selectedDay.getTime() === selectedRange.from.getTime()) {
        setSelectedRange({ from: selectedDay, to: undefined });
        onChange(format(selectedDay, "MMM d, yyyy"));
        return;
      }

      const isBefore = selectedDay < selectedRange.from;
      if (isBefore) {
        setSelectedRange({ from: selectedDay, to: undefined });
        onChange(format(selectedDay, "MMM d, yyyy"));
        return;
      }

      const finalRange = { from: selectedRange.from, to: selectedDay };
      setSelectedRange(finalRange);

      if (finalRange.from.getTime() === finalRange.to.getTime()) {
        onChange(format(finalRange.from, "MMM d, yyyy"));
      } else {
        onChange(`${format(finalRange.from, "MMM d")} - ${format(finalRange.to, "MMM d")}`);
      }
      return;
    }

    setSelectedRange({ from: selectedDay, to: undefined });
    onChange(format(selectedDay, "MMM d, yyyy"));
  };

  const rangeClassNames = {
    root: "rdp-hakuna pb-4",
    months: "flex flex-col md:flex-row gap-8 relative",
    month_caption: "text-base font-bold text-on-surface mb-6 text-center",
    weekday: "text-[0.65rem] font-bold uppercase tracking-wider text-on-surface/40 w-10 text-center pb-2",
    nav: "absolute top-0 left-0 right-0 flex items-center justify-between pointer-events-none z-20",
    button_previous: "w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-low text-on-surface/60 cursor-pointer pointer-events-auto",
    button_next: "w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-low text-on-surface/60 cursor-pointer pointer-events-auto",
  };

  const rangeModifiersClasses = {
    range_start: "relative z-10 !bg-primary !text-on-primary !rounded-full before:absolute before:inset-y-0 before:right-0 before:w-1/2 before:bg-primary/10 before:-z-10",
    range_end: "relative z-10 !bg-primary !text-on-primary !rounded-full before:absolute before:inset-y-0 before:left-0 before:w-1/2 before:bg-primary/10 before:-z-10",
    range_middle: "!bg-primary/10 !text-primary !rounded-none",
    only_start: "relative z-10 !bg-primary !text-on-primary !rounded-full",
    selected: "bg-transparent",
  };

  const customModifiers = {
    only_start: selectedRange?.from && !selectedRange?.to ? [selectedRange.from] : [],
  };

  if (showCalendar) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center mb-8 relative">
          <button
            onClick={() => setShowCalendar(false)}
            className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full hover:bg-surface-container-low transition-colors"
          >
            <Icon name="arrow_back" className="text-[20px] text-on-surface" />
          </button>
        </div>

        <div className="flex justify-center calendar-wrapper relative px-8">
          <DayPicker
            mode="range"
            selected={selectedRange}
            onSelect={handleRangeSelect}
            numberOfMonths={2}
            disabled={{ before: new Date() }}
            classNames={rangeClassNames}
            modifiersClassNames={rangeModifiersClasses}
            modifiers={customModifiers}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-on-surface/40 mb-4">
        When do you want to go?
      </p>
      <div className="grid grid-cols-3 gap-3">
        {WHEN_OPTIONS.map((w) => (
          <button
            key={w.label}
            onClick={() => {
              if (w.label === "Pick a date") {
                setShowCalendar(true);
              } else {
                onChange(w.label);
              }
            }}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200 active:scale-95 cursor-pointer ${
              value === w.label
                ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                : "bg-surface-container-lowest border border-on-surface/[0.06] hover:bg-primary-fixed/30 hover:border-primary/20 text-on-surface"
            }`}
          >
            <Icon
              name={w.icon}
              className={`text-[24px] ${value === w.label ? "text-on-primary" : "text-primary"}`}
            />
            <span className="text-sm font-bold">{w.label}</span>
            <span
              className={`text-[0.65rem] ${
                value === w.label ? "text-on-primary/70" : "text-on-surface/40"
              }`}
            >
              {w.sub}
            </span>
          </button>
        ))}
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
  return (
    <div className="p-6">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-on-surface/40 mb-4">
        Who&apos;s joining?
      </p>
      <div className="space-y-1">
        {AGE_GROUPS.map((g, i) => (
          <div key={g.key}>
            <div className="flex items-center justify-between py-4">
              <div>
                <div className="font-semibold text-on-surface">{g.label}</div>
                <div className="text-sm text-on-surface/40">{g.sub}</div>
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
