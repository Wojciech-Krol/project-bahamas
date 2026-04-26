"use client";

import { useEffect, useState } from "react";

const TYPE_MS = 55;
const ERASE_MS = 28;
const HOLD_MS = 1800;
const SWAP_MS = 280;
const START_DELAY_MS = 1200;

export function useTypewriterPlaceholder(
  prompts: string[],
  enabled = true,
): string {
  const initial = prompts[0] ?? "";
  const [text, setText] = useState(initial);
  const stableKey = prompts.join("|");

  useEffect(() => {
    const list = stableKey.length > 0 ? stableKey.split("|") : [];
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const reset = setTimeout(() => {
      if (!cancelled) setText(list[0] ?? "");
    }, 0);

    if (!enabled || list.length === 0) {
      return () => {
        cancelled = true;
        clearTimeout(reset);
      };
    }

    let promptIdx = 0;
    let charIdx = (list[0] ?? "").length;

    const schedule = (fn: () => void, delay: number) => {
      if (cancelled) return;
      timer = setTimeout(fn, delay);
    };

    const hold = () => schedule(erase, HOLD_MS);

    const erase = () => {
      const current = list[promptIdx % list.length] ?? "";
      if (charIdx === 0) {
        promptIdx = (promptIdx + 1) % list.length;
        schedule(type, SWAP_MS);
        return;
      }
      charIdx -= 1;
      setText(current.slice(0, charIdx));
      schedule(erase, ERASE_MS);
    };

    const type = () => {
      const target = list[promptIdx % list.length] ?? "";
      if (charIdx >= target.length) {
        schedule(hold, 0);
        return;
      }
      charIdx += 1;
      setText(target.slice(0, charIdx));
      schedule(type, TYPE_MS);
    };

    schedule(hold, START_DELAY_MS);

    return () => {
      cancelled = true;
      clearTimeout(reset);
      if (timer) clearTimeout(timer);
    };
  }, [enabled, stableKey]);

  return text;
}

/**
 * Sequenced typewriter across multiple fields. Cycles each field in turn:
 * type → hold → erase → advance to next field. Round-robin forever while enabled.
 *
 * Returns the active field index plus the current animated text. Caller decides
 * which field to render the text on (typically when activeIdx === fieldIdx and
 * the field has no user value).
 */
export function useSequencedTypewriter(
  fieldPrompts: string[][],
  enabled = true,
): { activeIdx: number; text: string } {
  const [state, setState] = useState<{ activeIdx: number; text: string }>({
    activeIdx: 0,
    text: "",
  });
  const stableKey = fieldPrompts
    .map((arr) => arr.join("|"))
    .join("§");

  useEffect(() => {
    if (!enabled) return;
    const lists = stableKey
      .split("§")
      .map((g) => (g.length > 0 ? g.split("|") : []));
    if (lists.length === 0 || lists.every((l) => l.length === 0)) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    let activeIdx = 0;
    const counters = new Array(lists.length).fill(0);
    let charIdx = 0;
    let phase: "type" | "hold" | "erase" | "swap" = "type";

    const skipEmpty = () => {
      let guard = 0;
      while (lists[activeIdx].length === 0 && guard < lists.length) {
        activeIdx = (activeIdx + 1) % lists.length;
        guard += 1;
      }
    };

    const currentTarget = () => {
      const list = lists[activeIdx];
      if (list.length === 0) return "";
      return list[counters[activeIdx] % list.length];
    };

    const schedule = (fn: () => void, delay: number) => {
      if (cancelled) return;
      timer = setTimeout(fn, delay);
    };

    const tick = () => {
      const target = currentTarget();
      if (phase === "type") {
        if (charIdx < target.length) {
          charIdx += 1;
          setState({ activeIdx, text: target.slice(0, charIdx) });
          schedule(tick, TYPE_MS);
        } else {
          phase = "hold";
          schedule(tick, HOLD_MS);
        }
      } else if (phase === "hold") {
        phase = "erase";
        schedule(tick, ERASE_MS);
      } else if (phase === "erase") {
        if (charIdx > 0) {
          charIdx -= 1;
          setState({ activeIdx, text: target.slice(0, charIdx) });
          schedule(tick, ERASE_MS);
        } else {
          phase = "swap";
          counters[activeIdx] += 1;
          activeIdx = (activeIdx + 1) % lists.length;
          skipEmpty();
          schedule(tick, SWAP_MS);
        }
      } else if (phase === "swap") {
        phase = "type";
        charIdx = 0;
        setState({ activeIdx, text: "" });
        schedule(tick, 0);
      }
    };

    skipEmpty();
    schedule(() => {
      if (cancelled) return;
      setState({ activeIdx, text: "" });
      tick();
    }, START_DELAY_MS);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [enabled, stableKey]);

  return state;
}
