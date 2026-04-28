"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/src/i18n/navigation";
import { buildSearchQueryRecord } from "@/src/lib/searchQuery";
import SiteFooter from "@/src/components/SiteFooter";
import SiteNavbar from "@/src/components/SiteNavbar";
import ProximityDots from "@/src/components/ProximityDots";
import Reveal from "@/src/components/Reveal";
import BetaSignup from "@/src/components/BetaSignup";
import ReviewsSection from "@/src/components/ReviewsSection";
import ClosestToYouCarousel from "@/src/components/ClosestToYouCarousel";
import MobileActivityCarousel from "@/src/components/MobileActivityCarousel";
import { Icon } from "@/src/components/Icon";
import HeroJuicyStage from "@/src/components/hero/HeroJuicyStage";
import HeroSearchBar from "@/src/components/search/HeroSearchBar";
import { MobileSearchPill } from "@/src/components/search/MobileSearch";
import {
  formatMultiSelectDisplay,
  type SearchField,
  type AgeCounts,
} from "@/src/components/search/constants";
import type { Activity, Review } from "@/src/lib/mockData";

const NavExpandedSearch = dynamic(
  () => import("@/src/components/search/NavExpandedSearch"),
  { ssr: false },
);

const MobileSearchOverlay = dynamic(
  () =>
    import("@/src/components/search/MobileSearch").then(
      (mod) => mod.MobileSearchOverlay,
    ),
  { ssr: false },
);

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
  // Track first-open events so the dynamic-imported overlays mount lazily
  // (no chunk fetch on landing) but stay mounted afterwards to preserve
  // close-transition animations.
  const [navOverlayLoaded, setNavOverlayLoaded] = useState(false);
  const [mobileOverlayLoaded, setMobileOverlayLoaded] = useState(false);

  const handleNavFieldClick = useCallback((field: SearchField) => {
    setNavOverlayLoaded(true);
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
    const query = buildSearchQueryRecord({
      activities,
      neighborhood,
      when,
      ageCounts,
    });
    router.push({ pathname: "/search", query });
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
            <MobileSearchPill
              onClick={() => {
                setMobileOverlayLoaded(true);
                setMobileSearchOpen(true);
              }}
            />
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
      {navOverlayLoaded && (
        <NavExpandedSearch
          isOpen={navExpandedField !== null}
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
      )}

      {mobileOverlayLoaded && (
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
      )}
    </>
  );
}
