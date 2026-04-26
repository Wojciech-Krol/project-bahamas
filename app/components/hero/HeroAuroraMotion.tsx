"use client";

import { motion, useTransform, type MotionValue } from "motion/react";

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
};

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
  },
  {
    size: "20rem",
    top: "38%",
    left: "44%",
    color: "var(--color-secondary-fixed-dim)",
    parallax: 14,
    duration: 28,
    delay: -5,
    hideOnMobile: true,
  },
  {
    size: "16rem",
    top: "55%",
    left: "8%",
    color: "var(--color-primary-container)",
    parallax: 10,
    duration: 30,
    delay: -2,
    hideOnMobile: true,
  },
];

function Orb({
  orb,
  mx,
  my,
  index,
}: {
  orb: OrbDef;
  mx: MotionValue<number>;
  my: MotionValue<number>;
  index: number;
}) {
  const px = useTransform(mx, [0, 1], [-orb.parallax, orb.parallax]);
  const py = useTransform(my, [0, 1], [-orb.parallax * 0.7, orb.parallax * 0.7]);

  const positionStyle: React.CSSProperties = {
    top: orb.top,
    left: orb.left,
    right: orb.right,
    ...(orb.top === "auto" ? { bottom: index % 2 === 0 ? "-4rem" : "2rem" } : {}),
  };

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
          filter: "blur(80px)",
          mixBlendMode: "multiply",
          willChange: "transform, opacity",
        }}
        animate={{
          scale: [1, 1.15, 0.94, 1.08, 1],
          opacity: [0.45, 0.7, 0.5, 0.65, 0.45],
          rotate: [0, 6, -4, 3, 0],
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
      {ORBS.map((orb, i) => (
        <Orb key={i} orb={orb} mx={mx} my={my} index={i} />
      ))}
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
    </div>
  );
}
