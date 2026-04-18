"use client";

import { useRef, useState, useEffect } from "react";
import { Icon } from "./Icon";
import ActivityRowCard from "./ActivityRowCard";
import type { Activity } from "../lib/mockData";

export default function ClosestToYouCarousel({
  activities,
}: {
  activities: Activity[];
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const items = activities.slice(0, 10);

  const updateButtons = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateButtons();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);
    return () => {
      el.removeEventListener("scroll", updateButtons);
      window.removeEventListener("resize", updateButtons);
    };
  }, []);

  const scrollByCard = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const firstCard = el.querySelector<HTMLElement>("[data-card]");
    const delta = firstCard ? firstCard.offsetWidth + 24 : el.clientWidth * 0.9;
    el.scrollBy({ left: delta * dir, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <span className="inline-block bg-secondary-container px-4 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-widest text-on-secondary-container">
            Starting Soon
          </span>
        </div>
        <div className="hidden md:flex gap-2">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            disabled={!canPrev}
            aria-label="Previous"
            className="w-11 h-11 rounded-full bg-surface-container-lowest border border-on-surface/[0.06] flex items-center justify-center hover:bg-primary-fixed/40 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <Icon name="arrow_back" className="text-[20px]" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            disabled={!canNext}
            aria-label="Next"
            className="w-11 h-11 rounded-full bg-surface-container-lowest border border-on-surface/[0.06] flex items-center justify-center hover:bg-primary-fixed/40 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <Icon name="arrow_forward" className="text-[20px]" />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 -mx-4 px-4 md:-mx-2 md:px-2"
      >
        {items.map((a) => (
          <div
            key={a.id}
            data-card
            className="snap-start shrink-0 w-[85%] sm:w-[60%] md:w-[calc((100%-3rem)/3)]"
          >
            <ActivityRowCard activity={a} />
          </div>
        ))}
      </div>
    </div>
  );
}
