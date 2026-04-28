/**
 * Supabase admin client — bypasses RLS.
 *
 * SERVER-ONLY. Uses the service role key, so it must never be bundled into
 * client code or reachable from the browser. Reserve for:
 *   - webhook handlers (Stripe, Resend, etc.) where there is no user session
 *   - trusted server-side mutations that legitimately need to cross tenant
 *     boundaries (e.g. platform-level admin jobs, cron workers)
 *
 * For anything operating on behalf of a logged-in user, use the request-scoped
 * client from `./server` so RLS policies apply.
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

import { env } from "@/src/env";

// `env` is typed as the union of server + client schemas; on the browser it
// narrows to the client-only shape and loses `SUPABASE_SERVICE_ROLE_KEY`. This
// module is server-only (enforced by the runtime guard below), so we re-type
// the env locally to include the server-only key.
type ServerEnv = typeof env & { SUPABASE_SERVICE_ROLE_KEY: string };

/**
 * Build an admin client. Throws if called from the browser — the service role
 * key must never leave the server process, even if tree-shaking or an import
 * mistake drags this module into a client bundle.
 */
export function createAdminClient(): SupabaseClient {
  if (typeof window !== "undefined") {
    throw new Error(
      "createAdminClient() was called in the browser. The service role key " +
        "must never be exposed to client code — import this module only from " +
        "Route Handlers, Server Actions, or background workers.",
    );
  }

  const serverEnv = env as ServerEnv;

  if (!serverEnv.NEXT_PUBLIC_SUPABASE_URL || !serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Supabase admin client is not configured. Set NEXT_PUBLIC_SUPABASE_URL " +
        "and SUPABASE_SERVICE_ROLE_KEY in .env.local (server-only).",
    );
  }

  return createSupabaseClient(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        // Admin client is stateless — no session persistence, no auto-refresh,
        // no URL detection. Every call uses the service role JWT directly.
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    },
  );
}
