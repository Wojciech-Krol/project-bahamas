"use client";

import { useEffect, useRef, useState, useCallback, Fragment } from "react";
import { useTranslations } from "next-intl";
import { Link } from "../../src/i18n/navigation";
import SiteFooter from "../components/SiteFooter";
import BetaSignup from "../components/BetaSignup";
import ReviewsSection from "../components/ReviewsSection";
import ClosestToYouCarousel from "../components/ClosestToYouCarousel";
import MobileActivityCarousel from "../components/MobileActivityCarousel";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { Icon } from "../components/Icon";
import HeroSearchBar from "../components/search/HeroSearchBar";
import SearchSegment from "../components/search/SearchSegment";
import { MobileSearchPill, MobileSearchOverlay } from "../components/search/MobileSearch";
import {
  ActivityPanel,
  NeighborhoodPanel,
  WhenPanel,
  AgePanel,
} from "../components/search/panels";
import {
  formatMultiSelectDisplay,
  type SearchField,
  type AgeCounts,
} from "../components/search/constants";
import { useClosestActivities, useReviews } from "../lib/i18nData";

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
  const t = useTranslations();
  const formatActivities = useFormatActivities();
  return (
    <div
      className={`hidden md:flex flex-1 min-w-0 max-w-2xl mx-12 transition-all duration-500 ease-[cubic-bezier(.4,0,.2,1)] ${visible
          ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
          : "opacity-0 -translate-y-3 scale-95 pointer-events-none"
        }`}
    >
      <div className="w-full flex items-center bg-white/50 rounded-full py-1.5 px-2 border-2 border-[#E8407A] shadow-sm hover:shadow-md transition-all duration-300">
        <button
          onClick={() => onFieldClick("activities")}
          className="flex-1 min-w-0 flex flex-col px-4 border-r border-on-surface/5 text-left hover:bg-surface-container/30 rounded-l-full py-1.5 transition-colors cursor-pointer"
        >
          <span className="text-[0.55rem] font-bold uppercase tracking-wider text-on-surface/40 leading-none mb-0.5">
            {t("Search.looking")}
          </span>
          <span className="text-[0.75rem] font-semibold text-on-surface truncate">
            {formatMultiSelectDisplay(formatActivities(activities)) ||
              t("Search.field.activitiesLabel")}
          </span>
        </button>
        <button
          onClick={() => onFieldClick("neighborhood")}
          className="flex-1 min-w-0 flex flex-col px-4 border-r border-on-surface/5 text-left hover:bg-surface-container/30 py-1.5 transition-colors cursor-pointer"
        >
          <span className="text-[0.55rem] font-bold uppercase tracking-wider text-on-surface/40 leading-none mb-0.5">
            {t("Search.field.neighborhoodLabel")}
          </span>
          <span className="text-[0.75rem] font-semibold text-on-surface truncate">
            {neighborhood || t("Search.field.neighborhoodPlaceholder")}
          </span>
        </button>
        <button
          onClick={() => onFieldClick("when")}
          className="flex-1 min-w-0 flex flex-col px-4 border-r border-on-surface/5 text-left hover:bg-surface-container/30 py-1.5 transition-colors cursor-pointer"
        >
          <span className="text-[0.55rem] font-bold uppercase tracking-wider text-on-surface/40 leading-none mb-0.5">
            {t("Search.field.whenLabel")}
          </span>
          <span className="text-[0.75rem] font-semibold text-on-surface truncate">
            {when || t("Search.field.whenPlaceholder")}
          </span>
        </button>
        <button
          onClick={() => onFieldClick("age")}
          className="flex-1 min-w-0 flex flex-col px-4 text-left hover:bg-surface-container/30 rounded-r-full py-1.5 transition-colors cursor-pointer"
        >
          <span className="text-[0.55rem] font-bold uppercase tracking-wider text-on-surface/40 leading-none mb-0.5">
            {t("Search.field.ageLabel")}
          </span>
          <span className="text-[0.75rem] font-semibold text-on-surface truncate">
            {ageLabel || t("Search.field.agePlaceholder")}
          </span>
        </button>
        <div className="bg-primary text-on-primary w-8 h-8 rounded-full flex items-center justify-center shrink-0 ml-1">
          <Icon name="search" className="text-[16px]" />
        </div>
      </div>
    </div>
  );
}

function NavExpandedSearch({
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
}) {
  const t = useTranslations();
  const formatActivities = useFormatActivities();
  const [activeField, setActiveField] = useState<SearchField>(initialField);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveField(initialField);
    }
  }, [isOpen, initialField]);

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
                <button className="bg-primary text-on-primary flex items-center justify-center rounded-full px-6 h-14 gap-2 hover:scale-105 transition-all duration-300 shadow-[0_8px_20px_rgba(180,15,85,0.3)] active:scale-95">
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

export default function Home() {
  const t = useTranslations();
  const tAge = useTranslations("Search.ageLabel");
  const closestActivities = useClosestActivities();
  const reviews = useReviews();
  const heroSearchRef = useRef<HTMLDivElement>(null);
  const [showCompactSearch, setShowCompactSearch] = useState(false);

  const [activities, setActivities] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [when, setWhen] = useState("");
  const [ageCounts, setAgeCounts] = useState<AgeCounts>({ kids: 0, teens: 0, adults: 1 });
  const [navExpandedField, setNavExpandedField] = useState<SearchField>(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    if (ageCounts.adults > 0) parts.push(tAge("adults", { count: ageCounts.adults }));
    if (ageCounts.teens > 0) parts.push(tAge("teens", { count: ageCounts.teens }));
    if (ageCounts.kids > 0) parts.push(tAge("kids", { count: ageCounts.kids }));
    return parts.join(", ");
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

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-[#fdf9f0]/80 backdrop-blur-xl shadow-[0px_20px_40px_rgba(45,10,23,0.06)] transition-all duration-300">
        <div className="flex justify-between items-center px-4 md:px-8 py-3 md:py-4 max-w-site mx-auto relative">
          <div className="flex items-center gap-12 shrink-0">
            <Link href="/" className="text-2xl font-bold tracking-tighter text-primary font-headline">
              HAKUNA
            </Link>
            <div className="hidden md:flex gap-8">
              <Link href="/search" className="font-headline uppercase tracking-widest text-[0.75rem] font-semibold text-on-surface hover:text-primary hover:-translate-y-0.5 transition-all duration-300">
                {t("Nav.explore")}
              </Link>
              <Link href="/about" className="font-headline uppercase tracking-widest text-[0.75rem] font-semibold text-on-surface hover:text-primary hover:-translate-y-0.5 transition-all duration-300">
                {t("Nav.about")}
              </Link>
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

          <div className="hidden md:flex items-center gap-6 shrink-0">
            <LanguageSwitcher />
            <div className="hidden md:flex items-center gap-4">
              <button className="font-headline uppercase tracking-widest text-[0.75rem] font-semibold text-on-surface hover:text-primary transition-all">
                {t("Common.login")}
              </button>
              <button className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-headline uppercase tracking-widest text-[0.75rem] font-bold hover:bg-tertiary scale-95 hover:scale-100 duration-200 transition-all">
                {t("Common.signup")}
              </button>
            </div>
          </div>

          <button
            className="md:hidden w-10 h-10 rounded-full bg-on-surface/5 flex items-center justify-center active:scale-95 transition-transform"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label={t("Nav.toggleMenu")}
          >
            <Icon name={mobileMenuOpen ? "close" : "menu"} className="text-[22px]" />
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-on-surface/5 bg-[#fdf9f0]/95 backdrop-blur-xl">
            <div className="flex flex-col px-4 py-4 gap-1">
              <Link
                href="/search"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-3 rounded-xl font-headline uppercase tracking-widest text-[0.8rem] font-semibold text-on-surface hover:bg-primary-fixed/30 hover:text-primary transition-all"
              >
                {t("Nav.explore")}
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-3 rounded-xl font-headline uppercase tracking-widest text-[0.8rem] font-semibold text-on-surface hover:bg-primary-fixed/30 hover:text-primary transition-all"
              >
                {t("Nav.about")}
              </Link>
              <div className="px-3 py-2">
                <LanguageSwitcher />
              </div>
              <div className="h-px bg-on-surface/5 my-2" />
              <button className="px-3 py-3 text-left font-headline uppercase tracking-widest text-[0.8rem] font-semibold text-on-surface">
                {t("Common.login")}
              </button>
              <button className="mt-1 bg-primary text-on-primary px-4 py-3 rounded-xl font-headline uppercase tracking-widest text-[0.8rem] font-bold">
                {t("Common.signup")}
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="pt-20 md:pt-24">
        <section className="relative px-4 md:px-6 py-10 md:py-32">
          <div className="max-w-site mx-auto text-center flex flex-col items-center">
            <h1 className="font-headline font-extrabold text-[2.25rem] md:text-[6rem] leading-[1.1] md:leading-[1.05] tracking-tight text-on-surface mb-6 md:mb-12">
              {t("Home.hero.titleStart")} <br />
              <span className="text-primary italic">{t("Home.hero.titleMiddle")}</span>{" "}
              {t("Home.hero.titleEnd")}
            </h1>

            <div className="md:hidden w-full mb-6">
              <MobileSearchPill onClick={() => setMobileSearchOpen(true)} />
            </div>

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

              <p className="text-on-surface/60 font-medium text-lg md:text-xl max-w-2xl mt-6">
                {t("Home.hero.subtitle")}
              </p>
            </div>
          </div>

          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-secondary-fixed/30 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 -left-20 w-80 h-80 bg-primary-fixed/20 rounded-full blur-[80px]" />
          </div>
        </section>

        <section className="max-w-site mx-auto px-4 md:px-6 py-8 md:py-24">
          <div className="md:hidden">
            <MobileActivityCarousel activities={closestActivities} />
          </div>

          <div className="hidden md:block">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-center">
              <div className="space-y-8">
                <div>
                  <span className="inline-block bg-secondary-container px-4 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-widest text-on-secondary-container mb-6">
                    {t("Home.closest.badge")}
                  </span>
                  <h2 className="text-5xl md:text-7xl font-headline font-bold leading-none tracking-tighter">
                    {t("Home.closest.headingStart")} <br />
                    {t("Home.closest.headingEnd")}
                  </h2>
                </div>
                <p className="text-xl text-on-surface/60 max-w-md">
                  {t("Home.closest.body")}
                </p>
                <Link
                  href="/search"
                  className="inline-block bg-primary text-on-primary px-10 py-5 rounded-xl font-headline font-extrabold uppercase tracking-[0.2em] text-sm hover:translate-y-[-4px] transition-all hover:shadow-2xl hover:bg-tertiary"
                >
                  {t("Home.closest.cta")}
                </Link>
                <div className="grid grid-cols-2 gap-8 border-t border-on-surface/5 pt-6 max-w-md">
                  <div>
                    <div className="text-3xl font-bold text-primary">
                      {t("Home.closest.statHostsValue")}
                    </div>
                    <div className="text-[0.7rem] uppercase font-bold tracking-widest opacity-40">
                      {t("Home.closest.statHostsLabel")}
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary">
                      {t("Home.closest.statArrivalValue")}
                    </div>
                    <div className="text-[0.7rem] uppercase font-bold tracking-widest opacity-40">
                      {t("Home.closest.statArrivalLabel")}
                    </div>
                  </div>
                </div>
              </div>
              <ClosestToYouCarousel activities={closestActivities} />
            </div>
          </div>
        </section>

        <ReviewsSection reviews={reviews} />

        <BetaSignup />
      </main>

      <SiteFooter />
      <NavExpandedSearch
        isOpen={!!navExpandedField}
        initialField={navExpandedField || "activities"}
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
