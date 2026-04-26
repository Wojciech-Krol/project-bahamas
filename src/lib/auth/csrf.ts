/**
 * Cross-site request forgery guard for raw POST Route Handlers.
 *
 * Server Actions ship with built-in Origin checking in Next 15+, but plain
 * Route Handlers do not. The handlers we expose for POST (account export,
 * logout) need their own check so an attacker site can't force a victim's
 * browser to trigger them via cross-origin form submission.
 *
 * This is a lightweight Origin/Sec-Fetch-Site check rather than a token —
 * adequate for forms whose effects are limited to the signed-in user
 * (download own data, end own session). Anything that mutates other-user
 * state via POST should additionally use a CSRF token.
 *
 * Returns `null` when the request is same-origin. Returns a 403
 * `NextResponse` when it isn't.
 */

import { NextResponse } from "next/server";

/**
 * Check whether the request originated from the same site as the server.
 *
 *   * `Sec-Fetch-Site: same-origin` is the most reliable signal — set by
 *     Chromium / Firefox / Safari for fetches and form submissions. When
 *     present and equal to `same-origin` (or `none` for top-level navs),
 *     the request is trusted.
 *   * `same-site` is intentionally REJECTED. It covers sibling subdomains
 *     under the same eTLD+1 — anything on `*.hakuna.app` would qualify.
 *     If the platform ever serves a partner-branded subdomain or shares
 *     a `vercel.app` suffix with untrusted projects, accepting `same-site`
 *     is a CSRF wedge for the POST routes this guard protects (logout,
 *     account export). See AUDIT_FINDINGS.md entry #5.
 *   * Fallback: parse the `Origin` header and compare to the request's
 *     own host (via `x-forwarded-host` or `host`).
 */
export function isSameOriginRequest(request: Request): boolean {
  const sff = request.headers.get("sec-fetch-site");
  if (sff === "same-origin" || sff === "none") {
    return true;
  }
  if (sff) {
    // sec-fetch-site present but not same-origin/none (incl. same-site).
    // Reject.
    return false;
  }
  // Old browsers without sec-fetch-site: fall back to Origin matching.
  const origin = request.headers.get("origin");
  if (!origin) {
    // No Origin header on a same-origin POST is unusual but legitimate
    // for some edge cases (e.g. server-to-server). Be conservative and
    // reject, so attackers can't strip the header to bypass.
    return false;
  }
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return false;
  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}

/**
 * Convenience wrapper: returns a 403 NextResponse when the request is
 * cross-origin, otherwise null. Use at the top of a POST Route Handler.
 *
 *   const csrf = guardCsrf(request);
 *   if (csrf) return csrf;
 */
export function guardCsrf(request: Request): NextResponse | null {
  if (isSameOriginRequest(request)) return null;
  return new NextResponse("Forbidden", { status: 403 });
}
