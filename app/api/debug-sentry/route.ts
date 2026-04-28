/**
 * Debug route that intentionally throws, so we can confirm Sentry is
 * wired end-to-end after a deploy.
 *
 * Access control:
 *   - In non-production (`NODE_ENV !== 'production'`) this is always open.
 *     Local dev + preview deploys can hit it freely to smoke-test Sentry.
 *   - In production, callers MUST supply `x-debug-sentry: <CRON_SECRET>`.
 *     Reusing `CRON_SECRET` keeps the secret surface small — we already
 *     trust it for cron endpoints, and there's no scenario where leaking
 *     one without the other is useful to an attacker.
 *
 * When the guard fails we 404 rather than 401/403 so the route doesn't
 * advertise its own existence to probers. Once in, we throw unconditionally
 * — that's the whole point of this endpoint.
 */

import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/src/env";

type ServerEnv = typeof env & { CRON_SECRET?: string };

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const serverEnv = env as ServerEnv;
  const isProd = process.env.NODE_ENV === "production";

  if (isProd) {
    const header = request.headers.get("x-debug-sentry");
    if (!serverEnv.CRON_SECRET || header !== serverEnv.CRON_SECRET) {
      return new NextResponse("Not found", { status: 404 });
    }
  }

  throw new Error("Sentry debug: intentional test exception from /api/debug-sentry");
}
