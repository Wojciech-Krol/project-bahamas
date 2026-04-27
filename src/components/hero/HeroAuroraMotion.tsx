"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import { useEffect, useState } from "react";

type OrbDef = {
  size: string;
  top: string;
  left?: string;
  right?: string;
  color: string;
  parallax: number;
  duration: number;
  delay: number;
  hideOnMobile?: boolean;
  lowPowerHide?: boolean;
};

// Trimmed down: 4 visible orbs on capable devices, 2 on low-power. Dropped
// `mixBlendMode: multiply` from the inner div (was the dominant compositor
// cost on integrated GPUs — caused 30 fps frame rates) and reduced blur
// 80px → 40px (still soft, half the GPU work).
const ORBS: OrbDef[] = [
  {
    size: "32rem",
    top: "-6rem",
    left: "4%",
    color: "var(--color-primary-fixed-dim)",
    parallax: 24,
    duration: 18,
    delay: 0,
  },
  {
    size: "28rem",
    top: "2rem",
    right: "4%",
    color: "var(--color-secondary-fixed)",
    parallax: 32,
    duration: 22,
    delay: -3,
  },
  {
    size: "24rem",
    top: "auto",
    left: "16%",
    color: "var(--color-tertiary-fixed-dim)",
    parallax: 18,
    duration: 26,
    delay: -7,
    lowPowerHide: true,
  },
  {
    size: "30rem",
    top: "auto",
    right: "10%",
    color: "var(--color-primary-fixed)",
    parallax: 28,
    duration: 24,
    delay: -11,
    hideOnMobile: true,
    lowPowerHide: true,
  },
];

function detectLowPower(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  // Heuristic: integrated GPUs / older laptops typically expose < 8 logical
  // cores and < 8 GB device memory. Both APIs are advisory, but cheap.
  const cores = navigator.hardwareConcurrency ?? 8;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  if (cores <= 4) return true;
  if (mem <= 4) return true;
  // Save-Data hint: respect user explicitly asking for reduced bandwidth/cost.
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) return true;
  return false;
}

function Orb({
  orb,
  mx,
  my,
  index,
  staticMode,
}: {
  orb: OrbDef;
  mx: MotionValue<number>;
  my: MotionValue<number>;
  index: number;
  staticMode: boolean;
}) {
  const px = useTransform(mx, [0, 1], [-orb.parallax, orb.parallax]);
  const py = useTransform(my, [0, 1], [-orb.parallax * 0.7, orb.parallax * 0.7]);

  const positionStyle: React.CSSProperties = {
    top: orb.top,
    left: orb.left,
    right: orb.right,
    ...(orb.top === "auto" ? { bottom: index % 2 === 0 ? "-4rem" : "2rem" } : {}),
  };

  // In static mode (low power / reduced motion), skip the parallax + scale +
  // opacity + rotate animation loop entirely. Render a solid radial gradient
  // disc — same visual identity, zero per-frame compositor cost.
  if (staticMode) {
    return (
      <div
        className={`absolute ${orb.hideOnMobile ? "hidden md:block" : ""}`}
        style={positionStyle}
      >
        <div
          style={{
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle at 30% 30%, ${orb.color}, transparent 70%)`,
            borderRadius: "9999px",
            filter: "blur(32px)",
            opacity: 0.55,
          }}
        />
      </div>
    );
  }

  return (
    <motion.div
      className={`absolute ${orb.hideOnMobile ? "hidden md:block" : ""}`}
      style={{ ...positionStyle, x: px, y: py }}
    >
      <motion.div
        style={{
          width: orb.size,
          height: orb.size,
          background: `radial-gradient(circle at 30% 30%, ${orb.color}, transparent 70%)`,
          borderRadius: "9999px",
          filter: "blur(40px)",
          willChange: "transform",
        }}
        animate={{
          scale: [1, 1.12, 0.96, 1.06, 1],
          opacity: [0.5, 0.7, 0.55, 0.65, 0.5],
        }}
        transition={{
          duration: orb.duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: orb.delay,
        }}
      />
    </motion.div>
  );
}

export default function HeroAuroraMotion({
  mx,
  my,
}: {
  mx: MotionValue<number>;
  my: MotionValue<number>;
}) {
  // Default to staticMode = true on first render so SSR (and first paint)
  // never ships the heavy animated layer. We flip to animated mode only
  // after the capability check passes on the client.
  const [staticMode, setStaticMode] = useState(true);

  useEffect(() => {
    if (!detectLowPower()) {
      setStaticMode(false);
    }
  }, []);

  const orbs = staticMode ? ORBS.filter((o) => !o.lowPowerHide) : ORBS;

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none -z-10"
      aria-hidden
      style={{
        maskImage:
          "linear-gradient(to bottom, black 0%, black 55%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, black 0%, black 55%, transparent 100%)",
      }}
    >
      {orbs.map((orb, i) => (
        <Orb
          key={i}
          orb={orb}
          mx={mx}
          my={my}
          index={i}
          staticMode={staticMode}
        />
      ))}
      {!staticMode && (
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.06] mix-blend-overlay pointer-events-none"
          preserveAspectRatio="xMidYMid slice"
        >
          <filter id="hero-juicy-grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="2"
              stitchTiles="stitch"
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#hero-juicy-grain)" />
        </svg>
      )}
    </div>
  );
}
