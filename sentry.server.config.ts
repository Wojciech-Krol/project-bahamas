/**
 * Sentry — Node.js server runtime.
 *
 * Loaded from `instrumentation.ts` (`register()`) when
 * `process.env.NEXT_RUNTIME === 'nodejs'`. Uses the server-side DSN env
 * (`SENTRY_DSN`) — never the public one — so we don't accidentally reuse
 * a browser token for server traffic.
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
