/**
 * Booking lifecycle ↔ Google Calendar bridge.
 *
 * Every entry point is best-effort: failures are logged + recorded in
 * `booking_calendar_events.last_error` so the daily reconcile cron can
 * retry them. We never fail a booking just because the calendar sync
 * failed.
 */

import { createAdminClient } from "@/src/lib/db/admin";
import {
  CalendarNotConfiguredError,
  createEvent,
  deleteEvent,
  isCalendarConfigured,
  updateEvent,
  type CalendarEventInput,
} from "./google";
import {
  deleteBookingEventMapping,
  getBookingEventMapping,
  getCalendarIntegration,
  touchLastSyncedAt,
  upsertBookingEventMapping,
} from "./storage";

type BookingForSync = {
  id: string;
  userId: string;
  startsAt: Date;
  endsAt: Date;
  activityTitle: string;
  venueName: string;
  venueAddress: string | null;
  venueCity: string | null;
  venueLat: number | null;
  venueLng: number | null;
  activitySlug: string | null;
};

const SITE_BASE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://hakuna.app";

function buildEventInput(b: BookingForSync, locale: string): CalendarEventInput {
  const isPl = locale === "pl";
  const directions =
    typeof b.venueLat === "number" && typeof b.venueLng === "number"
      ? `https://www.google.com/maps/search/?api=1&query=${b.venueLat},${b.venueLng}`
      : null;
  const activityUrl = b.activitySlug
    ? `${SITE_BASE}/${locale}/activity/${b.activitySlug}`
    : null;

  const lines: string[] = [];
  lines.push(b.venueName);
  if (b.venueAddress) lines.push(b.venueAddress);
  if (directions) {
    lines.push(isPl ? `Trasa: ${directions}` : `Directions: ${directions}`);
  }
  if (activityUrl) {
    lines.push(isPl ? `Szczegóły: ${activityUrl}` : `Details: ${activityUrl}`);
  }
  lines.push("");
  lines.push(
    isPl
      ? "Wydarzenie utworzone automatycznie przez Hakunę."
      : "Event created automatically by Hakuna.",
  );

  const locationParts = [b.venueName];
  if (b.venueAddress) locationParts.push(b.venueAddress);
  else if (b.venueCity) locationParts.push(b.venueCity);

  return {
    summary: b.activityTitle,
    description: lines.join("\n"),
    location: locationParts.join(", "),
    startsAt: b.startsAt,
    endsAt: b.endsAt,
  };
}

/** Pull the join needed to render a calendar event for a single
 *  booking. Service-role read so we don't fight RLS in webhook
 *  contexts. */
async function loadBookingForSync(
  bookingId: string,
): Promise<BookingForSync | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("bookings")
    .select(
      `
      id,
      user_id,
      session:sessions!inner (
        starts_at,
        ends_at,
        activity:activities!inner (
          slug,
          title_i18n,
          venue:venues!inner (
            name,
            address,
            city,
            lat,
            lng
          )
        )
      )
    `,
    )
    .eq("id", bookingId)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.warn("[calendar/sync] loadBookingForSync failed", error);
    }
    return null;
  }

  const session = (data as { session: unknown }).session as {
    starts_at: string;
    ends_at: string;
    activity: {
      slug: string | null;
      title_i18n: Record<string, string | null> | null;
      venue: {
        name: string;
        address: string | null;
        city: string | null;
        lat: number | null;
        lng: number | null;
      } | null;
    } | null;
  } | null;
  if (!session?.activity?.venue) return null;

  const titleBag = session.activity.title_i18n ?? {};
  const title =
    titleBag.pl || titleBag.en || Object.values(titleBag).find((v) => !!v) || "Hakuna booking";

  return {
    id: (data as { id: string }).id,
    userId: (data as { user_id: string }).user_id,
    startsAt: new Date(session.starts_at),
    endsAt: new Date(session.ends_at),
    activityTitle: title as string,
    activitySlug: session.activity.slug,
    venueName: session.activity.venue.name,
    venueAddress: session.activity.venue.address,
    venueCity: session.activity.venue.city,
    venueLat: session.activity.venue.lat,
    venueLng: session.activity.venue.lng,
  };
}

/** Returns the user's locale preference for description copy. Defaults
 *  to `pl` when no profile row is available. */
async function loadUserLocale(userId: string): Promise<string> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("locale")
    .eq("id", userId)
    .maybeSingle();
  const value = (data as { locale?: string } | null)?.locale;
  return value === "en" || value === "pl" ? value : "pl";
}

/** Should we attempt to sync at all for this user? */
async function shouldSync(userId: string): Promise<boolean> {
  if (!isCalendarConfigured()) return false;
  const status = await getCalendarIntegration(userId);
  return !!status && status.syncEnabled;
}

/** Create or update a calendar event after a booking confirms. */
export async function syncBookingConfirmed(bookingId: string): Promise<void> {
  try {
    const booking = await loadBookingForSync(bookingId);
    if (!booking) return;
    if (!(await shouldSync(booking.userId))) return;

    const locale = await loadUserLocale(booking.userId);
    const input = buildEventInput(booking, locale);
    const existing = await getBookingEventMapping(bookingId);

    if (existing) {
      await updateEvent(booking.userId, existing.calendarEventId, input);
      await upsertBookingEventMapping({
        bookingId,
        userId: booking.userId,
        calendarEventId: existing.calendarEventId,
        status: "updated",
      });
    } else {
      const { eventId } = await createEvent(booking.userId, input);
      await upsertBookingEventMapping({
        bookingId,
        userId: booking.userId,
        calendarEventId: eventId,
        status: "created",
      });
    }
    await touchLastSyncedAt(booking.userId);
  } catch (err) {
    if (err instanceof CalendarNotConfiguredError) return;
    console.error("[calendar/sync] syncBookingConfirmed failed", {
      bookingId,
      err,
    });
    try {
      const booking = await loadBookingForSync(bookingId);
      if (!booking) return;
      const existing = await getBookingEventMapping(bookingId);
      await upsertBookingEventMapping({
        bookingId,
        userId: booking.userId,
        calendarEventId: existing?.calendarEventId ?? "",
        status: "failed",
        lastError: err instanceof Error ? err.message : String(err),
      });
    } catch {
      /* swallow — this is best-effort error capture */
    }
  }
}

/** Delete the calendar event when a booking is cancelled. */
export async function syncBookingCancelled(bookingId: string): Promise<void> {
  try {
    const mapping = await getBookingEventMapping(bookingId);
    if (!mapping) return;
    await deleteEvent(mapping.userId, mapping.calendarEventId);
    await deleteBookingEventMapping(bookingId);
    await touchLastSyncedAt(mapping.userId);
  } catch (err) {
    if (err instanceof CalendarNotConfiguredError) return;
    console.error("[calendar/sync] syncBookingCancelled failed", {
      bookingId,
      err,
    });
    try {
      const mapping = await getBookingEventMapping(bookingId);
      if (!mapping) return;
      await upsertBookingEventMapping({
        bookingId,
        userId: mapping.userId,
        calendarEventId: mapping.calendarEventId,
        status: "failed",
        lastError: err instanceof Error ? err.message : String(err),
      });
    } catch {
      /* swallow */
    }
  }
}

/** Daily reconcile entry point. Picks up rows whose status='failed'
 *  and replays the appropriate sync action. Bounded so a single bad
 *  row can't pin the cron loop. */
export async function reconcileFailedSyncs(limit = 50): Promise<{
  attempted: number;
  recovered: number;
}> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("booking_calendar_events")
    .select("booking_id, status")
    .eq("status", "failed")
    .limit(limit);

  let recovered = 0;
  for (const row of (data ?? []) as Array<{ booking_id: string }>) {
    try {
      await syncBookingConfirmed(row.booking_id);
      recovered += 1;
    } catch {
      /* reconcileFailedSyncs swallows so one bad row doesn't kill the loop */
    }
  }
  return { attempted: (data ?? []).length, recovered };
}
