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
}: {
  activities: Activity[];
  heading?: string;
  showHeader?: boolean;
  maxItems?: number;
  className?: string;
  fillHeight?: boolean;
  detailed?: boolean;
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
    update();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const cardSizeClass = fillHeight
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
        className={`flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4 py-2 scroll-smooth ${fillHeight ? "flex-1 min-h-0" : ""
          }`}
      >
        {items.map((a) => (
          <Link
            key={a.id}
            href={`/activity/${a.id}`}
            data-card
            className={`snap-center shrink-0 ${cardSizeClass} rounded-[2rem] overflow-hidden relative editorial-shadow border border-on-surface/[0.05] bg-surface-container-lowest active:scale-[0.98] transition-transform`}
          >
            <div className="absolute inset-0">
              <img
                src={a.imageUrl}
                alt={a.imageAlt}
                className="w-full h-full object-cover"
                draggable={false}
              />
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
