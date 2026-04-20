"use client";

import { useRef, useState, useEffect, useCallback, useLayoutEffect } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "./Icon";
import ActivityRowCard from "./ActivityRowCard";
import type { Activity } from "../lib/mockData";

export default function ClosestToYouCarousel({
  activities,
}: {
  activities: Activity[];
}) {
  const t = useTranslations("Common");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

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

  const dragRef = useRef({
    active: false,
    pointerId: -1,
    startY: 0,
    lastY: 0,
    lastT: 0,
    velocity: 0,
    startScrollTop: 0,
    moved: false,
  });
  const momentumRef = useRef<number | null>(null);

  const cancelMomentum = useCallback(() => {
    if (momentumRef.current != null) {
      cancelAnimationFrame(momentumRef.current);
      momentumRef.current = null;
    }
  }, []);

  const snapToNearest = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const cards = el.querySelectorAll<HTMLElement>("[data-card]");
    if (!cards.length) return;
    const containerCenter = el.scrollTop + el.clientHeight / 2;
    let bestIdx = 0;
    let bestDist = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(c.offsetTop + c.offsetHeight / 2 - containerCenter);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    });
    const target = cards[bestIdx];
    const top = target.offsetTop - (el.clientHeight - target.offsetHeight) / 2;
    el.scrollTo({ top, behavior: "smooth" });
  }, []);

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
      if (dragRef.current.active) dragRef.current.startScrollTop += copyH;
    } else if (bestIdx >= baseLen * 2.5) {
      el.scrollTop -= copyH;
      if (dragRef.current.active) dragRef.current.startScrollTop -= copyH;
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

  useEffect(() => cancelMomentum, [cancelMomentum]);

  const startMomentum = useCallback(
    (initialV: number) => {
      const el = scrollerRef.current;
      if (!el) return;
      if (Math.abs(initialV) < 0.04) {
        snapToNearest();
        return;
      }
      let v = initialV;
      let last = performance.now();
      const step = (now: number) => {
        const curr = scrollerRef.current;
        if (!curr) return;
        const dt = now - last;
        last = now;
        curr.scrollTop += v * dt;
        v *= Math.pow(0.94, dt / 16.67);
        if (Math.abs(v) < 0.02) {
          momentumRef.current = null;
          snapToNearest();
          return;
        }
        momentumRef.current = requestAnimationFrame(step);
      };
      momentumRef.current = requestAnimationFrame(step);
    },
    [snapToNearest],
  );

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (e.pointerType !== "mouse") return;
    const el = scrollerRef.current;
    if (!el) return;
    cancelMomentum();
    try {
      el.setPointerCapture(e.pointerId);
    } catch {}
    dragRef.current = {
      active: true,
      pointerId: e.pointerId,
      startY: e.clientY,
      lastY: e.clientY,
      lastT: performance.now(),
      velocity: 0,
      startScrollTop: el.scrollTop,
      moved: false,
    };
    setIsDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d.active || e.pointerId !== d.pointerId) return;
    const el = scrollerRef.current;
    if (!el) return;
    const delta = d.startY - e.clientY;
    if (Math.abs(delta) > 4) d.moved = true;
    el.scrollTop = d.startScrollTop + delta;

    const now = performance.now();
    const dt = now - d.lastT;
    if (dt > 0) {
      const instV = (d.lastY - e.clientY) / dt;
      d.velocity = d.velocity * 0.7 + instV * 0.3;
    }
    d.lastY = e.clientY;
    d.lastT = now;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d.active || e.pointerId !== d.pointerId) return;
    d.active = false;
    setIsDragging(false);
    const el = scrollerRef.current;
    if (!el) return;
    try {
      el.releasePointerCapture(d.pointerId);
    } catch {}
    if (d.moved) {
      startMomentum(d.velocity);
    }
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (dragRef.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      dragRef.current.moved = false;
    }
  };

  const onWheel = () => {
    cancelMomentum();
  };

  const scrollByDir = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    cancelMomentum();
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
          aria-label={t("previous")}
          className="w-11 h-11 rounded-full bg-surface-container-lowest border border-on-surface/[0.06] flex items-center justify-center hover:bg-primary-fixed/40 hover:text-primary transition-all shadow-[0_6px_18px_rgba(45,10,23,0.08)]"
        >
          <Icon name="keyboard_arrow_up" className="text-[22px]" />
        </button>
        <button
          type="button"
          onClick={() => scrollByDir(1)}
          aria-label={t("next")}
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
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        onWheel={onWheel}
        className={`flex flex-col gap-5 overflow-y-auto overflow-x-hidden no-scrollbar h-[520px] pl-6 pr-20 pt-[180px] pb-[180px] touch-pan-y select-none ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {rendered.map((a, i) => {
          const isActive = i % baseLen === activeIdx;
          return (
            <div
              key={`${a.id}-${i}`}
              data-card
              className={`shrink-0 transition-all duration-500 ease-[cubic-bezier(.32,.72,0,1)] will-change-transform ${
                isActive
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
