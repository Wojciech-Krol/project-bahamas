import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { withSentryConfig } from "@sentry/nextjs";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const isProd = process.env.NODE_ENV === "production";

/**
 * Content Security Policy.
 *
 * Kept conservative but permissive enough for the surfaces we actually use:
 *   - Mapbox GL (script, style, tile fetch, telemetry)
 *   - Stripe.js + Checkout (script + frame)
 *   - Turnstile (script + frame)
 *   - Supabase (REST + realtime websocket)
 *   - Resend (dashboard pings, if any)
 *   - Upstash (REST redis)
 *
 * `'unsafe-inline'` on `script-src` is present because Next.js inlines the
 * RSC boot script; removing it requires the nonce-based CSP flow which we
 * haven't wired yet. `frame-ancestors 'none'` + `X-Frame-Options: DENY`
 * stops clickjacking, which is the value we really care about.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://js.stripe.com https://api.mapbox.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.mapbox.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' https://fonts.gstatic.com",
  // Sentry browser SDK posts errors / sessions / replays to its ingest
  // endpoints. Without these, the SDK silently fails to report — exactly
  // when we need it most. Cover both default (sentry.io) and EU
  // (de.sentry.io / *.ingest.de.sentry.io) regions so changing project
  // region doesn't require a deploy.
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://api.mapbox.com https://events.mapbox.com https://*.resend.com https://challenges.cloudflare.com https://*.upstash.io https://*.ingest.sentry.io https://*.ingest.de.sentry.io https://sentry.io",
  "frame-src 'self' https://challenges.cloudflare.com https://js.stripe.com https://hooks.stripe.com",
  "worker-src 'self' blob:",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
].join("; ");

const securityHeaders: Array<{ key: string; value: string }> = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
  },
];

if (isProd) {
  // HSTS only in prod so local http://localhost traffic isn't forced to
  // upgrade and then refuse. `preload` is intentional — we want to be
  // eligible for the Chrome HSTS preload list once the domain is stable.
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  });
}

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.5.0.2"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

const intlConfig = withNextIntl(nextConfig);

/**
 * Only wrap with Sentry when the auth token is present.
 *
 * `withSentryConfig` performs sourcemap upload + release creation at build
 * time, which requires `SENTRY_AUTH_TOKEN`. If we always wrap, local
 * `next build` errors out on a missing token. The Sentry SDK itself (the
 * runtime init in `sentry.*.config.ts`) is wired through `instrumentation.ts`
 * and works without the wrapper — we just lose sourcemap upload in dev.
 */
const finalConfig = process.env.SENTRY_AUTH_TOKEN
  ? withSentryConfig(intlConfig, {
      silent: true,
      org: "hakuna",
      project: "hakuna-web",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    })
  : intlConfig;

export default finalConfig;
