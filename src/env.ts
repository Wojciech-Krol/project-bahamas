import { z } from "zod";

/**
 * Runtime env validation.
 *
 * Add new keys here as phases progress. Keep server-only and client-exposed
 * (`NEXT_PUBLIC_*`) split — server-only schema is never imported into client
 * components. Importing this module on the server throws if required vars
 * are missing.
 *
 * Source of truth for the running list lives in plan_akcji/HAKUNA_BUILD_PLAN.md.
 */

const isServer = typeof window === "undefined";

const clientSchema = z.object({
  NEXT_PUBLIC_MAPBOX_TOKEN: z.string().min(1).optional(),
  NEXT_PUBLIC_MAPBOX_STYLE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),

  // Phase 1: Supabase (public keys — exposed to browser).
  // Optional during pre-launch so the marketing site keeps building before
  // a Supabase project is provisioned. Auth / DB clients in `src/lib/db/*`
  // throw a clear error if they're invoked without these set.
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),

  // Phase 2: Turnstile public key (bot protection).
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1).optional(),
});

const serverSchema = clientSchema.extend({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Phase 1: Supabase service role (server-only — bypasses RLS).
  // Optional for the same reason as above. `src/lib/db/admin.ts` enforces
  // its presence at call time.
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // Phase 2: email + rate limit + bot protection. All optional until the
  // operator provisions the respective services. Features degrade
  // gracefully — apply form still renders without Turnstile, rate limit
  // becomes a no-op without Upstash, email sending logs+skips without
  // Resend.
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),
  ADMIN_NOTIFICATION_EMAIL: z.string().email().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  TURNSTILE_SECRET_KEY: z.string().min(1).optional(),
});

const parsed = (isServer ? serverSchema : clientSchema).safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", z.treeifyError(parsed.error));
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
export type Env = typeof env;
