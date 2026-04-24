/**
 * Client-side analytics tracking helper.
 *
 * Owns the first-party anonymous-id cookie that lets us stitch
 * repeat pageviews together without storing PII. The id is a
 * client-generated uuid — we never receive a real user id or IP
 * here; the server route is what decides which rows to persist
 * and how much of the request metadata to keep (currently: the
 * uuid + optional referrer, nothing else).
 *
 * Intentionally framework-free so server code can reference the
 * cookie name without pulling React. The React hook lives in
 * `app/components/analytics/useTrackView.ts` — that's the split
 * the project uses elsewhere (`src/lib/*` for server + pure TS,
 * React in `app/`).
 */

export const ANON_COOKIE_NAME = "hakuna_anon_id";

const TWO_YEARS_SECONDS = 60 * 60 * 24 * 365 * 2;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  // cookie header is a `; `-separated list of `name=value` pairs.
  // whitespace handling is lenient in real browsers, so trim.
  const needle = `${name}=`;
  for (const raw of document.cookie.split(";")) {
    const cookie = raw.trim();
    if (cookie.startsWith(needle)) {
      return decodeURIComponent(cookie.slice(needle.length));
    }
  }
  return null;
}

function writeCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document === "undefined") return;
  // SameSite=Lax matches the first-party analytics use case —
  // we need the cookie on same-site navigations (the only place
  // this route is called from) but not cross-site iframes.
  document.cookie =
    `${name}=${encodeURIComponent(value)}` +
    `; Max-Age=${maxAgeSeconds}` +
    `; Path=/` +
    `; SameSite=Lax`;
}

function generateUuid(): string {
  // `crypto.randomUUID()` is available on all modern browsers and
  // in node 19+. Fall back to a non-cryptographic sequence only if
  // it's genuinely unavailable (old embedded webview etc.). The id
  // is not a security boundary — collisions only blur analytics,
  // they don't authorise anything.
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // RFC4122-shaped fallback; entropy is weaker but acceptable.
  const rnd = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .slice(1);
  return (
    `${rnd()}${rnd()}-${rnd()}-4${rnd().slice(1)}-` +
    `${((Math.random() * 4) | 8).toString(16)}${rnd().slice(1)}-` +
    `${rnd()}${rnd()}${rnd()}`
  );
}

/**
 * Ensure a first-party anonymous id exists in a cookie. Returns the
 * existing id if present, otherwise generates + persists a new one.
 *
 * Safe to call multiple times per page — the read is synchronous and
 * the write path only fires on first visit.
 */
export function ensureAnonymousId(): string {
  const existing = readCookie(ANON_COOKIE_NAME);
  if (existing && existing.length > 0 && existing.length <= 64) {
    return existing;
  }
  const next = generateUuid();
  writeCookie(ANON_COOKIE_NAME, next, TWO_YEARS_SECONDS);
  return next;
}
