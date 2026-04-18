"use client";

import { useRef, useState, useEffect, useCallback, useLayoutEffect } from "react";
import { Icon } from "./Icon";
import ActivityRowCard from "./ActivityRowCard";
import type { Activity } from "../lib/mockData";

export default function ClosestToYouCarousel({
  activities,
}: {
  activities: Activity[];
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const items = activities.slice(0, 10);
  const baseLen = items.length;
  const rendered = [...items, ...items, ...items];

  const getCopyHeight = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return 0;
    const cards = el.querySelectorAll<HTMLElement>("[data-card]");
    if (cards.length < baseLen * 2) return 0;
    return cards[baseLen].offsetTop - cards[0].offsetTop;
  }, [baseLen]);

  const update = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const containerCenter = el.scrollTop + el.clientHeight / 2;
    const cards = el.querySelectorAll<HTMLElement>("[data-card]");
    let bestIdx = 0;
    let bestDist = Infinity;
    cards.forEach((c, i) => {
      const cardCenter = c.offsetTop + c.offsetHeight / 2;
      const d = Math.abs(cardCenter - containerCenter);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    });

    setActiveIdx(bestIdx % baseLen);

    const copyH = getCopyHeight();
    if (!copyH) return;
    if (bestIdx < baseLen * 0.5) {
      el.scrollTop += copyH;
    } else if (bestIdx >= baseLen * 2.5) {
      el.scrollTop -= copyH;
    }
  }, [baseLen, getCopyHeight]);

  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const cards = el.querySelectorAll<HTMLElement>("[data-card]");
    const middle = cards[baseLen];
    if (middle) {
      el.scrollTop =
        middle.offsetTop - (el.clientHeight - middle.offsetHeight) / 2;
    }
  }, [baseLen]);

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

  const scrollByDir = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const cards = el.querySelectorAll<HTMLElement>("[data-card]");
    if (!cards.length) return;
    const containerCenter = el.scrollTop + el.clientHeight / 2;
    let currIdx = 0;
    let bestDist = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(c.offsetTop + c.offsetHeight / 2 - containerCenter);
      if (d < bestDist) {
        bestDist = d;
        currIdx = i;
      }
    });
    const nextIdx = Math.max(0, Math.min(cards.length - 1, currIdx + dir));
    const target = cards[nextIdx];
    const top = target.offsetTop - (el.clientHeight - target.offsetHeight) / 2;
    el.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* Floating nav rail */}
      <div className="hidden md:flex flex-col gap-2 absolute -left-14 top-1/2 -translate-y-1/2 z-20">
        <button
          type="button"
          onClick={() => scrollByDir(-1)}
          aria-label="Previous"
          className="w-11 h-11 rounded-full bg-surface-container-lowest border border-on-surface/[0.06] flex items-center justify-center hover:bg-primary-fixed/40 hover:text-primary transition-all shadow-[0_6px_18px_rgba(45,10,23,0.08)]"
        >
          <Icon name="keyboard_arrow_up" className="text-[22px]" />
        </button>
        <button
          type="button"
          onClick={() => scrollByDir(1)}
          aria-label="Next"
          className="w-11 h-11 rounded-full bg-surface-container-lowest border border-on-surface/[0.06] flex items-center justify-center hover:bg-primary-fixed/40 hover:text-primary transition-all shadow-[0_6px_18px_rgba(45,10,23,0.08)]"
        >
          <Icon name="keyboard_arrow_down" className="text-[22px]" />
        </button>
      </div>

      {/* Gradient masks */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 z-10 bg-gradient-to-b from-[#fdf9f0] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 z-10 bg-gradient-to-t from-[#fdf9f0] to-transparent" />

      <div
        ref={scrollerRef}
        className="flex flex-col gap-5 overflow-y-auto overflow-x-hidden no-scrollbar snap-y snap-proximity h-[520px] pl-6 pr-20 pt-[180px] pb-[180px]"
      >
        {rendered.map((a, i) => {
          const isActive = i % baseLen === activeIdx;
          return (
            <div
              key={`${a.id}-${i}`}
              data-card
              className={`snap-center shrink-0 transition-all duration-500 ease-[cubic-bezier(.32,.72,0,1)] will-change-transform ${isActive
                  ? "translate-x-6 md:translate-x-10 scale-[1.02] opacity-100"
                  : "translate-x-0 scale-[0.96] opacity-60"
                }`}
            >
              <ActivityRowCard activity={a} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
