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

  // Phase 3: Stripe publishable key (exposed to browser for client SDK).
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),

  // Phase 6: Sentry browser DSN. Safe to expose — it's a write-only token
  // scoped to ingest. Keep distinct from the server DSN so dashboards can
  // separate client-side JS crashes from server/edge exceptions.
  NEXT_PUBLIC_SENTRY_DSN: z.string().min(1).optional(),
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

  // Phase 3: Stripe. Keys required before a booking can actually charge;
  // optional at build time so pre-launch checks still pass.
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  STRIPE_CONNECT_WEBHOOK_SECRET: z.string().min(1).optional(),
  CRON_SECRET: z.string().min(1).optional(),

  // Phase 3.3: Stripe Billing subscription Price IDs. Optional — partners can
  // browse the Plans page before the operator has created Products/Prices in
  // Stripe, and the page falls back to a "tier not configured" placeholder.
  STRIPE_PRICE_PARTNER_PLUS: z.string().min(1).optional(),
  STRIPE_PRICE_PARTNER_PRO: z.string().min(1).optional(),

  // Phase 5: POS integration config encryption key. Base64-encoded 32 random
  // bytes (aes-256-gcm). Optional at build time — the integrations page shows
  // a placeholder, the cron returns 503, and partners cannot connect any POS
  // provider until the operator sets this. Generate with
  //   `openssl rand -base64 32`
  // and store in the deployment env. Rotation requires re-encrypting every
  // `pos_integrations.config_encrypted` blob — see src/lib/pos/crypto.ts for
  // the plan. Never commit this value.
  POS_CONFIG_ENCRYPTION_KEY: z.string().min(1).optional(),

  // Phase 6: Sentry server DSN + release auth token.
  // `SENTRY_DSN` drives server + edge SDK init. `SENTRY_AUTH_TOKEN` is
  // consumed by `withSentryConfig` during `next build` to upload sourcemaps
  // and create a release — when absent, the wrapper is skipped entirely so
  // local builds don't fail asking for a token we haven't provisioned.
  SENTRY_DSN: z.string().min(1).optional(),
  SENTRY_AUTH_TOKEN: z.string().min(1).optional(),
});

const parsed = (isServer ? serverSchema : clientSchema).safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", z.treeifyError(parsed.error));
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
export type Env = typeof env;
