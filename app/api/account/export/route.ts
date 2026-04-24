/**
 * GDPR — account data export.
 *
 * Returns the signed-in user's full dataset as a JSON download:
 *   - profile row
 *   - bookings (full columns)
 *   - customer-partner attribution rows
 *   - reviews authored by them
 *   - last 10 000 view_events (truncated — older history is low value
 *     and makes the export slow)
 *
 * Implemented as a POST route handler instead of a Server Action so we
 * can return a `Response` with `Content-Disposition: attachment`. The
 * form on `/account` targets this URL.
 */

import { NextResponse } from "next/server";

import { getCurrentUser } from "@/src/lib/db/server";
import { createAdminClient } from "@/src/lib/db/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VIEW_EVENTS_LIMIT = 10_000;

export async function POST() {
  const current = await getCurrentUser();
  if (!current) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    console.error("[account:export] admin client not configured", err);
    return new NextResponse("Service unavailable", { status: 503 });
  }

  const userId = current.user.id;

  // Fan out in parallel — all of these are read-only and independent.
  const [profile, bookings, attribution, reviews, viewEvents] =
    await Promise.all([
      admin.from("profiles").select("*").eq("id", userId).maybeSingle(),
      admin.from("bookings").select("*").eq("user_id", userId),
      admin
        .from("customer_partner_attribution")
        .select("*")
        .eq("user_id", userId),
      admin.from("reviews").select("*").eq("author_id", userId),
      admin
        .from("view_events")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(VIEW_EVENTS_LIMIT),
    ]);

  const payload = {
    exported_at: new Date().toISOString(),
    user: {
      id: current.user.id,
      email: current.user.email,
      created_at: current.user.created_at,
    },
    profile: profile.data ?? null,
    bookings: bookings.data ?? [],
    attribution: attribution.data ?? [],
    reviews: reviews.data ?? [],
    view_events: viewEvents.data ?? [],
    view_events_truncated_at: VIEW_EVENTS_LIMIT,
  };

  const today = new Date().toISOString().slice(0, 10);
  const filename = `hakuna-export-${userId}-${today}.json`;

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
