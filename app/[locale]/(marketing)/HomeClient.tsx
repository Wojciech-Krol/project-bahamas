"use client";

import { useEffect, useRef, useState, useCallback, Fragment } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/src/i18n/navigation";
import { buildSearchQuery } from "@/app/lib/searchQuery";
import SiteFooter from "@/app/components/SiteFooter";
import SiteNavbar from "@/app/components/SiteNavbar";
import ProximityDots from "@/app/components/ProximityDots";
import Reveal from "@/app/components/Reveal";
import BetaSignup from "@/app/components/BetaSignup";
import ReviewsSection from "@/app/components/ReviewsSection";
import ClosestToYouCarousel from "@/app/components/ClosestToYouCarousel";
import MobileActivityCarousel from "@/app/components/MobileActivityCarousel";
import { Icon } from "@/app/components/Icon";
import HeroJuicyStage from "@/app/components/hero/HeroJuicyStage";
import HeroSearchBar from "@/app/components/search/HeroSearchBar";
import SearchSegment from "@/app/components/search/SearchSegment";
import { MobileSearchPill, MobileSearchOverlay } from "@/app/components/search/MobileSearch";
import {
  ActivityPanel,
  NeighborhoodPanel,
  WhenPanel,
  AgePanel,
} from "@/app/components/search/panels";
import {
  formatMultiSelectDisplay,
  type SearchField,
  type AgeCounts,
} from "@/app/components/search/constants";
import type { Activity, Review } from "@/app/lib/mockData";

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
  onSubmit,
  activities,
  neighborhood,
  when,
  ageLabel,
}: {
  visible: boolean;
  onFieldClick: (field: SearchField) => void;
  onSubmit: () => void;
  activities: string;
  neighborhood: string;
  when: string;
  ageLabel: string;
}) {
  const t = useTranslations();
  const formatActivities = useFormatActivities();
  return (
    <div
      className={`hidden md:flex flex-1 min-w-0 justify-center mx-4 lg:mx-8 transition-all duration-500 ease-[cubic-bezier(.4,0,.2,1)] ${visible
          ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
          : "opacity-0 -translate-y-3 scale-95 pointer-events-none"
        }`}
    >
      <div className="w-full max-w-[700px] flex items-center bg-white/50 rounded-full py-1.5 px-2 border-2 border-[#E8407A] shadow-sm hover:shadow-md transition-all duration-300">
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
        <button
          type="button"
          onClick={onSubmit}
          aria-label={t("Common.search")}
          className="bg-primary text-on-primary w-8 h-8 rounded-full flex items-center justify-center shrink-0 ml-1 hover:scale-105 active:scale-95 transition-transform"
        >
          <Icon name="search" className="text-[16px]" />
        </button>
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

export default function HomeClient({
  closestActivities,
  reviews,
}: {
  closestActivities: Activity[];
  reviews: Review[];
}) {
  const t = useTranslations();
  const tAge = useTranslations("Search.ageLabel");
  const router = useRouter();
  const heroSearchRef = useRef<HTMLDivElement>(null);
  const [showCompactSearch, setShowCompactSearch] = useState(false);

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

  const submitSearch = useCallback(() => {
    const qs = buildSearchQuery({ activities, neighborhood, when, ageCounts });
    router.push(`/search${qs ? `?${qs}` : ""}`);
    setNavExpandedField(null);
    setMobileSearchOpen(false);
  }, [activities, neighborhood, when, ageCounts, router]);

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
      <ProximityDots />
      <SiteNavbar>
        <CompactSearchBar
          visible={showCompactSearch}
          onFieldClick={handleNavFieldClick}
          onSubmit={submitSearch}
          activities={activities}
          neighborhood={neighborhood}
          when={when}
          ageLabel={ageLabel}
        />
      </SiteNavbar>

      <main className="pt-16 md:pt-[72px] relative z-10">
        <HeroJuicyStage
          titleStart={t("Home.hero.titleStart")}
          titleMiddle={t("Home.hero.titleMiddle")}
          titleEnd={t("Home.hero.titleEnd")}
          subtitle={t("Home.hero.subtitle")}
          mobileSearch={
            <MobileSearchPill onClick={() => setMobileSearchOpen(true)} />
          }
          desktopSearch={
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
              onSubmit={submitSearch}
              className="w-full"
            />
          }
        />

        <section className="max-w-site mx-auto px-4 md:px-6 pt-2 pb-8 md:pt-6 md:pb-24 relative">
          <div className="md:hidden">
            <Reveal stagger={0.08} className="mb-6 space-y-3">
              <Reveal.Item>
                <span className="inline-block bg-secondary-container px-3 py-1 rounded-full text-[0.6rem] font-bold uppercase tracking-widest text-on-secondary-container">
                  {t("Home.closest.badge")}
                </span>
              </Reveal.Item>
              <Reveal.Item as="h2" className="text-4xl font-headline font-bold leading-[1.05] tracking-tighter">
                {t("Home.closest.headingStart")} {t("Home.closest.headingEnd")}
              </Reveal.Item>
              <Reveal.Item as="p" className="text-base text-on-surface/60">
                {t("Home.closest.body")}
              </Reveal.Item>
            </Reveal>
            <MobileActivityCarousel activities={closestActivities} />
          </div>

          <div className="hidden md:block">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-center">
              <Reveal stagger={0.09} className="space-y-8">
                <Reveal.Item>
                  <span className="inline-block bg-secondary-container px-4 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-widest text-on-secondary-container mb-6">
                    {t("Home.closest.badge")}
                  </span>
                  <h2 className="text-5xl md:text-7xl font-headline font-bold leading-none tracking-tighter">
                    {t("Home.closest.headingStart")} <br />
                    {t("Home.closest.headingEnd")}
                  </h2>
                </Reveal.Item>
                <Reveal.Item as="p" className="text-xl text-on-surface/60 max-w-md">
                  {t("Home.closest.body")}
                </Reveal.Item>
                <Reveal.Item>
                  <Link
                    href="/search"
                    className="inline-block bg-primary text-on-primary px-10 py-5 rounded-xl font-headline font-extrabold uppercase tracking-[0.2em] text-sm hover:translate-y-[-4px] transition-all hover:shadow-2xl hover:bg-tertiary"
                  >
                    {t("Home.closest.cta")}
                  </Link>
                </Reveal.Item>
                <Reveal.Item className="grid grid-cols-2 gap-8 border-t border-on-surface/5 pt-6 max-w-md">
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
                </Reveal.Item>
              </Reveal>
              <Reveal direction="right" delay={0.25} y={32} blur={2}>
                <ClosestToYouCarousel activities={closestActivities} />
              </Reveal>
            </div>
          </div>
        </section>

        <ReviewsSection reviews={reviews} />

        <BetaSignup />
      </main>

      <div className="relative z-10">
        <SiteFooter />
      </div>
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
        onSubmit={submitSearch}
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
        onSubmit={submitSearch}
      />
    </>
  );
}
