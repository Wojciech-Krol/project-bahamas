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
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Supabase Storage — venues + avatars buckets
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      // Stock imagery used by mock data + blog covers
      { protocol: "https", hostname: "images.unsplash.com" },
      // Avatar placeholder service
      { protocol: "https", hostname: "i.pravatar.cc" },
      // Mapbox attribution + tile previews (used by static map images, not gl)
      { protocol: "https", hostname: "api.mapbox.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  /**
   * Legacy domain consolidation — `hakuna.club` was the original
   * hostname; `hakuna.pl` is the canonical going forward. Both
   * domains stay attached to the Vercel project, but every request
   * landing on `hakuna.club` is 301-redirected to the same path on
   * `hakuna.pl` so:
   *   - SEO juice consolidates onto one canonical
   *   - bookmarks / inbound links keep working
   *   - sitemap / hreflang stay single-source
   *
   * Set `HAKUNA_DUAL_DOMAIN=1` in env to skip the redirect (useful
   * during transition, A/B comparisons, or staging dual-canonical
   * verification). Without that flag the redirect is unconditional.
   */
  async redirects() {
    const dual = process.env.HAKUNA_DUAL_DOMAIN === "1";
    if (dual) return [];
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "hakuna.club" }],
        destination: "https://hakuna.pl/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.hakuna.club" }],
        destination: "https://hakuna.pl/:path*",
        permanent: true,
      },
      // Optional: consolidate www.hakuna.pl onto root domain.
      // Comment out if SSL cert covers both and you prefer www.
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.hakuna.pl" }],
        destination: "https://hakuna.pl/:path*",
        permanent: true,
      },
    ];
  },
};

const intlConfig = withNextIntl(nextConfig);

/**
 * Sentry sourcemap CI guard.
 *
 * Vercel production deploys MUST upload sourcemaps so paged-out
 * engineers can read stack traces without manual symbolication.
 * Without `SENTRY_AUTH_TOKEN` the wrapper silently no-ops and we'd
 * ship unsymbolicated bundles.
 *
 * Scope: only the Vercel production environment fires this guard.
 * `next build` locally (or in a non-Vercel CI) still works without
 * the token. `HAKUNA_SKIP_SENTRY_GUARD=1` overrides for emergency
 * hotfixes when Sentry is degraded.
 */
if (
  process.env.VERCEL_ENV === "production" &&
  !process.env.SENTRY_AUTH_TOKEN &&
  process.env.HAKUNA_SKIP_SENTRY_GUARD !== "1"
) {
  throw new Error(
    "[next.config] SENTRY_AUTH_TOKEN is required for Vercel production " +
      "deploys (uploads sourcemaps + creates a release). Set it in the " +
      "Vercel project env, or set HAKUNA_SKIP_SENTRY_GUARD=1 to bypass " +
      "for an emergency.",
  );
}

const finalConfig = process.env.SENTRY_AUTH_TOKEN
  ? withSentryConfig(intlConfig, {
      silent: true,
      org: "hakuna",
      project: "hakuna-web",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    })
  : intlConfig;

export default finalConfig;
