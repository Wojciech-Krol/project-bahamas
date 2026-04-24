"use client";

/**
 * `useTrackView` — fire-and-forget activity pageview beacon.
 *
 * Posts a single `{ activity_id, session_id?, anonymous_id, referrer }`
 * payload to `/api/events/view` once per mount. Designed to be
 * non-blocking:
 *   - uses `navigator.sendBeacon` when available (browser guarantees
 *     delivery even if the user navigates away mid-request);
 *   - falls back to `fetch` with `keepalive` and a swallowed catch
 *     (the caller shouldn't know or care if tracking fails).
 *
 * The anonymous id is owned by `src/lib/analytics/tracking.ts`; this
 * hook only reads/ensures it.
 */

import { useEffect } from "react";

import { ensureAnonymousId } from "@/src/lib/analytics/tracking";

type TrackViewArgs = {
  activityId: string;
  sessionId?: string;
};

export function useTrackView({ activityId, sessionId }: TrackViewArgs): void {
  useEffect(() => {
    // empty id guard — nothing to track.
    if (!activityId) return;

    const anonymousId = ensureAnonymousId();
    const referrer =
      typeof document !== "undefined" && document.referrer
        ? document.referrer.slice(0, 512)
        : undefined;

    const payload: Record<string, unknown> = {
      activity_id: activityId,
      anonymous_id: anonymousId,
    };
    if (sessionId) payload.session_id = sessionId;
    if (referrer) payload.referrer = referrer;

    const body = JSON.stringify(payload);
    const url = "/api/events/view";

    // `sendBeacon` returns false if the browser declined the queue
    // (rare — usually because payload is oversized). Fall through to
    // `fetch` in that case so we still try.
    try {
      if (
        typeof navigator !== "undefined" &&
        typeof navigator.sendBeacon === "function"
      ) {
        const blob = new Blob([body], { type: "application/json" });
        const queued = navigator.sendBeacon(url, blob);
        if (queued) return;
      }
    } catch {
      // fall through to fetch
    }

    // keepalive lets the request complete even if the document is
    // being unloaded, matching the sendBeacon semantics.
    fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      // analytics is strictly best-effort — never surface errors.
    });
  }, [activityId, sessionId]);
}
