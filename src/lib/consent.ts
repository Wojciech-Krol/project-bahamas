/**
 * Cookie-consent — shared cookie shape constants + universal parser.
 *
 * This file is safe to import from both client and server because it
 * does NOT reach into `next/headers`. The server-side reader (which
 * does) lives in `./consent.server.ts`. Client callers import
 * `readClientConsent` from here.
 *
 * The `hakuna_consent` cookie accepts three shapes:
 *   - `"all"`          → every optional category granted.
 *   - `"essential"`    → only strictly necessary cookies.
 *   - JSON object      → granular per-category (currently just `analytics`).
 */

export const CONSENT_COOKIE_NAME = "hakuna_consent";
/** 6 months. Matches what the banner writes. */
export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 30 * 6;

export type ConsentDetail = {
  analytics: boolean;
};

export type ConsentState = {
  raw: string | null;
  hasChoice: boolean;
  analytics: boolean;
};

export function parseConsentValue(value: string | null): ConsentState {
  if (!value) {
    return { raw: null, hasChoice: false, analytics: false };
  }
  if (value === "all") {
    return { raw: value, hasChoice: true, analytics: true };
  }
  if (value === "essential") {
    return { raw: value, hasChoice: true, analytics: false };
  }
  // Try JSON shape. Be forgiving — a malformed blob falls back to no
  // consent rather than throwing, which would break unrelated rendering.
  try {
    const parsed = JSON.parse(value) as Partial<ConsentDetail>;
    return {
      raw: value,
      hasChoice: true,
      analytics: Boolean(parsed.analytics),
    };
  } catch {
    return { raw: value, hasChoice: false, analytics: false };
  }
}

/**
 * Client-side cookie reader. Callable from hooks and components without
 * dragging `next/headers` into the client bundle.
 */
export function readClientConsent(): ConsentState {
  if (typeof document === "undefined") {
    return { raw: null, hasChoice: false, analytics: false };
  }
  const needle = `${CONSENT_COOKIE_NAME}=`;
  for (const raw of document.cookie.split(";")) {
    const c = raw.trim();
    if (c.startsWith(needle)) {
      return parseConsentValue(decodeURIComponent(c.slice(needle.length)));
    }
  }
  return { raw: null, hasChoice: false, analytics: false };
}
