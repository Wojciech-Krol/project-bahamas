import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/src/lib/db/server";
import { safeNextPath } from "@/src/lib/auth/redirects";

/**
 * OAuth callback. Supabase redirects here after the provider (Google, etc.)
 * authenticates the user, with `?code=...`. Exchange the code for a session
 * (which sets auth cookies on the response), then redirect to `next` or `/`.
 *
 * Lives outside the `[locale]` segment so the URL is stable for the Supabase
 * dashboard's "Redirect URLs" allowlist. Locale comes back via the `next`
 * param that we set when initiating the OAuth flow.
 *
 * The `next` parameter is attacker-controllable (anyone can craft a phishing
 * link). Validate via `safeNextPath` so we only redirect to same-origin
 * locale-prefixed paths.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const rawNext = url.searchParams.get("next");
  // Default locale fallback — if `next` is missing or unsafe.
  const next = safeNextPath(rawNext, "pl");

  if (!code) {
    return NextResponse.redirect(new URL(`${next}?error=oauth_no_code`, url.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL(`${next}?error=oauth_exchange`, url.origin));
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
