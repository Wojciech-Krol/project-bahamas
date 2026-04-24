// TODO-OPERATOR: sign DPA with Supabase before production (commit by launch — see LAUNCH_CHECKLIST.md).

/**
 * Supabase server client.
 *
 * Use from Server Components, Server Actions, and Route Handlers. Auth state
 * is persisted via Next's request-scoped cookie store (`next/headers`), so the
 * same session flows between RSC, client components (via the middleware
 * refresh), and server mutations.
 *
 * Follows the official `@supabase/ssr` App Router pattern — do not improvise
 * cookie handling here. The `getAll` / `setAll` shape is load-bearing.
 */

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";

import { env } from "@/src/env";

/**
 * Create a request-scoped Supabase client bound to the incoming cookie jar.
 *
 * Must be called per-request — never hoisted to module scope, since `cookies()`
 * is tied to the current request context.
 */
export async function createClient(): Promise<SupabaseClient> {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local and restart the dev server.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // `cookies().set(...)` throws when called from a Server Component
            // render. That's expected: RSCs can't mutate response headers.
            // Safe to swallow — the `proxy.ts` middleware refreshes the
            // session cookies on the next request, so auth state stays in
            // sync. Server Actions and Route Handlers are allowed to set
            // cookies, so those paths succeed normally.
          }
        },
      },
    },
  );
}

export type Profile = Record<string, unknown> & { id: string };

export interface CurrentUser {
  user: User;
  profile: Profile | null;
}

/**
 * Resolve the current authenticated user plus their `public.profiles` row.
 *
 * Uses `auth.getUser()` (not `getSession()`) so the JWT is revalidated against
 * the Supabase auth server — `getSession()` trusts the cookie blindly and is
 * unsafe for authorization decisions in RSC / server code.
 *
 * Returns `null` when there is no signed-in user. Returns `profile: null`
 * (without throwing) when the user exists but the `handle_new_user` trigger
 * has not yet created their profile row — callers should treat that as a
 * transient state.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return {
    user,
    profile: (profile as Profile | null) ?? null,
  };
}
