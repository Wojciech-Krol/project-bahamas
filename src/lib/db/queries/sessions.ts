/**
 * Session queries — booking-side reads against `public.sessions`.
 *
 * The activity detail page asks "what slots can I book for this class?"; this
 * file answers it. The booking flow downstream of `createBooking` reads a
 * single session by id (also here) so it can validate capacity + price the
 * Stripe Checkout line item from the canonical activity row.
 */

import { createClient } from "@/src/lib/db/server";
import type { SessionSlot } from "@/src/lib/db/types";

type SessionRow = {
  id: string;
  activity_id: string;
  starts_at: string;
  ends_at: string;
  capacity: number;
  spots_taken: number;
  status: string;
};

const SESSION_SELECT =
  "id, activity_id, starts_at, ends_at, capacity, spots_taken, status";

function compose(row: SessionRow): SessionSlot {
  return {
    id: row.id,
    activityId: row.activity_id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    capacity: row.capacity,
    spotsTaken: row.spots_taken,
    spotsLeft: Math.max(0, row.capacity - row.spots_taken),
  };
}

/**
 * Upcoming scheduled sessions for an activity, oldest-future-first. Caps at
 * `limit` so the activity page picker doesn't blow up if a partner schedules
 * months out — the picker only shows the next handful anyway.
 */
export async function getUpcomingSessionsByActivity(
  activityId: string,
  limit = 12,
): Promise<SessionSlot[]> {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return [];
  }

  const { data, error } = await supabase
    .from("sessions")
    .select(SESSION_SELECT)
    .eq("activity_id", activityId)
    .eq("status", "scheduled")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(limit)
    .returns<SessionRow[]>();

  if (error) {
    console.error("[db/queries/sessions.getUpcomingSessionsByActivity]", error);
    return [];
  }

  return (data ?? []).map(compose);
}

/** Single session by id, no status filter — caller decides how to react. */
export async function getSessionById(
  id: string,
): Promise<SessionSlot | null> {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return null;
  }

  const { data, error } = await supabase
    .from("sessions")
    .select(SESSION_SELECT)
    .eq("id", id)
    .maybeSingle<SessionRow>();

  if (error) {
    console.error("[db/queries/sessions.getSessionById]", error);
    return null;
  }
  if (!data) return null;
  return compose(data);
}
