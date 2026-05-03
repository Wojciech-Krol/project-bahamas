/**
 * Vercel Cron: replay failed calendar syncs.
 *
 * Picks up `booking_calendar_events` rows with status='failed' and
 * re-runs `syncBookingConfirmed`. Bounded so a single broken row can't
 * pin the loop. Schedule: once per day (configured in vercel.json).
 *
 * Auth: shared-secret Bearer token (`CRON_SECRET`), same pattern as
 * the expire-bookings cron.
 */

import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/src/env";
import { verifyBearer } from "@/src/lib/auth/bearer";
import { reconcileFailedSyncs } from "@/src/lib/calendar/sync";

type ServerEnv = typeof env & { CRON_SECRET?: string };

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const serverEnv = env as ServerEnv;

  if (!serverEnv.CRON_SECRET) {
    return new NextResponse(
      "cron not configured — set CRON_SECRET in env",
      { status: 503 },
    );
  }
  if (
    !verifyBearer(request.headers.get("authorization"), serverEnv.CRON_SECRET)
  ) {
    return new NextResponse("unauthorized", { status: 401 });
  }

  try {
    const { attempted, recovered } = await reconcileFailedSyncs();
    return NextResponse.json({ ok: true, attempted, recovered });
  } catch (err) {
    console.error("[cron/calendar-resync] failed", err);
    return new NextResponse("internal error", { status: 500 });
  }
}
