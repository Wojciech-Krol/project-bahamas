"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "../../src/i18n/navigation";
import { Icon } from "./Icon";
import type { Activity } from "../lib/mockData";

export default function MobileActivityCarousel({
  activities,
  heading,
  showHeader = true,
  maxItems = 8,
  className = "",
  fillHeight = false,
  detailed = false,
  fullWidth = false,
  loading = false,
}: {
  activities: Activity[];
  heading?: string;
  showHeader?: boolean;
  maxItems?: number;
  className?: string;
  fillHeight?: boolean;
  detailed?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
}) {
  const t = useTranslations();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const items = activities.slice(0, maxItems);

  const update = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    const cards = el.querySelectorAll<HTMLElement>("[data-card]");
    let best = 0;
    let bestDist = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - center);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setActiveIdx(best);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    // Defer initial measurement to a microtask via rAF so the setState
    // happens outside the effect body. Scroll/resize fire from external
    // events thereafter, which is the allowed pattern.
    const raf = requestAnimationFrame(update);
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const cardSizeClass = fullWidth
    ? "w-full max-w-none h-full"
    : fillHeight
    ? "w-[85vw] max-w-[380px] h-full"
    : "w-[85vw] max-w-[380px] h-[70vh] max-h-[620px] min-h-[520px]";
  const rootSizeClass = fillHeight ? "h-full flex flex-col" : "";

  return (
    <div className={`relative ${rootSizeClass} ${className}`}>
      {showHeader && (
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-lg font-headline font-bold text-on-surface">
            {heading ?? t("Home.closest.carouselHeading")}
          </h2>
          <Link
            href="/search"
            className="text-xs font-bold uppercase tracking-widest text-primary"
          >
            {t("Common.viewAll")} →
          </Link>
        </div>
      )}

      <div
        ref={scrollerRef}
        className={`flex overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth ${
          fullWidth ? "gap-0 w-full" : "gap-4 -mx-4 px-4 py-2"
        } ${fillHeight ? "flex-1 min-h-0" : ""} ${
          loading ? "opacity-60 pointer-events-none transition-opacity" : "transition-opacity"
        }`}
      >
        {loading && items.length === 0
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className={`snap-center shrink-0 ${cardSizeClass} rounded-[2rem] overflow-hidden relative editorial-shadow border border-on-surface/[0.05] bg-surface-container-low animate-pulse`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-on-surface/15 via-on-surface/5 to-transparent" />
                <div className="absolute top-5 left-5 right-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="h-6 w-20 rounded-full bg-on-surface/15" />
                    <div className="h-6 w-12 rounded-full bg-on-surface/15" />
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col gap-3">
                  <div className="h-8 w-3/4 rounded bg-on-surface/15" />
                  <div className="h-3 w-1/2 rounded bg-on-surface/12" />
                  <div className="flex items-center gap-3 pt-3 mt-1 border-t border-on-surface/10">
                    <div className="w-10 h-10 rounded-full bg-on-surface/15" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2 w-1/4 rounded bg-on-surface/12" />
                      <div className="h-3 w-1/2 rounded bg-on-surface/15" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          : items.map((a) => (
          <Link
            key={a.id}
            href={`/activity/${a.id}`}
            data-card
            className={`snap-center shrink-0 ${cardSizeClass} rounded-[2rem] overflow-hidden relative editorial-shadow border border-on-surface/[0.05] bg-surface-container-lowest active:scale-[0.98] transition-transform`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed to-secondary-fixed">
              {a.imageUrl && (
                <img
                  src={a.imageUrl}
                  alt={a.imageAlt}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c17]/95 via-[#1c1c17]/40 to-transparent" />
            </div>

            {/* Top meta */}
            <div className="absolute top-5 left-5 right-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 bg-primary text-on-primary px-3 py-1.5 rounded-full text-[0.65rem] font-bold uppercase tracking-widest shadow-[0_6px_18px_rgba(180,15,85,0.4)]">
                  <Icon name="bolt" className="text-[14px]" />
                  {a.time}
                </span>
                <div className="flex flex-col items-end gap-1.5">
                  {a.rating !== undefined && (
                    <span className="inline-flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[0.7rem] font-bold">
                      <Icon name="star" className="text-[14px] text-secondary" />
                      {a.rating.toFixed(1)}
                      {a.reviewCount !== undefined && (
                        <span className="text-white/60 font-medium">({a.reviewCount})</span>
                      )}
                    </span>
                  )}
                  {a.tag && (
                    <span className="bg-white/95 text-on-surface px-3 py-1.5 rounded-full text-[0.6rem] font-bold uppercase tracking-widest">
                      {a.tag}
                    </span>
                  )}
                </div>
              </div>

              {!detailed && (
                <div className="flex items-center gap-2 text-white text-xs flex-wrap drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]">
                  <Icon name="location_on" className="text-[16px]" />
                  <span className="font-semibold">{a.location}</span>
                  {a.duration && (
                    <>
                      <span className="opacity-50">·</span>
                      <Icon name="schedule" className="text-[16px]" />
                      <span className="font-semibold">{a.duration}</span>
                    </>
                  )}
                  {a.level && (
                    <>
                      <span className="opacity-50">·</span>
                      <Icon name="signal_cellular_alt" className="text-[16px]" />
                      <span className="font-semibold">{a.level}</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Bottom content */}
            <div className="absolute inset-x-0 bottom-0 p-6 text-white flex flex-col gap-3">
              {detailed && (
                <div className="flex items-center gap-2 text-white/85 text-xs flex-wrap">
                  <Icon name="location_on" className="text-[16px]" />
                  <span className="font-semibold">{a.location}</span>
                  {a.duration && (
                    <>
                      <span className="opacity-50">·</span>
                      <Icon name="schedule" className="text-[16px]" />
                      <span className="font-semibold">{a.duration}</span>
                    </>
                  )}
                  {a.level && (
                    <>
                      <span className="opacity-50">·</span>
                      <Icon name="signal_cellular_alt" className="text-[16px]" />
                      <span className="font-semibold">{a.level}</span>
                    </>
                  )}
                </div>
              )}

              <h3 className="font-headline font-extrabold text-3xl leading-[1.1] tracking-tight">
                {a.title}
              </h3>

              {!detailed && a.description && (
                <p className="text-sm text-white/80 leading-relaxed line-clamp-3">
                  {a.description}
                </p>
              )}

              {!detailed && (a.joined !== undefined || a.instructorName) && (
                <div className="flex items-center gap-4 text-[0.7rem] font-bold uppercase tracking-widest text-white/70">
                  {a.instructorName && (
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="person" className="text-[14px]" />
                      {a.instructorName}
                    </span>
                  )}
                  {a.joined !== undefined && (
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="group" className="text-[14px]" />
                      {t("Common.joinedCount", { count: a.joined })}
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 pt-3 mt-1 border-t border-white/15">
                {a.schoolAvatar && (
                  <img
                    src={a.schoolAvatar}
                    alt={a.schoolName ?? ""}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white/30"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-[0.65rem] font-bold uppercase tracking-widest text-white/60">
                    {t("Card.at")}
                  </div>
                  <div className="font-bold text-sm truncate">
                    {a.schoolName ??
                      a.instructorName ??
                      t("Common.joinedCount", { count: a.joined ?? 0 })}
                  </div>
                </div>
                <div className="bg-white text-primary w-10 h-10 rounded-full flex items-center justify-center shadow-[0_6px_18px_rgba(0,0,0,0.25)] shrink-0">
                  <Icon name="arrow_forward" className="text-[18px]" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Swipe hint (fades out after first scroll) */}
      {activeIdx === 0 && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 text-on-surface rounded-full px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-widest flex items-center gap-1 shadow-[0_4px_12px_rgba(0,0,0,0.15)] pointer-events-none animate-pulse">
          {t("Card.swipe")}
          <Icon name="arrow_forward" className="text-[14px]" />
        </div>
      )}
    </div>
  );
}
