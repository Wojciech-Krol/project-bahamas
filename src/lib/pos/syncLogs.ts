/**
 * pos_sync_logs writer + reader. Append-only event log grouped by
 * `correlation_id` (one cron tick / webhook delivery / manual sync).
 *
 * Service-role only on the write path; partners READ via RLS.
 */

import { randomUUID } from "node:crypto";

import { createAdminClient } from "@/src/lib/db/admin";
import type { PosProvider } from "./adapter";

export type SyncType = "webhook" | "poll" | "reconciliation" | "manual" | "cron";

export type SyncEventType = "created" | "updated" | "deleted" | "noop" | "error";

export type SyncEventInput = {
  partnerId: string;
  provider: PosProvider;
  syncType: SyncType;
  correlationId: string;
  resourceType?: string;
  externalId?: string;
  hakunaId?: string;
  eventType?: SyncEventType;
  payload?: Record<string, unknown>;
  errorMessage?: string;
  durationMs?: number;
};

/** New correlation id for a sync run. Caller threads it into every
 *  log call from the same run so the dashboard can group + count. */
export function newCorrelationId(): string {
  return randomUUID();
}

export async function logSyncEvent(input: SyncEventInput): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("pos_sync_logs").insert({
    partner_id: input.partnerId,
    pos_provider: input.provider,
    sync_type: input.syncType,
    correlation_id: input.correlationId,
    resource_type: input.resourceType ?? null,
    external_id: input.externalId ?? null,
    hakuna_id: input.hakunaId ?? null,
    event_type: input.eventType ?? null,
    payload: input.payload ?? null,
    error_message: input.errorMessage ?? null,
    duration_ms: input.durationMs ?? null,
  });
  if (error) {
    // Best-effort: never throw from the logging path. The cron
    // should keep running even if observability writes fail.
    console.warn("[pos-sync-logs] insert failed", error.message);
  }
}

export async function logSyncEvents(
  events: SyncEventInput[],
): Promise<void> {
  if (events.length === 0) return;
  const admin = createAdminClient();
  const rows = events.map((e) => ({
    partner_id: e.partnerId,
    pos_provider: e.provider,
    sync_type: e.syncType,
    correlation_id: e.correlationId,
    resource_type: e.resourceType ?? null,
    external_id: e.externalId ?? null,
    hakuna_id: e.hakunaId ?? null,
    event_type: e.eventType ?? null,
    payload: e.payload ?? null,
    error_message: e.errorMessage ?? null,
    duration_ms: e.durationMs ?? null,
  }));
  const { error } = await admin.from("pos_sync_logs").insert(rows);
  if (error) console.warn("[pos-sync-logs] batch insert failed", error.message);
}

export type PartnerSyncStats = {
  /** Most recent successful event_type=created|updated. */
  lastSuccessAt: string | null;
  /** Most recent event_type=error. */
  lastErrorAt: string | null;
  /** Errors / total events in the last 24h, 0..1. */
  errorRate24h: number;
  /** Total events in the last 24h. */
  events24h: number;
};

/** Aggregate per-partner stats for the integrations dashboard widget. */
export async function getPartnerSyncStats(
  partnerId: string,
): Promise<PartnerSyncStats> {
  const admin = createAdminClient();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [{ data: lastOk }, { data: lastErr }, { data: counts }] =
    await Promise.all([
      admin
        .from("pos_sync_logs")
        .select("created_at")
        .eq("partner_id", partnerId)
        .in("event_type", ["created", "updated"])
        .order("created_at", { ascending: false })
        .limit(1),
      admin
        .from("pos_sync_logs")
        .select("created_at")
        .eq("partner_id", partnerId)
        .eq("event_type", "error")
        .order("created_at", { ascending: false })
        .limit(1),
      admin
        .from("pos_sync_logs")
        .select("event_type", { count: "exact" })
        .eq("partner_id", partnerId)
        .gte("created_at", since),
    ]);

  const events = ((counts ?? []) as Array<{ event_type: string | null }>);
  const errors = events.filter((e) => e.event_type === "error").length;
  const total = events.length;

  return {
    lastSuccessAt: (lastOk?.[0] as { created_at: string } | undefined)?.created_at ?? null,
    lastErrorAt: (lastErr?.[0] as { created_at: string } | undefined)?.created_at ?? null,
    errorRate24h: total > 0 ? errors / total : 0,
    events24h: total,
  };
}

/** Hard cap pruning: drop log rows older than `days`. Wire into the
 *  daily reconcile cron. */
export async function prunePosSyncLogs(days = 90): Promise<number> {
  const admin = createAdminClient();
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { error, count } = await admin
    .from("pos_sync_logs")
    .delete({ count: "exact" })
    .lt("created_at", cutoff);
  if (error) {
    console.warn("[pos-sync-logs] prune failed", error.message);
    return 0;
  }
  return count ?? 0;
}
