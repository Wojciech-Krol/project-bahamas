"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SiteNavbar from "../components/SiteNavbar";
import { Icon } from "../components/Icon";
import PageSearchBar from "../components/search/PageSearchBar";
import MapboxMap from "../components/MapboxMap";
import MobileActivityCarousel from "../components/MobileActivityCarousel";
import { SEARCH_RESULTS, type Activity } from "../lib/mockData";

function CompactCard({ activity }: { activity: Activity }) {
  return (
    <Link
      href={`/activity/${activity.id}`}
      className="group flex flex-col bg-surface-container-lowest rounded-2xl overflow-hidden border border-on-surface/[0.05] editorial-shadow hover:-translate-y-0.5 transition-transform duration-200"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={activity.imageUrl}
          alt={activity.imageAlt}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {activity.tag && (
          <span className="absolute top-2 left-2 bg-primary text-on-primary px-2.5 py-0.5 rounded-full text-[0.6rem] font-bold uppercase tracking-widest">
            {activity.tag}
          </span>
        )}
        <button
          type="button"
          aria-label="Save"
          onClick={(e) => e.preventDefault()}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-surface-container-lowest/90 flex items-center justify-center hover:bg-primary-fixed transition-colors"
        >
          <Icon name="favorite" className="text-[14px] text-primary" />
        </button>
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
              +{activity.joined ?? 0} joined
            </span>
          </div>
          <span className="bg-primary-fixed text-primary px-3 py-1 rounded-full font-semibold text-xs">
            Book
          </span>
        </div>
      </div>
    </Link>
  );
}

// Spread mock results across London with deterministic offsets
const LONDON_CENTER: [number, number] = [-0.1276, 51.5072];

function activityIcon(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("tennis")) return "sports_tennis";
  if (t.includes("yoga") || t.includes("hatha")) return "self_improvement";
  if (t.includes("swim")) return "pool";
  if (t.includes("guitar") || t.includes("music")) return "music_note";
  if (t.includes("boxing")) return "sports_mma";
  if (t.includes("run")) return "directions_run";
  return "location_on";
}

type MobileView = "swipe" | "list" | "map";

export default function SearchPage() {
  const [view, setView] = useState<MobileView>("swipe");
  const results = SEARCH_RESULTS;

  const points = useMemo(
    () =>
      results.map((r, i) => {
        const angle = (i / Math.max(results.length, 1)) * Math.PI * 2;
        const radius = 0.045;
        return {
          id: r.id,
          title: r.title,
          price: r.price.split("/")[0],
          lng: LONDON_CENTER[0] + Math.cos(angle) * radius,
          lat: LONDON_CENTER[1] + Math.sin(angle) * radius * 0.6,
          icon: activityIcon(r.title),
        };
      }),
    [results]
  );

  return (
    <>
      <SiteNavbar />
      <main className="pt-16 md:pt-20 h-screen flex flex-col overflow-hidden">
        <div className="max-w-7xl w-full mx-auto px-4 md:px-6 py-3 shrink-0">
          <PageSearchBar />
        </div>

        {/* Mobile view toggle */}
        <div className="md:hidden max-w-7xl w-full mx-auto px-4 mb-2 shrink-0">
          <div className="flex bg-surface-container-low rounded-full p-1">
            {(
              [
                { v: "swipe" as MobileView, icon: "style", label: "Swipe" },
                { v: "list" as MobileView, icon: "view_list", label: "List" },
                { v: "map" as MobileView, icon: "map", label: "Map" },
              ]
            ).map((opt) => (
              <button
                key={opt.v}
                onClick={() => setView(opt.v)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                  view === opt.v
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface/60 active:bg-on-surface/5"
                }`}
              >
                <Icon name={opt.icon} className="text-[16px]" />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-0 max-w-7xl w-full mx-auto px-4 md:px-6 pb-4 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_1.25fr] grid-rows-[minmax(0,1fr)] gap-4 md:gap-6">
          {/* Results column — Swipe (mobile only) or List */}
          <section
            className={`${view === "list" || view === "swipe" ? "flex" : "hidden"} md:flex flex-col min-h-0 h-full`}
          >
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h1 className="font-headline font-bold text-lg md:text-xl text-on-surface">
                {results.length} results near London
              </h1>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface-container-lowest border border-on-surface/[0.06] hover:bg-primary-fixed/40 transition-colors active:scale-95">
                <Icon name="tune" className="text-[16px] text-primary" />
                <span className="font-semibold text-xs">Filters</span>
              </button>
            </div>

            {/* Mobile swipe (hidden on desktop) */}
            {view === "swipe" && (
              <div className="md:hidden flex-1 min-h-0">
                <MobileActivityCarousel
                  activities={results}
                  showHeader={false}
                  maxItems={results.length}
                  fillHeight
                  className="w-full"
                />
              </div>
            )}

            {/* List grid (always on desktop, shown on mobile when view=list) */}
            <div
              className={`flex-1 min-h-0 overflow-y-auto pr-1 no-scrollbar ${view === "swipe" ? "hidden md:block" : ""
                }`}
            >
              <div className="grid grid-cols-2 gap-3 md:gap-4 pb-2">
                {results.map((r) => (
                  <CompactCard key={r.id} activity={r} />
                ))}
              </div>
            </div>
          </section>

          {/* Map column */}
          <section
            className={`${view === "map" ? "block" : "hidden"} md:block min-h-0 h-full`}
          >
            <MapboxMap points={points} center={LONDON_CENTER} zoom={11.5} />
          </section>
        </div>
      </main>
    </>
  );
}
