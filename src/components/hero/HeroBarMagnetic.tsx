"use client";

import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  type MotionValue,
} from "motion/react";
import { useEffect, useRef } from "react";

const TILT_MAX_DEG = 7;
const TILT_FALLOFF_PX = 540;
const HALO_PERIOD_MS = 7000;

export default function HeroBarMagnetic({
  cursorX,
  cursorY,
  scrollProgress,
  children,
}: {
  cursorX: MotionValue<number>;
  cursorY: MotionValue<number>;
  scrollProgress: MotionValue<number>;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const tiltXSpring = useSpring(tiltX, { stiffness: 120, damping: 22, mass: 0.6 });
  const tiltYSpring = useSpring(tiltY, { stiffness: 120, damping: 22, mass: 0.6 });

  const liftScale = useMotionValue(1);
  const liftScaleSpring = useSpring(liftScale, {
    stiffness: 220,
    damping: 26,
  });

  const angle = useMotionValue(0);
  useEffect(() => {
    const controls = animate(angle, 360, {
      duration: HALO_PERIOD_MS / 1000,
      ease: "linear",
      repeat: Infinity,
    });
    return () => controls.stop();
  }, [angle]);

  const haloBg = useMotionTemplate`conic-gradient(from ${angle}deg, #b40f55 0%, #d6316d 18%, #fdc977 38%, #7d570e 58%, #ae2054 78%, #b40f55 100%)`;

  // Halo glow intensity reacts to scroll progress (contracts + brightens)
  const haloOpacity = useMotionValue(0.55);
  const haloBlur = useMotionValue(12);
  const haloInset = useMotionValue(-3);

  useEffect(() => {
    const unsub = scrollProgress.on("change", (p) => {
      haloOpacity.set(0.55 + p * 0.3);
      haloBlur.set(12 - p * 5);
      haloInset.set(-3 - p * 4);
    });
    return unsub;
  }, [scrollProgress, haloOpacity, haloBlur, haloInset]);

  const haloFilter = useMotionTemplate`blur(${haloBlur}px)`;
  const haloInsetTpl = useMotionTemplate`${haloInset}px`;

  // Cursor → tilt
  useEffect(() => {
    const compute = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = cursorX.get();
      const cy = cursorY.get();
      const barCenterX = rect.left + rect.width / 2;
      const barCenterY = rect.top + rect.height / 2;
      const dx = cx - barCenterX;
      const dy = cy - barCenterY;
      const dist = Math.hypot(dx, dy);
      const intensity = Math.max(0, 1 - dist / TILT_FALLOFF_PX);
      const rx = (-dy / Math.max(rect.height, 1)) * TILT_MAX_DEG * intensity;
      const ry = (dx / Math.max(rect.width, 1)) * TILT_MAX_DEG * intensity;
      tiltX.set(rx);
      tiltY.set(ry);
      // Subtle lift when cursor close
      liftScale.set(1 + intensity * 0.025);
    };

    const unsubX = cursorX.on("change", compute);
    const unsubY = cursorY.on("change", compute);
    return () => {
      unsubX();
      unsubY();
    };
  }, [cursorX, cursorY, tiltX, tiltY, liftScale]);

  return (
    <div className="relative w-full max-w-5xl" style={{ perspective: 1400 }}>
      <motion.div
        aria-hidden
        className="absolute pointer-events-none rounded-full"
        style={{
          inset: haloInsetTpl,
          background: haloBg,
          opacity: haloOpacity,
          filter: haloFilter,
          zIndex: -1,
        }}
      />
      <motion.div
        ref={ref}
        data-hero-search
        style={{
          rotateX: tiltXSpring,
          rotateY: tiltYSpring,
          scale: liftScaleSpring,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
