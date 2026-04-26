"use client";

import { useEffect, useRef } from "react";

const SPACING = 32;
const BASE_RADIUS = 1.1;
const MAX_SIZE = 9;
const MAX_CORNER = 2.5;
const FALLOFF = 150;
const BASE_ALPHA = 0.07;
const ACTIVE_ALPHA = 0.32;
const BRAND_RGB = "180, 15, 85";
const BAR_ZONE_RADIUS = 360;
const BAR_ZONE_FADE = 120;

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

function roundedSquare(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  radius: number,
) {
  const half = size / 2;
  const x = cx - half;
  const y = cy - half;
  const r = Math.min(radius, half);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + size - r, y);
  ctx.quadraticCurveTo(x + size, y, x + size, y + r);
  ctx.lineTo(x + size, y + size - r);
  ctx.quadraticCurveTo(x + size, y + size, x + size - r, y + size);
  ctx.lineTo(x + r, y + size);
  ctx.quadraticCurveTo(x, y + size, x, y + size - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

export default function ProximityDots() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let cssWidth = 0;
    let cssHeight = 0;
    let dpr = 1;
    let cursorX = -9999;
    let cursorY = -9999;
    let visible = false;
    let dirty = true;

    const resize = () => {
      cssWidth = window.innerWidth;
      cssHeight = window.innerHeight;
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(cssWidth * dpr));
      canvas.height = Math.max(1, Math.floor(cssHeight * dpr));
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dirty = true;
    };

    resize();

    const draw = () => {
      ctx.clearRect(0, 0, cssWidth, cssHeight);

      const offsetX = (cssWidth % SPACING) / 2;
      const offsetY = (cssHeight % SPACING) / 2;
      const cols = Math.floor((cssWidth - offsetX) / SPACING) + 1;
      const rows = Math.floor((cssHeight - offsetY) / SPACING) + 1;

      let zone = 0;
      if (visible) {
        const anchor =
          document.querySelector<HTMLElement>("[data-hero-headline]") ??
          document.querySelector<HTMLElement>("[data-hero-search]");
        if (anchor) {
          const rect = anchor.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            const barCx = rect.left + rect.width / 2;
            const barCy = rect.top + rect.height / 2;
            const dx = cursorX - barCx;
            const dy = cursorY - barCy;
            const dist = Math.hypot(dx, dy);
            if (dist <= BAR_ZONE_RADIUS) zone = 1;
            else if (dist < BAR_ZONE_RADIUS + BAR_ZONE_FADE) {
              zone = smoothstep(
                1 - (dist - BAR_ZONE_RADIUS) / BAR_ZONE_FADE,
              );
            }
          }
        }
      }

      const hasActive = zone > 0.01;
      const minCol = hasActive
        ? Math.max(0, Math.floor((cursorX - FALLOFF - offsetX) / SPACING))
        : cols;
      const maxCol = hasActive
        ? Math.min(cols, Math.ceil((cursorX + FALLOFF - offsetX) / SPACING))
        : -1;
      const minRow = hasActive
        ? Math.max(0, Math.floor((cursorY - FALLOFF - offsetY) / SPACING))
        : rows;
      const maxRow = hasActive
        ? Math.min(rows, Math.ceil((cursorY + FALLOFF - offsetY) / SPACING))
        : -1;

      ctx.fillStyle = `rgba(${BRAND_RGB}, ${BASE_ALPHA})`;
      ctx.beginPath();
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (r >= minRow && r <= maxRow && c >= minCol && c <= maxCol) continue;
          const x = offsetX + c * SPACING;
          const y = offsetY + r * SPACING;
          ctx.moveTo(x + BASE_RADIUS, y);
          ctx.arc(x, y, BASE_RADIUS, 0, Math.PI * 2);
        }
      }
      ctx.fill();

      if (!hasActive) return;

      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          const x = offsetX + c * SPACING;
          const y = offsetY + r * SPACING;
          const dx = x - cursorX;
          const dy = y - cursorY;
          const dist = Math.hypot(dx, dy);
          if (dist > FALLOFF) {
            ctx.fillStyle = `rgba(${BRAND_RGB}, ${BASE_ALPHA})`;
            ctx.beginPath();
            ctx.arc(x, y, BASE_RADIUS, 0, Math.PI * 2);
            ctx.fill();
            continue;
          }
          const tRaw = smoothstep(1 - dist / FALLOFF);
          const t = tRaw * zone;
          const size = Math.max(BASE_RADIUS * 2, MAX_SIZE * t);
          const corner = Math.max(0.5, MAX_CORNER * t);
          const alpha = BASE_ALPHA + (ACTIVE_ALPHA - BASE_ALPHA) * t;
          ctx.fillStyle = `rgba(${BRAND_RGB}, ${alpha})`;
          if (t < 0.04) {
            ctx.beginPath();
            ctx.arc(x, y, BASE_RADIUS, 0, Math.PI * 2);
            ctx.fill();
          } else {
            roundedSquare(ctx, x, y, size, corner);
          }
        }
      }
    };

    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!dirty) return;
      dirty = false;
      draw();
    };

    const onMove = (e: PointerEvent) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      visible = true;
      dirty = true;
    };

    const onLeave = () => {
      visible = false;
      dirty = true;
    };

    const onScroll = () => {
      dirty = true;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="fixed inset-0 pointer-events-none z-0 hidden md:block"
    />
  );
}
