"use client";

import { useEffect, useState } from "react";

const TYPE_MS = 55;
const ERASE_MS = 28;
const HOLD_MS = 2400;
const SWAP_MS = 360;
const START_DELAY_MS = 1200;

export function useTypewriterPlaceholder(
  prompts: string[],
  enabled = true,
): string {
  const initial = prompts[0] ?? "";
  const [text, setText] = useState(initial);
  const stableKey = prompts.join(" ");

  useEffect(() => {
    const list = stableKey.length > 0 ? stableKey.split(" ") : [];
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
