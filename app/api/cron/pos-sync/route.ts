/**
 * Vercel Cron: sync POS integrations every 15 min.
 *
 * Iterates `public.pos_integrations` rows where `status='active'`, decrypts
 * the config blob, asks the adapter for the current upstream schedule, and
 * upserts sessions into `public.sessions` using the natural key
 * `(activity_id, pos_external_id)` (unique index `uq_sessions_activity_pos_external`
 * from migration 0001).
 *
 * Auth: shared-secret Bearer token (`CRON_SECRET`). Without it, anyone could
 * mass-trigger upstream API calls on behalf of partners.
 *
 * Failure model per integration:
 *   - On success: clear `last_error`, bump `last_synced_at`, reset
 *     `consecutive_failures` to 0.
 *   - On failure: increment `consecutive_failures`, write the error message
 *     to `last_error`. When the counter crosses 3, enqueue an admin email
 *     (fire-and-forget) and flip `status` to `error` so the cron stops
 *     retrying until the partner re-enables. Below the threshold the row
 *     stays `active` so the next cron tick can recover.
 *
 * The cron returns an aggregate summary — individual failures do not fail
 * the whole run. One busted integration shouldn't block the other 99.
 */

import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/src/env";
import { createAdminClient } from "@/src/lib/db/admin";
import { decryptConfig, isPosCryptoConfigured } from "@/src/lib/pos/crypto";
import {
  getAdapter,
  type ExternalSession,
  type PosProvider,
} from "@/src/lib/pos/adapter";
import { sendEmail } from "@/src/lib/email/resend";
import { PosSyncFailure } from "@/src/lib/email/templates/PosSyncFailure";

type ServerEnv = typeof env & {
  CRON_SECRET?: string;
  ADMIN_NOTIFICATION_EMAIL?: string;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Threshold at which the admin gets paged. Matches the spec: "admin gets an
// email after 3 consecutive failures".
const FAILURE_NOTIFICATION_THRESHOLD = 3;

type IntegrationRow = {
  id: string;
  partner_id: string;
  provider: PosProvider;
  config_encrypted: unknown; // supabase js returns Buffer | string depending on settings
  consecutive_failures: number;
};

type PartnerInfo = { id: string; name: string };

export async function GET(request: NextRequest) {
  const serverEnv = env as ServerEnv;

  if (!serverEnv.CRON_SECRET) {
    return new NextResponse(
      "cron not configured — set CRON_SECRET in env",
      { status: 503 },
    );
  }

  if (!isPosCryptoConfigured()) {
    return new NextResponse(
      "pos sync not configured — set POS_CONFIG_ENCRYPTION_KEY in env",
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
    console.error("[cron:pos-sync] admin client not configured", err);
    return new NextResponse("admin not configured", { status: 503 });
  }

  const { data: integrations, error: listError } = await admin
    .from("pos_integrations")
    .select("id, partner_id, provider, config_encrypted, consecutive_failures")
    .eq("status", "active");

  if (listError) {
    console.error("[cron:pos-sync] list failed", listError);
    return NextResponse.json({ error: "db" }, { status: 500 });
  }

  const rows = (integrations ?? []) as IntegrationRow[];
  const summary = {
    total: rows.length,
    ok: 0,
    failed: 0,
    upserted: 0,
  };

  for (const row of rows) {
    try {
      const sessions = await syncOne(admin, row);
      summary.ok += 1;
      summary.upserted += sessions;
    } catch (err) {
      summary.failed += 1;
      console.error(
        `[cron:pos-sync] integration ${row.id} (${row.provider}) failed`,
        err,
      );
    }
  }

  return NextResponse.json(summary);
}

/**
 * Sync a single integration. Returns the number of sessions upserted.
 * Throws if the integration-level operation fails — the caller marks the
 * row errored and keeps going.
 */
async function syncOne(
  admin: ReturnType<typeof createAdminClient>,
  row: IntegrationRow,
): Promise<number> {
  const adapter = await getAdapter(row.provider);
  if (!adapter) {
    // The provider's adapter isn't implemented yet — treat as an inert row.
    // Don't flip `status='error'` (it's not the partner's fault); just
    // record a last_error so the integrations page can explain it.
    await markFailure(admin, row, new Error(`adapter for provider '${row.provider}' not implemented`));
    throw new Error(`no adapter for ${row.provider}`);
  }

  let config: Record<string, unknown>;
  try {
    config = decryptConfig(row.config_encrypted as Buffer | Uint8Array | string);
  } catch (err) {
    await markFailure(admin, row, err);
    throw err;
  }

  let external: ExternalSession[];
  try {
    external = await adapter.fetchSchedule(config);
  } catch (err) {
    await markFailure(admin, row, err);
    throw err;
  }

  // Resolve upstream rows to hakuna activity_ids. CSV carries the mapping on
  // the config blob under `activityMap` — other providers will do the same.
  const activityMap = readActivityMap(config);
  const upserts: Array<{
    activity_id: string;
    starts_at: string;
    ends_at: string;
    capacity: number;
    status: "scheduled" | "cancelled";
    pos_provider: PosProvider;
    pos_external_id: string;
  }> = [];

  for (const s of external) {
    const activityId = activityMap[s.activityNameOrId];
    if (!activityId) {
      // Adapter surfaced a row we cannot route — skip it silently. The
      // per-adapter `fetchSchedule` is expected to filter unmapped entries
      // already, but belt-and-braces keeps the upsert safe.
      continue;
    }
    upserts.push({
      activity_id: activityId,
      starts_at: s.startsAt,
      ends_at: s.endsAt,
      capacity: s.capacity,
      status: s.status ?? "scheduled",
      pos_provider: row.provider,
      pos_external_id: s.externalId,
    });
  }

  if (upserts.length > 0) {
    const { error: upsertError } = await admin
      .from("sessions")
      .upsert(upserts, { onConflict: "activity_id,pos_external_id" });
    if (upsertError) {
      await markFailure(admin, row, upsertError);
      throw upsertError;
    }
  }

  const { error: updateError } = await admin
    .from("pos_integrations")
    .update({
      last_synced_at: new Date().toISOString(),
      last_error: null,
      consecutive_failures: 0,
      status: "active",
    })
    .eq("id", row.id);
  if (updateError) {
    throw updateError;
  }

  return upserts.length;
}

function readActivityMap(config: Record<string, unknown>): Record<string, string> {
  const raw = config.activityMap;
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "string" && v.length > 0) out[k] = v;
  }
  return out;
}

/**
 * Increment `consecutive_failures`, persist the error text, and (when the
 * threshold is crossed) flip `status='error'` + notify the admin. Errors
 * during this bookkeeping are logged but not propagated — we never want a
 * cron that can't record a failure to become silent.
 */
async function markFailure(
  admin: ReturnType<typeof createAdminClient>,
  row: IntegrationRow,
  err: unknown,
): Promise<void> {
  const message = err instanceof Error ? err.message : String(err);
  const next = row.consecutive_failures + 1;
  const crossedThreshold = next >= FAILURE_NOTIFICATION_THRESHOLD;

  const { error: updateError } = await admin
    .from("pos_integrations")
    .update({
      consecutive_failures: next,
      last_error: message,
      status: crossedThreshold ? "error" : "active",
    })
    .eq("id", row.id);
  if (updateError) {
    console.error("[cron:pos-sync] failed to record failure", updateError);
  }

  if (crossedThreshold) {
    // Fire-and-forget. Do NOT await — a flaky Resend should not slow the
    // cron down or turn a per-integration failure into a cron-wide failure.
    void notifyAdmin(admin, row, message, next).catch((e) => {
      console.error("[cron:pos-sync] notifyAdmin failed", e);
    });
  }
}

async function notifyAdmin(
  admin: ReturnType<typeof createAdminClient>,
  row: IntegrationRow,
  lastError: string,
  consecutiveFailures: number,
): Promise<void> {
  const serverEnv = env as ServerEnv;
  if (!serverEnv.ADMIN_NOTIFICATION_EMAIL) {
    console.warn(
      "[cron:pos-sync] threshold crossed but ADMIN_NOTIFICATION_EMAIL not set",
    );
    return;
  }

  const { data: partnerRow } = await admin
    .from("partners")
    .select("id, name")
    .eq("id", row.partner_id)
    .maybeSingle();

  const partner: PartnerInfo = (partnerRow as PartnerInfo | null) ?? {
    id: row.partner_id,
    name: row.partner_id,
  };

  await sendEmail({
    to: serverEnv.ADMIN_NOTIFICATION_EMAIL,
    subject: `[Hakuna] POS sync failing for ${partner.name} (${row.provider})`,
    react: PosSyncFailure({
      partnerName: partner.name,
      partnerId: partner.id,
      provider: row.provider,
      consecutiveFailures,
      lastError,
    }),
  });
}
