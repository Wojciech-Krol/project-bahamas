"use client";

import { animate, motion, useMotionValue } from "motion/react";
import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import HeroAuroraMotion from "./HeroAuroraMotion";
import HeroHeadlineMotion from "./HeroHeadlineMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HeroJuicyStage({
  titleStart,
  titleMiddle,
  titleEnd,
  subtitle,
  desktopSearch,
  mobileSearch,
}: {
  titleStart: string;
  titleMiddle: string;
  titleEnd: string;
  subtitle: string;
  desktopSearch: React.ReactNode;
  mobileSearch: React.ReactNode;
}) {
  const stageRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const mxNorm = useMotionValue(0.5);
  const myNorm = useMotionValue(0.5);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf: number | null = null;
    let last = { x: 0, y: 0, has: false };

    const apply = () => {
      raf = null;
      if (!last.has) return;
      const rect = el.getBoundingClientRect();
      mxNorm.set(
        Math.max(0, Math.min(1, (last.x - rect.left) / Math.max(rect.width, 1))),
      );
      myNorm.set(
        Math.max(
          0,
          Math.min(1, (last.y - rect.top) / Math.max(rect.height, 1)),
        ),
      );
    };

    const onMove = (e: PointerEvent) => {
      last = { x: e.clientX, y: e.clientY, has: true };
      if (raf == null) raf = requestAnimationFrame(apply);
    };

    const onLeave = () => {
      animate(mxNorm, 0.5, { duration: 0.6, ease: "easeOut" });
      animate(myNorm, 0.5, { duration: 0.6, ease: "easeOut" });
      last.has = false;
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [mxNorm, myNorm]);

  useGSAP(
    () => {
      const el = stageRef.current;
      if (!el) return;

      if (
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }

      if (overlayRef.current) {
        gsap.fromTo(
          overlayRef.current,
          { opacity: 0 },
          {
            opacity: 0.35,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top top",
              end: "bottom top",
              scrub: 0.5,
            },
          },
        );
      }
    },
    { scope: stageRef as React.RefObject<HTMLElement> },
  );

  return (
    <section
      ref={stageRef}
      className="hero-juicy relative overflow-x-clip px-4 md:px-6 pt-10 pb-6 md:pt-32 md:pb-16"
    >
      <HeroAuroraMotion mx={mxNorm} my={myNorm} />

      <div
        ref={overlayRef}
        aria-hidden
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 70% 100%, var(--color-secondary-fixed) 0%, transparent 70%)",
          opacity: 0,
          mixBlendMode: "multiply",
        }}
      />

      <div className="max-w-site mx-auto text-center flex flex-col items-center relative z-10">
        <HeroHeadlineMotion
          start={titleStart}
          middle={titleMiddle}
          end={titleEnd}
        />

        <div className="md:hidden w-full mb-6">{mobileSearch}</div>

        <div className="hidden md:contents">
          <div data-hero-search className="w-full max-w-5xl flex justify-center">
            {desktopSearch}
          </div>

          <motion.p
            className="text-on-surface/60 font-medium text-lg md:text-xl max-w-2xl mt-6"
            initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.7, duration: 0.7, ease: "easeOut" }}
          >
            {subtitle}
          </motion.p>
        </div>
      </div>
    </section>
  );
}

