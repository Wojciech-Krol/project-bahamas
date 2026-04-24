import createIntlMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";

import { routing } from "./src/i18n/routing";
import { env } from "./src/env";

/**
 * Next 16 proxy (formerly `middleware.ts`).
 *
 * Composes two responsibilities on every matched request:
 *   1. next-intl locale routing — handles `/` → `/{defaultLocale}`,
 *      locale negotiation, and rewrites for `localePrefix: "always"`.
 *   2. Supabase auth session refresh — required by `@supabase/ssr` so that
 *      auth cookies stay valid across RSC renders. The cookies have to land
 *      on the response that next-intl produces, otherwise the locale
 *      redirect would drop them.
 *
 * Order: intl first (it owns the response), then Supabase reads request
 * cookies and writes refreshed cookies onto the same response.
 *
 * If Supabase isn't configured yet (pre-launch / fresh clone without
 * `NEXT_PUBLIC_SUPABASE_*` set), the auth refresh is a no-op so the
 * marketing site still serves.
 */

const intl = createIntlMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const response = intl(request) as NextResponse;

  if (
    !env.NEXT_PUBLIC_SUPABASE_URL ||
    !env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return response;
  }

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Revalidates the JWT against the Supabase auth server and triggers
  // `setAll` if the access token rotates. Discard the result — proxy
  // doesn't make authorization decisions; it only refreshes cookies.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
