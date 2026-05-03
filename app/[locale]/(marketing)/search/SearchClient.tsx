"use client";

import { useCallback, useMemo, useState, useRef, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/src/i18n/navigation";
import SiteNavbar from "@/src/components/SiteNavbar";
import { Icon } from "@/src/components/Icon";
import HeartButton from "@/src/components/HeartButton";
import PageSearchBar from "@/src/components/search/PageSearchBar";
import { MobileSearchOverlay } from "@/src/components/search/MobileSearch";
import { useSearchState } from "@/src/components/search/useSearchState";
import FilterDrawer from "@/src/components/search/FilterDrawer";
import dynamic from "next/dynamic";

// Mapbox GL pulls ~90KB gzipped + 30KB CSS — keep it off the search page's
// initial bundle. ssr:false because mapbox-gl touches `window` at import.
const MapboxMap = dynamic(() => import("@/src/components/MapboxMap"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-surface-container-low animate-pulse" />
  ),
});
import MobileActivityCarousel from "@/src/components/MobileActivityCarousel";
import { buildSearchQueryRecord, type SearchParams } from "@/src/lib/searchQuery";
import type { Activity } from "@/src/lib/mockData";
import { tablerIconForTitle } from "@/src/lib/categoryIcons";

function CompactCard({
  activity,
  favorited,
}: {
  activity: Activity;
  favorited: boolean;
}) {
  const t = useTranslations();
  return (
    <Link
      href={{
        pathname: "/activity/[slug]",
        params: { slug: activity.slug ?? activity.id },
      }}
      className="group flex flex-col bg-surface-container-lowest rounded-2xl overflow-hidden border border-on-surface/[0.05] editorial-shadow hover:-translate-y-0.5 transition-transform duration-200"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary-fixed to-secondary-fixed">
        {activity.imageUrl && (
          <img
            src={activity.imageUrl}
            alt={activity.imageAlt}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        {activity.tag && (
          <span className="absolute top-2 left-2 bg-primary text-on-primary px-2.5 py-0.5 rounded-full text-[0.6rem] font-bold uppercase tracking-widest">
            {activity.tag}
          </span>
        )}
        <div className="absolute top-2 right-2">
          <HeartButton
            activityId={activity.id}
            initialFavorited={favorited}
            variant="card"
            loginNext={`/activity/${activity.slug ?? activity.id}`}
          />
        </div>
      </div>
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-headline font-bold text-sm text-on-surface leading-tight line-clamp-1">
            {activity.title}
          </h3>
          <span className="text-primary font-bold text-sm whitespace-nowrap shrink-0">
            {activity.price}
          </span>
        </div>
        <div className="flex items-center gap-1 text-on-surface/50 text-xs min-w-0">
          <Icon name="location_on" className="text-[14px] shrink-0" />
          <span className="truncate">{activity.location}</span>
        </div>
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-on-surface/[0.06]">
          <div className="flex items-center gap-1.5 min-w-0">
            {activity.instructorAvatar && (
              <img
                src={activity.instructorAvatar}
                alt=""
                className="w-5 h-5 rounded-full object-cover"
              />
            )}
            <span className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface/55 truncate">
              {t("Common.joinedCount", { count: activity.joined ?? 0 })}
            </span>
          </div>
          <span className="bg-primary-fixed text-primary px-3 py-1 rounded-full font-semibold text-xs">
            {t("Common.book")}
          </span>
        </div>
      </div>
    </Link>
  );
}

const WARSAW_CENTER: [number, number] = [21.0122, 52.2297];

function MobileTopBar({
  onOpenSearch,
  onOpenFilters,
  filterCount,
}: {
  onOpenSearch: () => void;
  onOpenFilters: () => void;
  filterCount: number;
}) {
  const t = useTranslations();
  const router = useRouter();
  return (
    <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-[#fdf9f0]/90 backdrop-blur-xl border-b border-on-surface/[0.06] px-3 pt-[max(12px,env(safe-area-inset-top))] pb-3 flex items-center gap-2">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label={t("Common.previous")}
        className="w-11 h-11 rounded-full bg-surface-container-lowest border border-on-surface/10 flex items-center justify-center shrink-0 active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
      >
        <Icon name="arrow_back" className="text-[20px]" />
      </button>
      <button
        type="button"
        onClick={onOpenSearch}
        className="flex-1 min-w-0 flex items-center gap-2 bg-surface-container-lowest rounded-full pl-4 pr-5 py-3 border border-on-surface/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.08)] active:scale-[0.99] transition-all"
      >
        <Icon name="search" className="text-[18px] text-on-surface/60 shrink-0" />
        <span className="text-[0.85rem] font-semibold text-on-surface/70 truncate text-left">
          {t("Search.mobilePillPlaceholder")}
        </span>
      </button>
      <button
        type="button"
        onClick={onOpenFilters}
        aria-label={t("Common.filters")}
        className="relative w-11 h-11 rounded-full bg-surface-container-lowest border border-on-surface/10 flex items-center justify-center shrink-0 active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
      >
        <Icon name="tune" className="text-[20px]" />
        {filterCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 rounded-full bg-primary text-on-primary text-[0.65rem] font-bold inline-flex items-center justify-center">
            {filterCount}
          </span>
        )}
      </button>
    </div>
  );
}

function MobileBottomSheet({
  count,
  city,
  children,
}: {
  count: number;
  city: string;
  children: React.ReactNode;
}) {
  const t = useTranslations();
  const [expanded, setExpanded] = useState(false);
  const startY = useRef<number | null>(null);
  const deltaY = useRef(0);

  const onPointerDown = (e: React.PointerEvent) => {
    startY.current = e.clientY;
    deltaY.current = 0;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (startY.current === null) return;
    deltaY.current = e.clientY - startY.current;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (startY.current === null) return;
    const dy = deltaY.current;
    if (dy < -30) setExpanded(true);
    else if (dy > 30) setExpanded(false);
    startY.current = null;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  return (
    <div
      className={`md:hidden fixed left-0 right-0 bottom-0 z-30 rounded-t-[2rem] bg-[#fdf9f0] transition-transform duration-300 ease-out will-change-transform ${
        expanded ? "translate-y-0" : "translate-y-[calc(100%-72px)]"
      }`}
      style={{ height: "calc(100dvh - 76px)" }}
    >
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={() => setExpanded((v) => !v)}
        className="w-full py-3 flex flex-col items-center gap-2 touch-none select-none cursor-grab active:cursor-grabbing"
      >
        <div className="w-10 h-1.5 rounded-full bg-on-surface/25" />
        <span className="text-xs font-bold uppercase tracking-widest text-on-surface/70">
          {t("Search.resultsNear", { count, city })}
        </span>
      </div>
      <div className="h-[calc(100%-58px)] pb-4">{children}</div>
    </div>
  );
}

export default function SearchClient({
  initial,
  results,
  favoritedIds = [],
}: {
  initial: SearchParams;
  results: Activity[];
  favoritedIds?: string[];
}) {
  const favoritedSet = useMemo(
    () => new Set(favoritedIds),
    [favoritedIds],
  );
  const t = useTranslations();
  const router = useRouter();
  const s = useSearchState(initial);
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const submit = useCallback(() => {
    const query = buildSearchQueryRecord(s.params);
    setSearchOpen(false);
    startTransition(() => {
      router.push({ pathname: "/search", query });
    });
  }, [s.params, router]);

  const applyStyles = useCallback(
    (next: string) => {
      s.setStyles(next);
      const query = buildSearchQueryRecord({ ...s.params, styles: next });
      startTransition(() => {
        router.push({ pathname: "/search", query });
      });
    },
    [router, s],
  );

  // Real venue coordinates only — activities without `coords` (venue
  // missing lat/lng) are dropped from the map but stay in the result list.
  const points = useMemo(
    () =>
      results
        .filter((r): r is typeof r & { coords: { lat: number; lng: number } } =>
          !!r.coords,
        )
        .map((r) => ({
          id: r.id,
          title: r.title,
          price: r.price.split("/")[0],
          lng: r.coords.lng,
          lat: r.coords.lat,
          icon: tablerIconForTitle(r.title),
        })),
    [results]
  );

  // Centre map on the average of returned points so the camera follows
  // the search rather than always anchoring to Warsaw. Falls back to the
  // Warsaw default when there are no plottable results.
  const mapCenter = useMemo<[number, number]>(() => {
    if (points.length === 0) return WARSAW_CENTER;
    const lng = points.reduce((s, p) => s + p.lng, 0) / points.length;
    const lat = points.reduce((s, p) => s + p.lat, 0) / points.length;
    return [lng, lat];
  }, [points]);

  return (
    <>
      <div className="hidden md:block">
        <SiteNavbar />
      </div>

      <MobileTopBar
        onOpenSearch={() => setSearchOpen(true)}
        onOpenFilters={() => setFilterOpen(true)}
        filterCount={s.styles.split(",").filter(Boolean).length}
      />

      <MobileSearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        activities={s.activities}
        neighborhood={s.neighborhood}
        when={s.when}
        ageCounts={s.ageCounts}
        ageLabel={s.ageLabel}
        onActivitiesChange={s.setActivities}
        onNeighborhoodChange={s.setNeighborhood}
        onWhenChange={s.setWhen}
        onAgeUpdate={s.handleAgeUpdate}
        onClearAll={s.clearAll}
        onSubmit={submit}
      />

      <div className="md:hidden fixed inset-x-0 bottom-0 top-[76px] z-10">
        <MapboxMap points={points} center={mapCenter} zoom={11.5} />
      </div>

      <MobileBottomSheet
        count={results.length}
        city={t("Search.defaultCity")}
      >
        <MobileActivityCarousel
          activities={isPending ? [] : results}
          showHeader={false}
          maxItems={results.length}
          fillHeight
          detailed
          fullWidth
          loading={isPending}
          className="w-full h-full"
        />
      </MobileBottomSheet>

      <main className="hidden md:flex pt-16 md:pt-[72px] h-screen flex-col overflow-hidden">
        <div className="max-w-site w-full mx-auto px-4 md:px-6 py-3 shrink-0">
          <PageSearchBar />
        </div>

        <div className="flex-1 min-h-0 max-w-site w-full mx-auto px-4 md:px-6 pb-4 grid grid-cols-[minmax(0,1fr)_1.25fr] grid-rows-[minmax(0,1fr)] gap-6">
          <section className="flex flex-col min-h-0 h-full">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h1 className="font-headline font-bold text-xl text-on-surface">
                {t("Search.resultsNear", {
                  count: results.length,
                  city: t("Search.defaultCity"),
                })}
              </h1>
              <button
                type="button"
                onClick={() => setFilterOpen(true)}
                aria-label={t("Common.filters")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface-container-lowest border border-on-surface/[0.06] hover:bg-primary-fixed/40 transition-colors active:scale-95"
              >
                <Icon name="tune" className="text-[16px] text-primary" />
                <span className="font-semibold text-xs">
                  {t("Common.filters")}
                </span>
                {s.styles && (
                  <span className="ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-primary text-on-primary text-[0.65rem] font-bold">
                    {s.styles.split(",").filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto pr-1 no-scrollbar">
              <div className="grid grid-cols-2 gap-4 pb-2">
                {results.map((r) => (
                  <CompactCard
                    key={r.id}
                    activity={r}
                    favorited={favoritedSet.has(r.id)}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="min-h-0 h-full">
            <MapboxMap points={points} center={mapCenter} zoom={11.5} />
          </section>
        </div>
      </main>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        activities={s.activities}
        styles={s.styles}
        onApply={applyStyles}
      />
    </>
  );
}
