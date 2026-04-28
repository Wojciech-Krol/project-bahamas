/**
 * Server-side consent readers.
 *
 * Separated from `./consent.ts` so client components can import the
 * shared constants + client cookie reader without pulling in
 * `next/headers` (which Turbopack refuses to bundle into client code).
 */

import "server-only";
import { cookies } from "next/headers";

import {
  CONSENT_COOKIE_NAME,
  parseConsentValue,
  type ConsentState,
} from "./consent";

/**
 * Server-side consent read. Returns `{ analytics: false, hasChoice: false }`
 * when the cookie hasn't been written yet — callers should treat that as
 * "no consent granted" and avoid firing any optional telemetry.
 */
export async function readConsent(): Promise<ConsentState> {
  const jar = await cookies();
  const cookie = jar.get(CONSENT_COOKIE_NAME);
  return parseConsentValue(cookie?.value ?? null);
}

/** Convenience wrapper for the most common check. */
export async function hasAnalyticsConsent(): Promise<boolean> {
  const state = await readConsent();
  return state.analytics;
}
