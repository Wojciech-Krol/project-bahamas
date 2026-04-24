/**
 * Sentry — Edge runtime.
 *
 * Loaded from `instrumentation.ts` (`register()`) when
 * `process.env.NEXT_RUNTIME === 'edge'`. The Edge runtime shares the
 * same `SENTRY_DSN` as the Node server — same backend project, just a
 * different execution surface (middleware, edge route handlers).
 */

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV,
    release: process.env.VERCEL_GIT_COMMIT_SHA ?? "dev",
  });
}
