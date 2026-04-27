"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { DayPicker, DateRange } from "react-day-picker";
import { format } from "date-fns";
import { pl as plLocale, enGB } from "date-fns/locale";
import "react-day-picker/style.css";
import { Icon } from "../Icon";
import { TablerIcon } from "../TablerIcon";
import { WHEN_OPTIONS } from "./constants";

export default function WhenPanel({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const t = useTranslations("Search");
  const tWhen = useTranslations("Search.whenOptions");
  const tPanels = useTranslations("Search.panels");
  const locale = useLocale();
  const dateLocale = locale === "pl" ? plLocale : enGB;
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(undefined);

  const handleRangeSelect = (
    _range: DateRange | undefined,
    selectedDay: Date
  ) => {
    if (selectedRange?.from && selectedRange?.to) {
      setSelectedRange({ from: selectedDay, to: undefined });
      onChange(format(selectedDay, "PP", { locale: dateLocale }));
      return;
    }

    if (selectedRange?.from && !selectedRange?.to) {
      if (selectedDay.getTime() === selectedRange.from.getTime()) {
        setSelectedRange({ from: selectedDay, to: undefined });
        onChange(format(selectedDay, "PP", { locale: dateLocale }));
        return;
      }

      const isBefore = selectedDay < selectedRange.from;
      if (isBefore) {
        setSelectedRange({ from: selectedDay, to: undefined });
        onChange(format(selectedDay, "PP", { locale: dateLocale }));
        return;
      }

      const finalRange = { from: selectedRange.from, to: selectedDay };
      setSelectedRange(finalRange);

      if (finalRange.from.getTime() === finalRange.to.getTime()) {
        onChange(format(finalRange.from, "PP", { locale: dateLocale }));
      } else {
        onChange(
          `${format(finalRange.from, "MMM d", { locale: dateLocale })} - ${format(finalRange.to, "MMM d", { locale: dateLocale })}`
        );
      }
      return;
    }

    setSelectedRange({ from: selectedDay, to: undefined });
    onChange(format(selectedDay, "PP", { locale: dateLocale }));
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
            aria-label={t("field.whenLabel")}
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
            locale={dateLocale}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-on-surface/40 mb-4">
        {tPanels("whenQuestion")}
      </p>
      <div className="grid grid-cols-3 gap-3">
        {WHEN_OPTIONS.map((w) => {
          const label = tWhen(w.key);
          const sub = tWhen(`${w.key}Sub`);
          const isSelected = value === label;
          return (
            <button
              key={w.key}
              onClick={() => {
                if (w.key === "pickDate") {
                  setShowCalendar(true);
                } else {
                  onChange(label);
                }
              }}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200 active:scale-95 cursor-pointer ${
                isSelected
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                  : "bg-surface-container-lowest border border-on-surface/[0.06] hover:bg-primary-fixed/30 hover:border-primary/20 text-on-surface"
              }`}
            >
              <TablerIcon
                name={w.icon}
                size={24}
                className={isSelected ? "text-on-primary" : "text-primary"}
              />
              <span className="text-sm font-bold">{label}</span>
              <span
                className={`text-[0.65rem] ${
                  isSelected ? "text-on-primary/70" : "text-on-surface/40"
                }`}
              >
                {sub}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
