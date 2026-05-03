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
  // Resend accepts both bare addresses (`noreply@hakuna.app`) and the
  // friendlier name form (`Hakuna <noreply@hakuna.app>`). z.string().email()
  // would reject the second shape, breaking startup when the operator
  // follows Resend's own docs. Accept any non-empty string instead — the
  // Resend SDK validates the actual address downstream.
  RESEND_FROM_EMAIL: z.string().min(1).optional(),
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

  // Google Calendar OAuth — required to surface the "Connect Google" flow
  // on /account/calendar. All three are server-only; the client never
  // sees the secret. Optional at build time so the dashboard renders a
  // "not configured" banner in pre-launch envs.
  GOOGLE_CALENDAR_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CALENDAR_CLIENT_SECRET: z.string().min(1).optional(),
  // AES-256-GCM key for at-rest encryption of access/refresh tokens.
  // Base64-encoded 32 bytes (`openssl rand -base64 32`). Same shape as
  // POS_CONFIG_ENCRYPTION_KEY; rotation procedure documented alongside.
  CALENDAR_ENCRYPTION_KEY: z.string().min(1).optional(),

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

// ---------------------------------------------------------------------------
// Production preflight warnings
//
// Several config values are .optional() so the marketing site keeps building
// without them, but their absence in production silently breaks core flows
// (sitemap canonicals, Stripe Checkout success/cancel URLs, Resend sender
// reputation, etc.). Emit a single startup warn so an operator notices in
// `vercel logs` even if every page still renders.
//
// Limited to NODE_ENV === 'production' and isServer to avoid noise during
// dev / test / build-time validation passes.
// ---------------------------------------------------------------------------

if (isServer && process.env.NODE_ENV === "production") {
  // Read directly from process.env: the inferred type of `env` on the server
  // narrows to the client schema (server-only keys exist at runtime but
  // aren't in the type), and we don't want a half-cast just for this check.
  const required: Array<{ key: string; reason: string }> = [
    {
      key: "NEXT_PUBLIC_SITE_URL",
      reason:
        "sitemap canonicals + Stripe success/cancel URLs fall back to a placeholder host",
    },
    {
      key: "NEXT_PUBLIC_SUPABASE_URL",
      reason: "DB queries, auth, and storage are unavailable",
    },
    {
      key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      reason: "DB queries, auth, and storage are unavailable",
    },
    {
      key: "STRIPE_SECRET_KEY",
      reason: "no booking can charge",
    },
    {
      key: "STRIPE_WEBHOOK_SECRET",
      reason: "Stripe webhooks are rejected with 503",
    },
    {
      key: "RESEND_API_KEY",
      reason: "all transactional emails silently no-op",
    },
    {
      key: "CRON_SECRET",
      reason: "Vercel cron jobs are rejected with 503",
    },
  ];
  const missing = required.filter((item) => !process.env[item.key]);
  if (missing.length > 0) {
    console.warn(
      "[env] PRODUCTION DEPLOY MISSING REQUIRED VARS — site will degrade:\n" +
        missing.map((m) => `  - ${m.key}: ${m.reason}`).join("\n"),
    );
  }
}
