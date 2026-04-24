/**
 * Vercel Cron: expire stale pending bookings.
 *
 * Hits this route every 10 min (cron schedule configured in vercel.json —
 * outside this file). Anything still `pending` after 30 minutes is treated
 * as an abandoned checkout and flipped to `expired` so the session's
 * `spots_taken` stays consistent (that counter was never incremented for
 * pending bookings — the webhook does that on successful payment).
 *
 * Auth: a shared-secret Bearer token (`CRON_SECRET`). Vercel Cron is
 * allowed to hit internal endpoints, so this guard is critical — without
 * it, anyone could trigger mass expiration of pending bookings.
 */

import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/src/env";
import { createAdminClient } from "@/src/lib/db/admin";

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

  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${serverEnv.CRON_SECRET}`;
  if (authHeader !== expected) {
    return new NextResponse("unauthorized", { status: 401 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    console.error("[cron:expire-bookings] admin client not configured", err);
    return new NextResponse("admin not configured", { status: 503 });
  }

  // 30-minute staleness window — matches the plan. Anything older than
  // this that is still `pending` is effectively dead (the Stripe Checkout
  // session itself expires after a similar window), so we stop blocking
  // inventory on it.
  const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();

  const { data, error } = await admin
    .from("bookings")
    .update({ status: "expired" })
    .eq("status", "pending")
    .lt("created_at", cutoff)
    .select("id");

  if (error) {
    console.error("[cron:expire-bookings] update failed", error);
    return NextResponse.json({ error: "db" }, { status: 500 });
  }

  return NextResponse.json({ expired: data?.length ?? 0 });
}
