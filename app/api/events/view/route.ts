/**
 * POST /api/events/view — record one activity pageview.
 *
 * Called from the client-side `useTrackView` hook. Schema is validated
 * with zod; abusive clients are rate-limited per anonymous_id via a
 * dedicated Upstash bucket so one flooding session can't drown the
 * whole limiter keyspace.
 *
 * Privacy posture:
 *   - the anonymous_id cookie value and referrer string are persisted
 *     in the `view_events` table (that's what the partner analytics
 *     views key off of), but we deliberately do NOT echo them into
 *     application logs. Failure paths log structural facts only.
 *   - no IP, no user-agent, no session-authenticated user_id beyond
 *     what the service-role insert naturally sees (and `user_id` is
 *     not wired in this handler — we'd need the anon SSR client for
 *     that and the spec doesn't ask for it. Anonymous pageviews
 *     keep the table small and GDPR-simple.)
 *
 * Responses:
 *   - 204 on success (no body, intentional — this is fire-and-forget).
 *   - 400 on schema violation.
 *   - 429 on rate limit exceeded.
 *   - 503 when Supabase isn't configured.
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { createAdminClient } from "@/src/lib/db/admin";
import { createRateLimiter } from "@/src/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 120 events / minute / anonymous_id — generous enough to cover a
// reasonable browsing burst (tab-previews, open-in-background) but
// orders of magnitude below what a scraper would do. Using a named
// bucket keeps this separate from form-submission limiters so one
// noisy client can't poison other limits.
const viewEventsLimiter = createRateLimiter("view-events", {
  requests: 120,
  windowSeconds: 60,
});

const bodySchema = z.object({
  activity_id: z.string().uuid(),
  session_id: z.string().uuid().optional(),
  anonymous_id: z.string().min(1).max(64),
  referrer: z.string().max(512).optional(),
});

export async function POST(request: NextRequest) {
  // ----- parse -----
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return new NextResponse(null, { status: 400 });
  }
  const payload = parsed.data;

  // ----- rate limit -----
  const rl = await viewEventsLimiter.check(payload.anonymous_id);
  if (!rl.success) {
    // deliberately minimal body — clients shouldn't branch on this
    // and operators look at limiter metrics, not the response body.
    return new NextResponse(null, {
      status: 429,
      headers: {
        "retry-after": Math.max(1, Math.ceil((rl.resetMs - Date.now()) / 1000)).toString(),
      },
    });
  }

  // ----- persist -----
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    // env missing → degrade gracefully. the tracker is fire-and-forget
    // so the client doesn't block on this; a 503 is a structural signal
    // for the (rare) operator consulting server logs.
    return new NextResponse("analytics not configured", { status: 503 });
  }

  const { error } = await admin.from("view_events").insert({
    activity_id: payload.activity_id,
    session_id: payload.session_id ?? null,
    anonymous_id: payload.anonymous_id,
    referrer: payload.referrer ?? null,
  });

  if (error) {
    // do NOT log the anonymous_id or referrer value — only the error
    // surface. keeps PII out of sampled / aggregated logs.
    console.warn("[view-events] insert failed", {
      code: error.code,
      message: error.message,
    });
    return new NextResponse(null, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
