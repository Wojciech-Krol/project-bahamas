/**
 * `user_calendar_integrations` + `booking_calendar_events` storage
 * helpers. Service-role only — every write here bypasses RLS.
 *
 * Reads of public-shape status (`getCalendarIntegration`) intentionally
 * use the request-scoped client so RLS scopes the SELECT to the calling
 * user.
 */

import { createAdminClient } from "@/src/lib/db/admin";
import { createClient } from "@/src/lib/db/server";
import {
  decryptToken,
  encryptToken,
  encryptedTokenToPostgres,
} from "./crypto";

const SCOPE = "https://www.googleapis.com/auth/calendar.events";

export type CalendarIntegrationStatus = {
  syncEnabled: boolean;
  lastSyncedAt: string | null;
  calendarId: string;
};

export type CalendarTokens = {
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: Date;
};

/** RLS-scoped read for the dashboard. Returns null if the user has
 *  no integration row. */
export async function getCalendarIntegration(
  userId: string,
): Promise<CalendarIntegrationStatus | null> {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return null;
  }
  const { data, error } = await supabase
    .from("user_calendar_integrations")
    .select("sync_enabled, last_synced_at, calendar_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.warn("[calendar/storage] getCalendarIntegration", error);
    return null;
  }
  if (!data) return null;
  return {
    syncEnabled: !!data.sync_enabled,
    lastSyncedAt: (data.last_synced_at as string | null) ?? null,
    calendarId: (data.calendar_id as string | null) ?? "primary",
  };
}

/** Service-role write. Stores encrypted tokens. Used by the OAuth
 *  callback route after a successful code exchange. */
export async function upsertCalendarIntegration(
  userId: string,
  tokens: CalendarTokens,
  scope: string = SCOPE,
): Promise<void> {
  const admin = createAdminClient();
  const accessCipher = encryptedTokenToPostgres(
    encryptToken(tokens.accessToken),
  );
  const refreshCipher = encryptedTokenToPostgres(
    encryptToken(tokens.refreshToken),
  );
  const { error } = await admin.from("user_calendar_integrations").upsert(
    {
      user_id: userId,
      provider: "google",
      access_token_encrypted: accessCipher,
      refresh_token_encrypted: refreshCipher,
      token_expires_at: tokens.tokenExpiresAt.toISOString(),
      scope,
      sync_enabled: true,
      calendar_id: "primary",
    },
    { onConflict: "user_id" },
  );
  if (error) {
    throw new Error(`upsertCalendarIntegration failed: ${error.message}`);
  }
}

/** Service-role delete. Triggered by the disconnect Server Action +
 *  by account anonymisation. Drops the integration row + all booking
 *  event mappings (cascade via FK). */
export async function deleteCalendarIntegration(userId: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("user_calendar_integrations")
    .delete()
    .eq("user_id", userId);
  if (error) {
    throw new Error(`deleteCalendarIntegration failed: ${error.message}`);
  }
}

export async function setSyncEnabled(
  userId: string,
  enabled: boolean,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("user_calendar_integrations")
    .update({ sync_enabled: enabled })
    .eq("user_id", userId);
  if (error) {
    throw new Error(`setSyncEnabled failed: ${error.message}`);
  }
}

/** Pull encrypted tokens + decrypt. Throws if the user has no
 *  integration row. Used by the sync layer and refresh helpers. */
export async function loadDecryptedTokens(
  userId: string,
): Promise<CalendarTokens & { calendarId: string; scope: string }> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("user_calendar_integrations")
    .select(
      "access_token_encrypted, refresh_token_encrypted, token_expires_at, calendar_id, scope",
    )
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) {
    throw new Error("calendar integration not found");
  }
  return {
    accessToken: decryptToken(
      data.access_token_encrypted as string | Buffer | Uint8Array,
    ),
    refreshToken: decryptToken(
      data.refresh_token_encrypted as string | Buffer | Uint8Array,
    ),
    tokenExpiresAt: new Date(data.token_expires_at as string),
    calendarId: (data.calendar_id as string) ?? "primary",
    scope: (data.scope as string) ?? SCOPE,
  };
}

/** Persist a refreshed access token. Refresh-token-flow returns a new
 *  access token + new expiry; refresh token typically stays the same
 *  but Google sometimes rotates it, so we accept either. */
export async function persistRefreshedTokens(
  userId: string,
  next: { accessToken: string; tokenExpiresAt: Date; refreshToken?: string },
): Promise<void> {
  const admin = createAdminClient();
  const update: Record<string, string> = {
    access_token_encrypted: encryptedTokenToPostgres(
      encryptToken(next.accessToken),
    ),
    token_expires_at: next.tokenExpiresAt.toISOString(),
  };
  if (next.refreshToken) {
    update.refresh_token_encrypted = encryptedTokenToPostgres(
      encryptToken(next.refreshToken),
    );
  }
  const { error } = await admin
    .from("user_calendar_integrations")
    .update(update)
    .eq("user_id", userId);
  if (error) {
    throw new Error(`persistRefreshedTokens failed: ${error.message}`);
  }
}

export type BookingCalendarEventStatus =
  | "created"
  | "updated"
  | "deleted"
  | "failed";

export async function getBookingEventMapping(
  bookingId: string,
): Promise<{ calendarEventId: string; userId: string } | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("booking_calendar_events")
    .select("calendar_event_id, user_id")
    .eq("booking_id", bookingId)
    .maybeSingle();
  if (error || !data) return null;
  return {
    calendarEventId: data.calendar_event_id as string,
    userId: data.user_id as string,
  };
}

export async function upsertBookingEventMapping(args: {
  bookingId: string;
  userId: string;
  calendarEventId: string;
  status: BookingCalendarEventStatus;
  lastError?: string | null;
}): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("booking_calendar_events").upsert(
    {
      booking_id: args.bookingId,
      user_id: args.userId,
      provider: "google",
      calendar_event_id: args.calendarEventId,
      status: args.status,
      last_synced_at: new Date().toISOString(),
      last_error: args.lastError ?? null,
    },
    { onConflict: "booking_id" },
  );
  if (error) {
    throw new Error(`upsertBookingEventMapping failed: ${error.message}`);
  }
}

export async function deleteBookingEventMapping(
  bookingId: string,
): Promise<void> {
  const admin = createAdminClient();
  await admin.from("booking_calendar_events").delete().eq("booking_id", bookingId);
}

export async function touchLastSyncedAt(userId: string): Promise<void> {
  const admin = createAdminClient();
  await admin
    .from("user_calendar_integrations")
    .update({ last_synced_at: new Date().toISOString() })
    .eq("user_id", userId);
}

export const GOOGLE_CALENDAR_SCOPE = SCOPE;
