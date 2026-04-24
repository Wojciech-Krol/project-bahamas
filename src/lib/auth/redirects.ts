/**
 * Safe-redirect helpers for auth flows.
 *
 * The `next` parameter on OAuth callbacks and email-confirmation links is
 * attacker-controllable (the user clicks a link in an email or is sent a
 * crafted URL). Treat it as untrusted input. Only same-origin, locale-prefixed
 * paths are allowed.
 *
 * Without this guard, `…/api/auth/callback?next=https://evil.com/foo` would
 * happily hand the just-authenticated session to an external host.
 */
export function safeNextPath(
  raw: string | null | undefined,
  locale: string,
): string {
  const fallback = `/${locale}`;
  if (!raw) return fallback;
  // Reject anything that could escape the origin: protocol-relative `//host`,
  // backslash tricks `\evil.com`, plain absolute URLs, and missing leading `/`.
  if (
    raw.length === 0 ||
    !raw.startsWith("/") ||
    raw.startsWith("//") ||
    raw.startsWith("/\\") ||
    raw.startsWith("\\")
  ) {
    return fallback;
  }
  // Last-mile defence: the `URL` constructor parses `next` against an arbitrary
  // base; if it ends up on a different origin, reject. Catches sneaky inputs
  // that pass the prefix checks but exploit URL parsing quirks.
  try {
    const url = new URL(raw, "http://localhost");
    if (url.origin !== "http://localhost") return fallback;
  } catch {
    return fallback;
  }
  return raw;
}
