"use server";

import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/src/lib/db/server";
import {
  buildAuthorizationUrl,
  isCalendarConfigured,
  revokeRefreshToken,
} from "@/src/lib/calendar/google";
import {
  deleteCalendarIntegration,
  GOOGLE_CALENDAR_SCOPE,
  loadDecryptedTokens,
  setSyncEnabled,
} from "@/src/lib/calendar/storage";

const STATE_COOKIE = "hk_cal_state";
const STATE_TTL_SECONDS = 60 * 10; // 10 min — long enough for slow hands.

function callbackUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/api/integrations/google-calendar/callback`;
}

/** Kick off the Google OAuth flow. Returns the authorization URL the
 *  client should navigate to. Stores a CSRF nonce in an httpOnly cookie
 *  that the callback verifies. */
export async function startCalendarConnectAction(): Promise<string | null> {
  const current = await getCurrentUser();
  if (!current) return null;
  if (!isCalendarConfigured()) {
    throw new Error("missing_config");
  }

  const nonce = randomBytes(32).toString("base64url");
  const state = `${current.user.id}.${nonce}`;
  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: STATE_TTL_SECONDS,
  });

  return buildAuthorizationUrl({
    redirectUri: callbackUrl(),
    scope: GOOGLE_CALENDAR_SCOPE,
    state,
  });
}

export async function disconnectCalendarAction(): Promise<void> {
  const current = await getCurrentUser();
  if (!current) return;

  // Best-effort revoke at Google before we drop the row, so a subsequent
  // re-connect can prompt afresh and we don't leave stale grants
  // hanging around the user's Google account.
  try {
    const tokens = await loadDecryptedTokens(current.user.id);
    await revokeRefreshToken(tokens.refreshToken);
  } catch {
    // If we can't decrypt or the row doesn't exist, the delete below
    // is still the right outcome.
  }

  await deleteCalendarIntegration(current.user.id);
  revalidatePath("/account/calendar");
  // Future booking events: any rows in `booking_calendar_events` with
  // FK back to user_calendar_integrations cascade automatically.
  redirect("/account/calendar");
}

export async function setSyncEnabledAction(enabled: boolean): Promise<void> {
  const current = await getCurrentUser();
  if (!current) return;
  await setSyncEnabled(current.user.id, enabled);
  revalidatePath("/account/calendar");
}
