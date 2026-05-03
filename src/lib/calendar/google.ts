/**
 * Google Calendar API client — OAuth + event CRUD.
 *
 * No SDK; we hit the REST endpoints directly. The library surface
 * Google ships is bulky and we only need a few endpoints. Refresh-token
 * flow is invoked transparently when an access token is < 60 s from
 * expiry.
 */

import { env } from "@/src/env";

import {
  loadDecryptedTokens,
  persistRefreshedTokens,
  type CalendarTokens,
} from "./storage";

type ServerEnv = typeof env & {
  GOOGLE_CALENDAR_CLIENT_ID?: string;
  GOOGLE_CALENDAR_CLIENT_SECRET?: string;
};

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const CALENDAR_API = "https://www.googleapis.com/calendar/v3";
const REFRESH_LEEWAY_MS = 60 * 1000;

export class CalendarNotConfiguredError extends Error {
  constructor() {
    super("Google Calendar OAuth env vars are not configured");
  }
}

function readClientCreds(): { clientId: string; clientSecret: string } {
  const e = env as ServerEnv;
  if (!e.GOOGLE_CALENDAR_CLIENT_ID || !e.GOOGLE_CALENDAR_CLIENT_SECRET) {
    throw new CalendarNotConfiguredError();
  }
  return {
    clientId: e.GOOGLE_CALENDAR_CLIENT_ID,
    clientSecret: e.GOOGLE_CALENDAR_CLIENT_SECRET,
  };
}

/** Build the Google authorization URL. `state` carries our CSRF nonce
 *  + the user id so the callback can re-associate. */
export function buildAuthorizationUrl(args: {
  redirectUri: string;
  scope: string;
  state: string;
}): string {
  const { clientId } = readClientCreds();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: args.redirectUri,
    response_type: "code",
    scope: args.scope,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state: args.state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

/** Exchange an authorization code for access + refresh tokens. */
export async function exchangeCodeForTokens(args: {
  code: string;
  redirectUri: string;
}): Promise<CalendarTokens> {
  const { clientId, clientSecret } = readClientCreds();
  const body = new URLSearchParams({
    code: args.code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: args.redirectUri,
    grant_type: "authorization_code",
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google token exchange failed: ${res.status} ${text}`);
  }
  const json = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };
  if (!json.refresh_token) {
    // No refresh_token = user previously consented and we hit the
    // grant without prompt=consent. The auth URL above forces consent
    // so this is unexpected. Surface it instead of silently sticking
    // the integration into an unrefreshable state.
    throw new Error(
      "Google did not return a refresh_token — was access_type=offline + prompt=consent set?",
    );
  }
  const expiresAt = new Date(Date.now() + json.expires_in * 1000);
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    tokenExpiresAt: expiresAt,
  };
}

/** Refresh an access token using the refresh token. Persists the new
 *  pair via `persistRefreshedTokens`. */
async function refreshAccessToken(
  userId: string,
  current: CalendarTokens,
): Promise<CalendarTokens> {
  const { clientId, clientSecret } = readClientCreds();
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: current.refreshToken,
    grant_type: "refresh_token",
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google refresh failed: ${res.status} ${text}`);
  }
  const json = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };
  const next: CalendarTokens = {
    accessToken: json.access_token,
    refreshToken: json.refresh_token ?? current.refreshToken,
    tokenExpiresAt: new Date(Date.now() + json.expires_in * 1000),
  };
  await persistRefreshedTokens(userId, {
    accessToken: next.accessToken,
    tokenExpiresAt: next.tokenExpiresAt,
    refreshToken: json.refresh_token,
  });
  return next;
}

/** Returns a usable access token for the user, refreshing if needed. */
export async function getValidAccessToken(userId: string): Promise<{
  accessToken: string;
  calendarId: string;
}> {
  const stored = await loadDecryptedTokens(userId);
  if (stored.tokenExpiresAt.getTime() - Date.now() > REFRESH_LEEWAY_MS) {
    return { accessToken: stored.accessToken, calendarId: stored.calendarId };
  }
  const refreshed = await refreshAccessToken(userId, stored);
  return { accessToken: refreshed.accessToken, calendarId: stored.calendarId };
}

/** Revoke a refresh token at Google so the integration is fully torn
 *  down on disconnect. Failures are non-fatal — the worst case is a
 *  stale grant that will never be used again. */
export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  try {
    await fetch(
      `https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(refreshToken)}`,
      { method: "POST" },
    );
  } catch (err) {
    console.warn("[calendar/google] revokeRefreshToken failed", err);
  }
}

export type CalendarEventInput = {
  summary: string;
  description?: string;
  location?: string;
  startsAt: Date;
  endsAt: Date;
};

function eventBody(input: CalendarEventInput): Record<string, unknown> {
  return {
    summary: input.summary,
    description: input.description,
    location: input.location,
    start: { dateTime: input.startsAt.toISOString() },
    end: { dateTime: input.endsAt.toISOString() },
    reminders: { useDefault: true },
    source: { title: "Hakuna", url: "https://hakuna.app" },
  };
}

export async function createEvent(
  userId: string,
  input: CalendarEventInput,
): Promise<{ eventId: string }> {
  const { accessToken, calendarId } = await getValidAccessToken(userId);
  const res = await fetch(
    `${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(eventBody(input)),
    },
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google createEvent failed: ${res.status} ${text}`);
  }
  const json = (await res.json()) as { id: string };
  return { eventId: json.id };
}

export async function updateEvent(
  userId: string,
  eventId: string,
  input: CalendarEventInput,
): Promise<void> {
  const { accessToken, calendarId } = await getValidAccessToken(userId);
  const res = await fetch(
    `${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      method: "PATCH",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(eventBody(input)),
    },
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google updateEvent failed: ${res.status} ${text}`);
  }
}

export async function deleteEvent(
  userId: string,
  eventId: string,
): Promise<void> {
  const { accessToken, calendarId } = await getValidAccessToken(userId);
  const res = await fetch(
    `${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      method: "DELETE",
      headers: { authorization: `Bearer ${accessToken}` },
    },
  );
  // 410 Gone = already deleted, treat as success.
  if (!res.ok && res.status !== 410) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google deleteEvent failed: ${res.status} ${text}`);
  }
}

export function isCalendarConfigured(): boolean {
  const e = env as ServerEnv;
  return !!(e.GOOGLE_CALENDAR_CLIENT_ID && e.GOOGLE_CALENDAR_CLIENT_SECRET);
}
