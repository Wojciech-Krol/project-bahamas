/**
 * Supabase browser client.
 *
 * Singleton per browser tab — `createBrowserClient` from `@supabase/ssr` is
 * already memoised internally, but we also cache the instance in module scope
 * so repeated `createClient()` calls during a session return the same handle
 * (avoids duplicate auth listeners and storage subscriptions).
 *
 * Never import this from server code — it reads auth state from `document.cookie`
 * and `window.localStorage`.
 */

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { env } from "@/src/env";

let browserClient: SupabaseClient | undefined;

export function createClient(): SupabaseClient {
  if (browserClient) {
    return browserClient;
  }

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local and restart the dev server.",
    );
  }

  browserClient = createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  return browserClient;
}
