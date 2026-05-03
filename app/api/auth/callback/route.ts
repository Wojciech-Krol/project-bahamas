import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/src/lib/db/server";
import { safeNextPath } from "@/src/lib/auth/redirects";
import { routing } from "@/src/i18n/routing";

/**
 * OAuth callback. Supabase redirects here after the provider (Google, etc.)
 * authenticates the user, with `?code=...`. Exchange the code for a session
 * (which sets auth cookies on the response), then redirect to `next` or `/`.
 *
 * Lives outside the `[locale]` segment so the URL is stable for the Supabase
 * dashboard's "Redirect URLs" allowlist.
 *
 * Locale resolution order (most specific → least):
 *   1. The first segment of the validated `next` path (e.g. `/en/account`).
 *   2. The user's profile.locale read from Supabase after the code exchange.
 *   3. The Supabase user metadata `locale` (set at signup before the
 *      profile trigger had a chance to fire).
 *   4. routing.defaultLocale ("pl").
 *
 * The `next` parameter is attacker-controllable (anyone can craft a phishing
 * link). Validate via `safeNextPath` so we only redirect to same-origin
 * locale-prefixed paths.
 */

function pickLocaleFromPath(path: string | null | undefined): string | null {
  if (!path || !path.startsWith("/")) return null;
  const seg = path.split("/")[1] ?? "";
  return (routing.locales as readonly string[]).includes(seg) ? seg : null;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const rawNext = url.searchParams.get("next");

  // Path-derived locale takes precedence. If the path doesn't tell us,
  // we'll resolve from profile/user metadata after the exchange.
  const pathLocale = pickLocaleFromPath(rawNext);

  if (!code) {
    const fallbackLocale = pathLocale ?? routing.defaultLocale;
    const next = safeNextPath(rawNext, fallbackLocale);
    return NextResponse.redirect(
      new URL(`${next}?error=oauth_no_code`, url.origin),
    );
  }

  const supabase = await createClient();
  const { data: exchange, error } = await supabase.auth.exchangeCodeForSession(
    code,
  );
  if (error) {
    const fallbackLocale = pathLocale ?? routing.defaultLocale;
    const next = safeNextPath(rawNext, fallbackLocale);
    return NextResponse.redirect(
      new URL(`${next}?error=oauth_exchange`, url.origin),
    );
  }

  // Resolve user locale for the fallback once we have a session.
  let userLocale: string | null = null;
  const userId = exchange.user?.id;
  const userMetaLocale =
    (exchange.user?.user_metadata as { locale?: string } | undefined)?.locale ?? null;
  if (userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("locale")
      .eq("id", userId)
      .maybeSingle();
    const candidate = (profile as { locale?: string } | null)?.locale ?? null;
    if (candidate && (routing.locales as readonly string[]).includes(candidate)) {
      userLocale = candidate;
    }
  }
  if (
    !userLocale &&
    userMetaLocale &&
    (routing.locales as readonly string[]).includes(userMetaLocale)
  ) {
    userLocale = userMetaLocale;
  }

  const fallbackLocale =
    pathLocale ?? userLocale ?? routing.defaultLocale;
  const next = safeNextPath(rawNext, fallbackLocale);

  return NextResponse.redirect(new URL(next, url.origin));
}
