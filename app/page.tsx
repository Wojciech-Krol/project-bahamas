"use client";

import { useEffect, useRef, useState, useCallback, Fragment } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/style.css";

/* ─── Icon helper ─── */
function Icon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   SEARCH BAR TYPES & DATA
   ════════════════════════════════════════════════════════════════════════════ */
type SearchField = "activities" | "neighborhood" | "when" | "age" | null;

const ACTIVITY_SUGGESTIONS = [
  { emoji: "🧘", label: "Yoga" },
  { emoji: "🎨", label: "Pottery" },
  { emoji: "🎾", label: "Tennis" },
  { emoji: "🏊", label: "Swimming" },
  { emoji: "💃", label: "Dance" },
  { emoji: "🎵", label: "Music" },
  { emoji: "🧗", label: "Climbing" },
  { emoji: "🥊", label: "Boxing" },
  { emoji: "📸", label: "Photography" },
  { emoji: "🍳", label: "Cooking" },
  { emoji: "🎸", label: "Guitar" },
  { emoji: "🏃", label: "Running" },
];

const NEIGHBORHOOD_SUGGESTIONS = [
  { name: "Mitte", sub: "Central Berlin", icon: "location_city" },
  { name: "Prenzlauer Berg", sub: "Pankow District", icon: "park" },
  { name: "Kreuzberg", sub: "Friedrichshain-Kreuzberg", icon: "local_cafe" },
  { name: "Friedrichshain", sub: "East Berlin", icon: "music_note" },
  { name: "Neukölln", sub: "South Berlin", icon: "diversity_3" },
  { name: "Charlottenburg", sub: "West Berlin", icon: "castle" },
];

const WHEN_OPTIONS = [
  { label: "Now", sub: "Next 30 min", icon: "bolt" },
  { label: "Today", sub: "Until midnight", icon: "today" },
  { label: "Tomorrow", sub: "All day", icon: "event" },
  { label: "This week", sub: "Next 7 days", icon: "date_range" },
  { label: "This weekend", sub: "Sat – Sun", icon: "weekend" },
  { label: "Pick a date", sub: "Calendar", icon: "calendar_month" },
];

const AGE_GROUPS = [
  { label: "Kids", sub: "Ages 3–8", key: "kids" as const },
  { label: "Teens", sub: "Ages 9–17", key: "teens" as const },
  { label: "Adults", sub: "Ages 18+", key: "adults" as const },
];

type AgeCounts = { kids: number; teens: number; adults: number };

export function formatMultiSelectDisplay(value: string | undefined): string {
  if (!value) return "";
  const list = value.split(',').map(s => s.trim()).filter(Boolean);
  if (list.length === 0) return "";
  if (list.length <= 2) return list.join(", ");
  return `${list[0]}, ${list[1]}, +${list.length - 2}`;
}

/* ════════════════════════════════════════════════════════════════════════════
   DROPDOWN PANELS
   ════════════════════════════════════════════════════════════════════════════ */

function ActivityPanel({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [search, setSearch] = useState("");
  const selectedActivities = value.split(',').map(s => s.trim()).filter(Boolean);

  const toggleActivity = (label: string) => {
    if (selectedActivities.includes(label)) {
      onChange(selectedActivities.filter(l => l !== label).join(', '));
    } else {
      onChange([...selectedActivities, label].join(', '));
      setSearch("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && search.trim()) {
      e.preventDefault();
      const newLabel = search.trim();
      if (!selectedActivities.includes(newLabel)) {
        onChange([...selectedActivities, newLabel].join(', '));
      }
      setSearch("");
    }
  };

  return (
    <div className="p-6">
      <input
        autoFocus
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search activities... (Press Enter to add)"
        className="w-full bg-surface-container-low rounded-2xl px-5 py-3.5 text-base font-semibold text-on-surface placeholder:text-on-surface/30 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all mb-5"
      />
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-on-surface/40 mb-3">
        Popular activities
      </p>
      <div className="flex flex-wrap gap-2">
        {ACTIVITY_SUGGESTIONS.filter(
          (a) => !search || a.label.toLowerCase().includes(search.toLowerCase())
        ).map((a) => {
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
  );
}

function NeighborhoodPanel({ value, onChange }: { value: string; onChange: (v: string) => void }) {
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

function WhenPanel({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      onChange(format(date, "MMM d, yyyy"));
    }
  };

  if (showCalendar) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setShowCalendar(false)}
            className="flex items-center gap-1.5 text-sm font-semibold text-on-surface/60 hover:text-primary transition-colors cursor-pointer"
          >
            <Icon name="arrow_back" className="text-[18px]" />
            Back
          </button>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-on-surface/40">
            Pick a date
          </p>
        </div>
        <div className="flex justify-center calendar-wrapper">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            numberOfMonths={2}
            disabled={{ before: new Date() }}
            classNames={{
              root: "rdp-hakuna",
              months: "flex gap-8",
              month_caption: "text-base font-bold text-on-surface mb-3 text-center",
              weekday: "text-[0.65rem] font-bold uppercase tracking-wider text-on-surface/40 w-10 text-center",
              day_button: "w-10 h-10 rounded-full text-sm font-medium text-on-surface hover:bg-primary-fixed/30 transition-colors flex items-center justify-center cursor-pointer",
              selected: "!bg-primary !text-on-primary shadow-lg shadow-primary/20",
              today: "font-bold ring-1 ring-primary/30 rounded-full",
              disabled: "text-on-surface/20 hover:bg-transparent cursor-default",
              nav: "flex items-center justify-between mb-2",
              button_previous: "w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-low text-on-surface/60 cursor-pointer",
              button_next: "w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-low text-on-surface/60 cursor-pointer",
            }}
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
            <span className={`text-[0.65rem] ${value === w.label ? "text-on-primary/70" : "text-on-surface/40"}`}>
              {w.sub}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function AgePanel({
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

/* ════════════════════════════════════════════════════════════════════════════
   MOBILE SEARCH PILL — compact search bar visible on mobile
   ════════════════════════════════════════════════════════════════════════════ */
function MobileSearchPill({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="md:hidden w-full flex items-center gap-3 bg-surface-container-lowest rounded-full px-5 py-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.12)] active:scale-[0.98] transition-all duration-300 border border-on-surface/[0.06] mb-6"
    >
      <Icon name="search" className="text-[20px] text-on-surface/60" />
      <span className="text-[0.9rem] font-semibold text-on-surface/40 flex-1 text-left">
        What are you looking for?
      </span>
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   MOBILE SEARCH OVERLAY — full-screen Airbnb-style accordion search
   ════════════════════════════════════════════════════════════════════════════ */
function MobileSearchOverlay({
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
  const [expandedField, setExpandedField] = useState<SearchField>("activities");

  // Reset expanded field when overlay opens
  useEffect(() => {
    if (isOpen) setExpandedField("activities");
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const fields = [
    { key: "activities" as SearchField, label: "Activities", value: formatMultiSelectDisplay(activities), emptyText: "Add activities" },
    { key: "neighborhood" as SearchField, label: "Neighborhood", value: neighborhood, emptyText: "Add location" },
    { key: "when" as SearchField, label: "When", value: when, emptyText: "Add dates" },
    { key: "age" as SearchField, label: "Who", value: ageLabel, emptyText: "Add guests" },
  ];

  const renderPanel = (field: SearchField) => {
    switch (field) {
      case "activities": return <ActivityPanel value={activities} onChange={onActivitiesChange} />;
      case "neighborhood": return <NeighborhoodPanel value={neighborhood} onChange={onNeighborhoodChange} />;
      case "when": return <WhenPanel value={when} onChange={onWhenChange} />;
      case "age": return <AgePanel counts={ageCounts} onUpdate={onAgeUpdate} />;
      default: return null;
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[300] md:hidden transition-all duration-500 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-on-surface/30 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Overlay Panel */}
      <div
        className={`absolute inset-0 bg-surface flex flex-col transition-transform duration-500 ease-[cubic-bezier(.32,.72,0,1)] ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0">
          <span className="text-xl font-bold tracking-tighter text-primary font-headline">
            HAKUNA
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-on-surface/10 flex items-center justify-center hover:bg-surface-container-low transition-colors"
          >
            <Icon name="close" className="text-[18px] text-on-surface/70" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 pb-28">
          {fields.map((f, i) => (
            <div key={f.key}>
              {expandedField === f.key ? (
                /* ── Expanded Card ── */
                <div className="bg-surface-container-lowest rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] mb-4 overflow-hidden mobile-accordion-enter">
                  <div className="flex items-center justify-between px-6 pt-5 pb-1">
                    <h3 className="text-xl font-bold text-on-surface font-headline">{f.label}</h3>
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
                /* ── Collapsed Row ── */
                <button
                  onClick={() => setExpandedField(f.key)}
                  className="w-full flex items-center justify-between py-4 px-1 text-left active:bg-surface-container-low/50 transition-colors rounded-xl"
                >
                  <span className="text-sm font-semibold text-on-surface/50">{f.label}</span>
                  <span className="text-sm font-bold text-on-surface">{f.value || f.emptyText}</span>
                </button>
              )}
              {expandedField !== f.key && i < fields.length - 1 && expandedField !== fields[i + 1]?.key && (
                <div className="h-px bg-on-surface/[0.06] mx-1" />
              )}
            </div>
          ))}
        </div>

        {/* Sticky Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-lg border-t border-on-surface/[0.06] px-6 py-4 flex items-center justify-between">
          <button
            onClick={onClearAll}
            className="text-sm font-bold text-on-surface underline underline-offset-4 decoration-on-surface/30 hover:decoration-on-surface transition-colors"
          >
            Clear all
          </button>
          <button className="bg-primary text-on-primary px-7 py-3.5 rounded-full font-headline font-bold text-sm flex items-center gap-2 shadow-[0_8px_20px_rgba(180,15,85,0.3)] active:scale-95 transition-all">
            <Icon name="search" className="text-[18px]" />
            Search
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   MOBILE TODAY'S PICK CARD
   ════════════════════════════════════════════════════════════════════════════ */
function MobileTodaysPick() {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-headline font-bold text-on-surface">Today&apos;s Pick</h2>
        <span className="text-xs font-bold uppercase tracking-widest text-primary cursor-pointer">View all</span>
      </div>
      <div className="relative rounded-3xl overflow-hidden h-[220px]">
        <img
          alt="Sunrise Vinyasa Flow yoga session"
          className="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlqXn4n09xN2f9DAElfX4x81ij126SXbfpWo_xwleYNJR_1Mx7BjMA4B-FuFUmveCxVwk6V5_FZSTpsn-yWBwpc0xhKNO_vZ86rLf4REABK42B_80W4eMf6UM-FgquPFZ7HpSP8Le1cz9gLLZSz05TMKE6evFUt-pEIf87vCsCK3TPfWYdpz4vWobsTcZ-1ibRgHNTQsRYdRXAmPCt-n9sFrXGGfZ3GzRK2vuH7JfZTuOGRrvOxdiL9_83-njE5S85PNrDkmv_BW_O"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c17]/80 via-transparent to-transparent" />
        <div className="absolute bottom-5 left-5 right-5">
          <span className="inline-block bg-primary text-on-primary text-[0.6rem] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2">
            Starting Soon
          </span>
          <h3 className="text-xl font-bold text-white font-headline">Sunrise Vinyasa Flow</h3>
          <p className="text-sm text-white/70 mt-0.5">With Elena Grace · 7:30 AM</p>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   MOBILE ACTIVITY LIST ITEM
   ════════════════════════════════════════════════════════════════════════════ */
function MobileActivityListItem({
  title,
  subtitle,
  price,
  imageUrl,
  imageAlt,
}: {
  title: string;
  subtitle: string;
  price: string;
  imageUrl: string;
  imageAlt: string;
}) {
  return (
    <div className="flex items-center gap-3.5 py-3">
      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
        <img alt={imageAlt} className="w-full h-full object-cover" src={imageUrl} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[0.9rem] font-bold text-on-surface truncate">{title}</h4>
        <p className="text-xs text-on-surface/50 mt-0.5">{subtitle}</p>
      </div>
      <span className="text-xs font-bold text-primary bg-primary-fixed/30 px-2.5 py-1 rounded-full shrink-0">
        {price}
      </span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   SEARCH FIELD SEGMENT — shared between both bars
   ════════════════════════════════════════════════════════════════════════════ */
function SearchSegment({
  field,
  activeField,
  isExpanded,
  icon,
  label,
  displayValue,
  placeholder,
  onClick,
}: {
  field: SearchField;
  activeField: SearchField;
  isExpanded: boolean;
  icon: string;
  label: string;
  displayValue: string;
  placeholder: string;
  onClick: () => void;
}) {
  const isActive = activeField === field;
  return (
    <button
      type="button"
      data-field={field}
      onClick={onClick}
      className={`flex-1 w-full flex items-center px-6 py-3 rounded-full transition-all duration-300 text-left cursor-pointer relative z-10 ${
        isActive
          ? "bg-surface-container-lowest shadow-lg shadow-on-surface/[0.08]"
          : isExpanded
          ? "hover:bg-surface-container/60"
          : "hover:bg-surface-container/30"
      }`}
    >
      <Icon
        name={icon}
        className={`mr-4 text-[20px] transition-colors ${
          isActive ? "text-primary" : "text-primary/40"
        }`}
      />
      <div className="flex-1 min-w-0">
        <div className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-on-surface/40 mb-0.5">
          {label}
        </div>
        <div
          className={`text-[0.9rem] font-semibold truncate ${
            displayValue ? "text-on-surface" : "text-on-surface/30"
          }`}
        >
          {displayValue || placeholder}
        </div>
      </div>
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   INTERACTIVE HERO SEARCH BAR
   ════════════════════════════════════════════════════════════════════════════ */
function HeroSearchBar({
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
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  activities: string;
  neighborhood: string;
  when: string;
  ageCounts: AgeCounts;
  ageLabel: string;
  onActivitiesChange: (v: string) => void;
  onNeighborhoodChange: (v: string) => void;
  onWhenChange: (v: string) => void;
  onAgeUpdate: (key: keyof AgeCounts, delta: number) => void;
}) {
  const [activeField, setActiveField] = useState<SearchField>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const isExpanded = activeField !== null;

  const close = useCallback(() => setActiveField(null), []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [close]);

  // Close on click outside
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
    { field: "activities", icon: "search", label: "Activities", value: formatMultiSelectDisplay(activities), placeholder: "Tennis, pottery, yoga..." },
    { field: "neighborhood", icon: "near_me", label: "Neighborhood", value: neighborhood, placeholder: "Mitte, Berlin" },
    { field: "when", icon: "calendar_today", label: "When", value: when, placeholder: "Today" },
    { field: "age", icon: "person", label: "Age", value: ageLabel, placeholder: "Adult" },
  ];

  return (
    <div ref={containerRef} className="w-full max-w-5xl mb-12 relative z-30">
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-on-surface/30 transition-opacity duration-300 ${
          isExpanded ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ zIndex: 25 }}
        onClick={close}
      />

      <div ref={barRef} className="relative" style={{ zIndex: 30 }}>
        {/* Search Bar */}
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
                {/* Divider (hide between active neighbours) */}
                {i < fields.length - 1 && (
                  <div
                    className={`hidden md:block w-px h-8 bg-on-surface/[0.08] transition-opacity shrink-0 ${
                      activeField === fields[i].field || activeField === fields[i + 1].field
                        ? "opacity-0"
                        : ""
                    }`}
                  />
                )}
              </Fragment>
            ))}

            {/* Submit Button */}
            <div className="p-1 pl-4 shrink-0">
              <button
                className={`bg-primary text-on-primary flex items-center justify-center hover:scale-105 transition-all duration-300 shadow-[0_8px_20px_rgba(180,15,85,0.3)] active:scale-95 ${
                  isExpanded ? "rounded-full px-6 h-14 gap-2" : "w-14 h-14 rounded-full"
                }`}
              >
                <Icon name="search" className="text-[24px]" />
                {isExpanded && (
                  <span className="font-headline font-bold text-sm uppercase tracking-wider">
                    Search
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Panel */}
        <div
          className={`absolute left-0 right-0 mt-3 bg-surface-container-lowest rounded-[2rem] editorial-shadow overflow-hidden transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)] ${
            isExpanded
              ? "opacity-100 translate-y-0 max-h-[500px]"
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
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   COMPACT SEARCH BAR (lives inside the navbar when scrolled)
   ════════════════════════════════════════════════════════════════════════════ */
function CompactSearchBar({
  visible,
  onFieldClick,
  activities,
  neighborhood,
  when,
  ageLabel,
}: {
  visible: boolean;
  onFieldClick: (field: SearchField) => void;
  activities: string;
  neighborhood: string;
  when: string;
  ageLabel: string;
}) {
  return (
    <div
      className={`hidden md:flex flex-1 max-w-2xl mx-12 transition-all duration-500 ease-[cubic-bezier(.4,0,.2,1)] ${
        visible
          ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
          : "opacity-0 -translate-y-3 scale-95 pointer-events-none"
      }`}
    >
      <div className="w-full flex items-center bg-white/50 rounded-full py-1.5 px-2 border-2 border-[#E8407A] shadow-sm hover:shadow-md transition-all duration-300">
        <button
          onClick={() => onFieldClick("activities")}
          className="flex-1 flex flex-col px-4 border-r border-on-surface/5 text-left hover:bg-surface-container/30 rounded-l-full py-1.5 transition-colors cursor-pointer"
        >
          <span className="text-[0.55rem] font-bold uppercase tracking-wider text-on-surface/40 leading-none mb-0.5">
            Looking for?
          </span>
          <span className="text-[0.75rem] font-semibold text-on-surface truncate">
            {formatMultiSelectDisplay(activities) || "Activities"}
          </span>
        </button>
        <button
          onClick={() => onFieldClick("neighborhood")}
          className="flex-1 flex flex-col px-4 border-r border-on-surface/5 text-left hover:bg-surface-container/30 py-1.5 transition-colors cursor-pointer"
        >
          <span className="text-[0.55rem] font-bold uppercase tracking-wider text-on-surface/40 leading-none mb-0.5">
            Neighborhood
          </span>
          <span className="text-[0.75rem] font-semibold text-on-surface truncate">
            {neighborhood || "Mitte, Berlin"}
          </span>
        </button>
        <button
          onClick={() => onFieldClick("when")}
          className="flex-1 flex flex-col px-4 border-r border-on-surface/5 text-left hover:bg-surface-container/30 py-1.5 transition-colors cursor-pointer"
        >
          <span className="text-[0.55rem] font-bold uppercase tracking-wider text-on-surface/40 leading-none mb-0.5">
            When?
          </span>
          <span className="text-[0.75rem] font-semibold text-on-surface truncate">
            {when || "Today"}
          </span>
        </button>
        <button
          onClick={() => onFieldClick("age")}
          className="flex-1 flex flex-col px-4 text-left hover:bg-surface-container/30 rounded-r-full py-1.5 transition-colors cursor-pointer"
        >
          <span className="text-[0.55rem] font-bold uppercase tracking-wider text-on-surface/40 leading-none mb-0.5">
            Age
          </span>
          <span className="text-[0.75rem] font-semibold text-on-surface truncate">
            {ageLabel || "Adult"}
          </span>
        </button>
        <div className="bg-primary text-on-primary w-8 h-8 rounded-full flex items-center justify-center shrink-0 ml-1">
          <Icon name="search" className="text-[16px]" />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   NAV EXPANDED SEARCH (full-screen overlay like Airbnb)
   ════════════════════════════════════════════════════════════════════════════ */
function NavExpandedSearch({
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
}: {
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
}) {
  const [activeField, setActiveField] = useState<SearchField>(initialField);
  const barRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Close on click outside
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
    { field: "activities", icon: "search", label: "Activities", value: formatMultiSelectDisplay(activities), placeholder: "Tennis, pottery, yoga..." },
    { field: "neighborhood", icon: "near_me", label: "Neighborhood", value: neighborhood, placeholder: "Mitte, Berlin" },
    { field: "when", icon: "calendar_today", label: "When", value: when, placeholder: "Today" },
    { field: "age", icon: "person", label: "Age", value: ageLabel, placeholder: "Adult" },
  ];

  return (
    <div className="fixed inset-0 z-[200]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-on-surface/40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Container pinned to top */}
      <div
        ref={barRef}
        className="relative bg-[#fdf9f0] shadow-[0_10px_30px_rgba(0,0,0,0.12)] pt-20 pb-6 px-6"
      >
        <div className="max-w-5xl mx-auto relative">
          {/* Search bar */}
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
                      className={`hidden md:block w-px h-8 bg-on-surface/[0.08] transition-opacity shrink-0 ${
                        activeField === fields[i].field || activeField === fields[i + 1].field
                          ? "opacity-0"
                          : ""
                      }`}
                    />
                  )}
                </Fragment>
              ))}

              {/* Submit Button */}
              <div className="p-1 pl-4 shrink-0">
                <button
                  className="bg-primary text-on-primary flex items-center justify-center rounded-full px-6 h-14 gap-2 hover:scale-105 transition-all duration-300 shadow-[0_8px_20px_rgba(180,15,85,0.3)] active:scale-95"
                >
                  <Icon name="search" className="text-[24px]" />
                  <span className="font-headline font-bold text-sm uppercase tracking-wider">
                    Search
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Dropdown Panel */}
          <div
            className={`mt-3 bg-surface-container-lowest rounded-[2rem] editorial-shadow transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)] ${
              activeField
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

/* ════════════════════════════════════════════════════════════════════════════
   ACTIVITY CARD
   ════════════════════════════════════════════════════════════════════════════ */
function ActivityCard({
  title,
  time,
  location,
  price,
  imageUrl,
  imageAlt,
  offsetClass = "",
}: {
  title: string;
  time: string;
  location: string;
  price: string;
  imageUrl: string;
  imageAlt: string;
  offsetClass?: string;
}) {
  return (
    <div
      className={`bg-surface-container-lowest p-5 rounded-[2rem] flex gap-6 items-center border border-[#FAEEDA] editorial-shadow hover:scale-[1.02] transition-transform duration-300 ${offsetClass}`}
    >
      <div className="w-32 h-32 rounded-2xl overflow-hidden shrink-0">
        <img alt={imageAlt} className="w-full h-full object-cover" src={imageUrl} />
      </div>
      <div className="flex-grow">
        <h3 className="text-2xl font-bold text-on-surface mb-1">{title}</h3>
        <p className="text-primary font-semibold uppercase tracking-widest text-xs mb-3">{time}</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-on-surface/40 text-sm">
            <Icon name="location_on" className="text-[18px]" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-on-surface/40 text-sm">
            <Icon name="payments" className="text-[18px]" />
            <span className="font-bold text-on-surface/80">{price}</span>
          </div>
        </div>
      </div>
      <button className="mr-2 text-on-surface/20 hover:text-primary transition-colors">
        <Icon name="arrow_forward_ios" className="text-3xl" />
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   COMMUNITY CARD
   ════════════════════════════════════════════════════════════════════════════ */
function CommunityCard({
  label,
  title,
  imageUrl,
  imageAlt,
  tall = false,
}: {
  label: string;
  title: string;
  imageUrl: string;
  imageAlt: string;
  tall?: boolean;
}) {
  return (
    <div
      className={`relative group overflow-hidden rounded-[2rem] md:rounded-[3rem] ${
        tall ? "h-[280px] md:h-[500px] md:-mt-8" : "h-[250px] md:h-[450px]"
      }`}
    >
      <img
        alt={imageAlt}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        src={imageUrl}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c17] via-transparent to-transparent opacity-80" />
      <div className="absolute bottom-8 left-8 right-8 text-white">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-fixed mb-2">{label}</p>
        <h4 className="text-2xl font-bold">{title}</h4>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════════════════════ */
export default function Home() {
  const heroSearchRef = useRef<HTMLDivElement>(null);
  const [showCompactSearch, setShowCompactSearch] = useState(false);

  // Single source of truth for search state
  const [activities, setActivities] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [when, setWhen] = useState("");
  const [ageCounts, setAgeCounts] = useState<AgeCounts>({ kids: 0, teens: 0, adults: 1 });
  const [navExpandedField, setNavExpandedField] = useState<SearchField>(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleNavFieldClick = useCallback((field: SearchField) => {
    setNavExpandedField(field);
  }, []);

  const closeNavSearch = useCallback(() => {
    setNavExpandedField(null);
  }, []);

  const handleAgeUpdate = useCallback((key: keyof AgeCounts, delta: number) => {
    setAgeCounts((prev) => ({
      ...prev,
      [key]: Math.max(0, prev[key] + delta),
    }));
  }, []);

  const handleClearAll = useCallback(() => {
    setActivities("");
    setNeighborhood("");
    setWhen("");
    setAgeCounts({ kids: 0, teens: 0, adults: 1 });
  }, []);

  const ageLabel = (() => {
    const parts: string[] = [];
    if (ageCounts.adults > 0) parts.push(`${ageCounts.adults} Adult${ageCounts.adults > 1 ? "s" : ""}`);
    if (ageCounts.teens > 0) parts.push(`${ageCounts.teens} Teen${ageCounts.teens > 1 ? "s" : ""}`);
    if (ageCounts.kids > 0) parts.push(`${ageCounts.kids} Kid${ageCounts.kids > 1 ? "s" : ""}`);
    return parts.join(", ") || "";
  })();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowCompactSearch(!entry.isIntersecting),
      { root: null, threshold: 0.1, rootMargin: "-80px 0px 0px 0px" }
    );
    const el = heroSearchRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, []);

  const scrollToHeroSearch = () => {
    heroSearchRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <>
      {/* ─── TopNavBar ─── */}
      <nav className="fixed top-0 w-full z-50 bg-[#fdf9f0]/80 backdrop-blur-xl shadow-[0px_20px_40px_rgba(45,10,23,0.06)] transition-all duration-300">
        <div className="flex justify-between items-center px-4 md:px-8 py-3 md:py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-12">
            <a href="#" className="text-2xl font-bold tracking-tighter text-primary font-headline">
              HAKUNA
            </a>
            <div className="hidden md:flex gap-8">
              <a href="#" className="font-headline uppercase tracking-widest text-[0.75rem] font-semibold text-on-surface hover:text-primary hover:-translate-y-0.5 transition-all duration-300">
                For venues
              </a>
            </div>
          </div>

          <CompactSearchBar
            visible={showCompactSearch}
            onFieldClick={handleNavFieldClick}
            activities={activities}
            neighborhood={neighborhood}
            when={when}
            ageLabel={ageLabel}
          />

          <div className="flex items-center gap-6">
            <button className="hidden md:flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-widest hover:text-primary transition-colors">
              <Icon name="language" className="text-[18px]" />
              <span>EN</span>
            </button>
            <div className="hidden md:flex items-center gap-4">
              <button className="font-headline uppercase tracking-widest text-[0.75rem] font-semibold text-on-surface hover:text-primary transition-all">
                Log in
              </button>
              <button className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-headline uppercase tracking-widest text-[0.75rem] font-bold hover:bg-tertiary scale-95 hover:scale-100 duration-200 transition-all">
                Create account
              </button>
            </div>
            <button className="md:hidden w-9 h-9 rounded-full flex items-center justify-center hover:bg-primary-fixed/30 transition-colors">
              <Icon name="tune" className="text-[22px] text-primary" />
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-20 md:pt-24">
        {/* ─── Hero Section ─── */}
        <section className="relative px-4 md:px-6 py-10 md:py-32">
          <div className="max-w-7xl mx-auto text-left md:text-center flex flex-col items-start md:items-center">
            <h1 className="font-headline font-extrabold text-[2.25rem] md:text-[6rem] leading-[1.1] md:leading-[1.05] tracking-tight text-on-surface mb-6 md:mb-12">
              Start something <br />
              <span className="text-primary italic">new</span> today.
            </h1>

            {/* Mobile: Search Pill */}
            <MobileSearchPill onClick={() => setMobileSearchOpen(true)} />

            {/* Desktop: Interactive Search Bar + subtitle */}
            <div className="hidden md:contents">
              <HeroSearchBar
                containerRef={heroSearchRef}
                activities={activities}
                neighborhood={neighborhood}
                when={when}
                ageCounts={ageCounts}
                ageLabel={ageLabel}
                onActivitiesChange={setActivities}
                onNeighborhoodChange={setNeighborhood}
                onWhenChange={setWhen}
                onAgeUpdate={handleAgeUpdate}
              />

              <p className="text-on-surface/60 font-medium text-lg md:text-xl max-w-2xl">
                Hundreds of activities starting near you in the next 2 hours.
              </p>
            </div>
          </div>

          <div className="absolute -top-20 -right-20 w-96 h-96 bg-secondary-fixed/30 rounded-full blur-[100px] -z-10" />
          <div className="absolute bottom-0 -left-20 w-80 h-80 bg-primary-fixed/20 rounded-full blur-[80px] -z-10" />
        </section>

        {/* ─── Closest to You Section ─── */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-24">
          {/* ── Mobile Layout ── */}
          <div className="md:hidden">
            <MobileTodaysPick />
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-headline font-bold text-on-surface">Closest to You</h2>
                <span className="text-xs font-bold uppercase tracking-widest text-primary cursor-pointer">View all →</span>
              </div>
              <MobileActivityListItem
                title="Intro to Wheel Throwing"
                subtitle="Clay Studio · 0.4 miles away"
                price="€35"
                imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuBA_wFMjctlcwp-Pr0Qqxd9pmSGX4u9o9qb6l7WvTcCAUiPxdv9TcYveTEME1A9pymNOt44HkPuXlUDSKa7rrbRbtFn4AdhNYnqT8kvfkeYroUgwLx33sDPLTrsHolmK2Kl94Gij5ltB0dIVWzt9VTHbtpjeQpz58PbTRdsTRSPkGvuX6wwgdRugMWZJ3Ei52-fbUOsKLfxgHcgoPk96bhUwulzEitWBTbbEI-2kby28MID_insstTHfKZzZzWouZs0IDWv3jUoKR7V"
                imageAlt="Pottery workshop"
              />
              <div className="h-px bg-on-surface/[0.06]" />
              <MobileActivityListItem
                title="Open Padel Session"
                subtitle="Padel Hub · 1.2 miles away"
                price="€8"
                imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuA5I5nT9bIUDrn_ubXjy1Pp-XX5_X_tFmAGq1K3c7XQm2-76HnGeLQrEhIQADtIHi9KmoxSRPBbCuovFFY5EKM5PXdDM9ZAO9elA8j2pgTVHSfZJbBl5oouZNhgryMPaKUOpV_nn_14-XY-9W5NJfjWkXXmUDiCJFfURcICDcxfJSWn69GuWJugYKhyvu_WJkNZEDf0kPjpJHShlsPT95MKxXYaIeCIEUkB-6BD26o4KNx5or1onED_0BuqYOD9YBGB7fH0jCA8yYWI"
                imageAlt="Padel court"
              />
              <div className="h-px bg-on-surface/[0.06]" />
              <MobileActivityListItem
                title="Urban Run Club"
                subtitle="Park Entrance · 0.8 miles away"
                price="Free"
                imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuDlqXn4n09xN2f9DAElfX4x81ij126SXbfpWo_xwleYNJR_1Mx7BjMA4B-FuFUmveCxVwk6V5_FZSTpsn-yWBwpc0xhKNO_vZ86rLf4REABK42B_80W4eMf6UM-FgquPFZ7HpSP8Le1cz9gLLZSz05TMKE6evFUt-pEIf87vCsCK3TPfWYdpz4vWobsTcZ-1ibRgHNTQsRYdRXAmPCt-n9sFrXGGfZ3GzRK2vuH7JfZTuOGRrvOxdiL9_83-njE5S85PNrDkmv_BW_O"
                imageAlt="Running group"
              />
            </div>
          </div>

          {/* ── Desktop Layout ── */}
          <div className="hidden md:grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-20 items-start">
            <div className="space-y-8 sticky top-32">
              <div className="space-y-4">
                <span className="inline-block bg-secondary-container px-4 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-widest text-on-secondary-container">
                  Starting Soon
                </span>
                <h2 className="text-5xl md:text-7xl font-headline font-bold leading-none tracking-tighter">
                  Closest <br />to You
                </h2>
                <p className="text-xl text-on-surface/60 max-w-md">
                  Activities starting in the next 2 hours. Don&apos;t wait. The best things happen now.
                </p>
              </div>
              <button className="bg-primary text-on-primary px-10 py-5 rounded-xl font-headline font-extrabold uppercase tracking-[0.2em] text-sm hover:translate-y-[-4px] transition-all hover:shadow-2xl hover:bg-tertiary">
                BOOK IN 30 SECONDS
              </button>
              <div className="pt-8 grid grid-cols-2 gap-8 border-t border-on-surface/5">
                <div>
                  <div className="text-3xl font-bold text-primary">450+</div>
                  <div className="text-[0.7rem] uppercase font-bold tracking-widest opacity-40">Local Hosts</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">12min</div>
                  <div className="text-[0.7rem] uppercase font-bold tracking-widest opacity-40">Avg. Arrival</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <ActivityCard
                title="Sunrise Vinyasa Flow"
                time="Starts in 15 min"
                location="Prenzlauer Berg"
                price="€12.00"
                imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuDlqXn4n09xN2f9DAElfX4x81ij126SXbfpWo_xwleYNJR_1Mx7BjMA4B-FuFUmveCxVwk6V5_FZSTpsn-yWBwpc0xhKNO_vZ86rLf4REABK42B_80W4eMf6UM-FgquPFZ7HpSP8Le1cz9gLLZSz05TMKE6evFUt-pEIf87vCsCK3TPfWYdpz4vWobsTcZ-1ibRgHNTQsRYdRXAmPCt-n9sFrXGGfZ3GzRK2vuH7JfZTuOGRrvOxdiL9_83-njE5S85PNrDkmv_BW_O"
                imageAlt="Yoga session in a sun-drenched studio"
              />
              <ActivityCard
                title="Intro to Wheel Throwing"
                time="Starts in 42 min"
                location="Mitte District"
                price="€35.00"
                imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuBA_wFMjctlcwp-Pr0Qqxd9pmSGX4u9o9qb6l7WvTcCAUiPxdv9TcYveTEME1A9pymNOt44HkPuXlUDSKa7rrbRbtFn4AdhNYnqT8kvfkeYroUgwLx33sDPLTrsHolmK2Kl94Gij5ltB0dIVWzt9VTHbtpjeQpz58PbTRdsTRSPkGvuX6wwgdRugMWZJ3Ei52-fbUOsKLfxgHcgoPk96bhUwulzEitWBTbbEI-2kby28MID_insstTHfKZzZzWouZs0IDWv3jUoKR7V"
                imageAlt="Artisanal pottery studio workshop"
                offsetClass="translate-x-4 lg:translate-x-8"
              />
              <ActivityCard
                title="Open Padel Session"
                time="Starts in 1h 05 min"
                location="Friedrichshain"
                price="€8.00"
                imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuA5I5nT9bIUDrn_ubXjy1Pp-XX5_X_tFmAGq1K3c7XQm2-76HnGeLQrEhIQADtIHi9KmoxSRPBbCuovFFY5EKM5PXdDM9ZAO9elA8j2pgTVHSfZJbBl5oouZNhgryMPaKUOpV_nn_14-XY-9W5NJfjWkXXmUDiCJFfURcICDcxfJSWn69GuWJugYKhyvu_WJkNZEDf0kPjpJHShlsPT95MKxXYaIeCIEUkB-6BD26o4KNx5or1onED_0BuqYOD9YBGB7fH0jCA8yYWI"
                imageAlt="Modern outdoor padel court at sunset"
                offsetClass="translate-x-2"
              />
            </div>
          </div>
        </section>

        {/* ─── Community Section ─── */}
        <section className="bg-secondary-fixed/20 py-12 md:py-24 mt-8 md:mt-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-headline font-bold mb-6 tracking-tight">The Hakuna Way</h2>
              <p className="text-lg text-on-surface/70 max-w-2xl mx-auto">
                Discover the magic of spontaneous city life. No planning required, just pure discovery of your local neighborhood&apos;s hidden gems.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <CommunityCard label="Community" title="Meet Local Souls" imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuDzfvOLNh5iMtRP73C0f8agdkHifQgMgfdL3BzKQyIjZcEqHJ5wlF-n6CE0b_uAucK-wu5ODI3QYAY1N3Vv88YmB2TNbdT65wwY7T-f2ZbeXCB9BvJaLIB3x-UE6XDex9R3RN9O7CnXmoTC0hqrI3cebXigL59rQy9sXUCmACGTCNKih-kOLgCC2N4ISUBSWrFhJBKC-ZChIDq7AIWk3iTm5jddi0Ilj16I2nCcZpBomozdkmF9eMoRKhVXH-YTCwbz2wLdkQZz8zGm" imageAlt="Group of diverse friends at an outdoor garden cafe" />
              <CommunityCard label="Discovery" title="Uncover Secret Spots" imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuBfRlg8iaj2MNMoV7mamt5dzTNOnAPNFsYwoEEEkJVr-ZtRTwSGOIpu3p47QGo1G2BPn0uKEnx3uwU2HhlDSLypCRFa8sIwjS4yT2wEd4g0aMq1Q5xykV4aJmiazFcCsPGkznZJtakEBeHzaKg-XfZ3u38IzTfzMVZtgKAUDcQ2HnjWUQqY0nxY0vclGwFTk3qJ6yNDDgzJQsmfqI_T09XHz9Z3CT1GTx_4HllUdp0h0MjUN3nBUpCUar_z2h0ROBu3b6AFMyN-SFU8" imageAlt="Intimate acoustic concert in a small library" tall />
              <CommunityCard label="Experience" title="Learn Something New" imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuDd5zc-bopDGFw_qwLSQ-frCeESAtMcpoa6-rodGtZlcu-g--ln0xkQzKOnsSA7amnrEpICSVJiNxPzbxE6DqChHbSO4vc7Xtf_g3GpLGmnsN6MuZxHhAs8Z0uMS7uxW2_zEXbnyIlKyaNW0tcgTsDaXwAroMakXOJ0ZpLjtOxvZVIpO4sqQnLjNU-tiqVmjHzv_8b-hI6zLC-loWrb5k-7uSACRUlmElZVzbVWx_MhxC3Al9eYZJnEnOPtMoO4XoZNwjwaK77rEmXB" imageAlt="Group engaged in a creative watercolor painting class" />
            </div>
          </div>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="w-full rounded-t-[2rem] md:rounded-t-[3rem] mt-10 md:mt-20 bg-surface-container-low">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 py-10 md:py-16 gap-8 max-w-7xl mx-auto">
          <div className="space-y-4 text-center md:text-left">
            <a href="#" className="text-xl font-bold text-on-surface">HAKUNA</a>
            <p className="font-body text-sm leading-relaxed text-on-surface/60">© 2024 HAKUNA. The Golden Curator.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            {["Privacy Policy", "Terms of Service", "Contact Us", "Instagram", "LinkedIn"].map((link) => (
              <a key={link} href="#" className="font-body text-sm leading-relaxed text-on-surface/60 hover:text-primary transition-colors">{link}</a>
            ))}
          </div>
          <div className="flex gap-4">
            {["share", "favorite"].map((icon) => (
              <div key={icon} className="w-10 h-10 rounded-full bg-on-surface/5 flex items-center justify-center hover:bg-primary/10 transition-colors cursor-pointer">
                <Icon name={icon} className="text-[20px]" />
              </div>
            ))}
          </div>
        </div>
      </footer>
      {/* ─── Nav Expanded Search Overlay ─── */}
      {navExpandedField && (
        <NavExpandedSearch
          initialField={navExpandedField}
          onClose={closeNavSearch}
          activities={activities}
          neighborhood={neighborhood}
          when={when}
          ageCounts={ageCounts}
          ageLabel={ageLabel}
          onActivitiesChange={setActivities}
          onNeighborhoodChange={setNeighborhood}
          onWhenChange={setWhen}
          onAgeUpdate={handleAgeUpdate}
        />
      )}

      {/* ─── Mobile Search Overlay ─── */}
      <MobileSearchOverlay
        isOpen={mobileSearchOpen}
        onClose={() => setMobileSearchOpen(false)}
        activities={activities}
        neighborhood={neighborhood}
        when={when}
        ageCounts={ageCounts}
        ageLabel={ageLabel}
        onActivitiesChange={setActivities}
        onNeighborhoodChange={setNeighborhood}
        onWhenChange={setWhen}
        onAgeUpdate={handleAgeUpdate}
        onClearAll={handleClearAll}
      />
    </>
  );
}
