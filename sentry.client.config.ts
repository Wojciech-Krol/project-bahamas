/**
 * Sentry — browser runtime.
 *
 * Loaded automatically by `@sentry/nextjs` on the client. Reads the public
 * DSN (safe to ship to the browser). When the DSN isn't set we skip init
 * entirely — no warnings, no no-op SDK — so local dev stays silent.
 *
 * Release is tagged with the Vercel commit SHA when available, which lets
 * Sentry group errors by deploy + cross-reference sourcemaps uploaded
 * during `next build` (see `next.config.ts`).
 */

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV,
    release: process.env.VERCEL_GIT_COMMIT_SHA ?? "dev",
  });
}
