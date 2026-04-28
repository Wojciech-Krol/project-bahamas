/**
 * CSV POS adapter — phase 5a.
 *
 * The "CSV integration" is a stored upload: the partner drops a CSV file into
 * the private `pos-uploads/{partner_id}/latest.csv` object on every update,
 * and the cron fetches that file on each sync.
 *
 * Config shape:
 *
 *   {
 *     partnerId:   string,  // uuid — storage path scope
 *     fileName:    string,  // original upload filename (for audit only)
 *     uploadedAt:  string,  // iso timestamp of the upload
 *     activityMap: { [csvActivityName: string]: string /* hakuna activity uuid *\/ }
 *   }
 *
 * Required CSV columns (case-insensitive, order-independent):
 *   - `activity_name`   — human name; must be present in `activityMap`
 *   - `starts_at`       — iso timestamp
 *   - `ends_at`         — iso timestamp
 *   - `capacity`        — positive integer
 *
 * Optional columns: `status` (scheduled | cancelled), `external_id` (if the
 * partner wants a stable per-row id; otherwise we synthesise one from the
 * activity + start time).
 *
 * Parser notes — we intentionally avoid adding a CSV dependency:
 *   - Quoted fields are supported (`"Foo, Bar"`), with `""` as the escape
 *     for a literal `"` inside a quoted field.
 *   - Fields may span lines inside quotes.
 *   - Delimiter is a comma; record separator is LF or CRLF.
 *   - BOM on the first line is stripped.
 *   - Trailing blank lines are ignored.
 *   - Unquoted leading/trailing whitespace is preserved as written — we do
 *     not strip it because some activity names legitimately carry spaces.
 *   - Malformed rows (wrong column count, unparseable timestamp, etc.) are
 *     skipped and reported back to the caller via `POSAdapterError`.
 */

import { createAdminClient } from "@/src/lib/db/admin";
import {
  POSAdapterError,
  type ExternalSession,
  type POSAdapter,
  type PosConfig,
} from "../adapter";

type CsvConfig = {
  partnerId: string;
  fileName: string;
  uploadedAt: string;
  activityMap: Record<string, string>;
};

const STORAGE_BUCKET = "pos-uploads";
const LATEST_FILENAME = "latest.csv";

function assertCsvConfig(config: PosConfig): CsvConfig {
  const partnerId = typeof config.partnerId === "string" ? config.partnerId : "";
  const fileName = typeof config.fileName === "string" ? config.fileName : "";
  const uploadedAt = typeof config.uploadedAt === "string" ? config.uploadedAt : "";
  const rawMap =
    config.activityMap && typeof config.activityMap === "object"
      ? (config.activityMap as Record<string, unknown>)
      : {};
  const activityMap: Record<string, string> = {};
  for (const [csvName, hakunaId] of Object.entries(rawMap)) {
    if (typeof hakunaId === "string" && hakunaId.length > 0) {
      activityMap[csvName] = hakunaId;
    }
  }

  if (!partnerId) {
    throw new POSAdapterError("csv", "bad-config", "partnerId missing on config");
  }
  return { partnerId, fileName, uploadedAt, activityMap };
}

/**
 * Pure-TS CSV parser. Returns an array of rows, each an array of string
 * fields. Does not interpret headers — that's the adapter's job.
 *
 * Correctness notes:
 *   * A quote char inside a quoted field is emitted via `""`. We track a
 *     `quoted` state and only toggle on `"`; on seeing `""` while quoted
 *     we consume both chars and emit a literal `"`.
 *   * An unquoted field ends at the first `,` or line terminator.
 *   * A quoted field ends only after a closing `"` followed by a delimiter
 *     or line terminator — any other char after the closing quote is
 *     treated as the start of an unquoted continuation and the row is
 *     considered malformed; such rows become an error upstream.
 */
export function parseCsv(input: string): string[][] {
  // strip utf-8 bom
  if (input.charCodeAt(0) === 0xfeff) {
    input = input.slice(1);
  }

  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let quoted = false;
  let i = 0;
  const n = input.length;

  while (i < n) {
    const ch = input[i];

    if (quoted) {
      if (ch === '"') {
        // doubled quote → literal "
        if (i + 1 < n && input[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        // closing quote
        quoted = false;
        i += 1;
        continue;
      }
      field += ch;
      i += 1;
      continue;
    }

    // unquoted state
    if (ch === '"' && field.length === 0) {
      quoted = true;
      i += 1;
      continue;
    }

    if (ch === ",") {
      row.push(field);
      field = "";
      i += 1;
      continue;
    }

    if (ch === "\r") {
      // swallow CR; the following LF (if any) terminates the row.
      i += 1;
      // if there is no LF after CR (old-mac line endings), treat CR as EOL.
      if (i >= n || input[i] !== "\n") {
        row.push(field);
        if (rowIsNotEmpty(row)) rows.push(row);
        row = [];
        field = "";
      }
      continue;
    }

    if (ch === "\n") {
      row.push(field);
      if (rowIsNotEmpty(row)) rows.push(row);
      row = [];
      field = "";
      i += 1;
      continue;
    }

    field += ch;
    i += 1;
  }

  // flush trailing field / row (no final newline case)
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (rowIsNotEmpty(row)) rows.push(row);
  }

  return rows;
}

function rowIsNotEmpty(row: string[]): boolean {
  if (row.length === 0) return false;
  if (row.length === 1 && row[0] === "") return false;
  return true;
}

/**
 * Read the partner's latest CSV from storage. Returns `null` when the
 * partner has never uploaded. Uses the service-role admin client so we
 * can read a private bucket from the cron context without RLS.
 */
async function downloadLatest(partnerId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(STORAGE_BUCKET)
    .download(`${partnerId}/${LATEST_FILENAME}`);
  if (error) {
    // Supabase returns a `not found` shaped error when the object is missing.
    const msg = (error as { message?: string }).message ?? String(error);
    if (/not.?found/i.test(msg)) return null;
    throw new POSAdapterError(
      "csv",
      "download-failed",
      `Could not download CSV: ${msg}`,
      error,
    );
  }
  if (!data) return null;
  return await data.text();
}

/**
 * Lowercased header name → column index. Tolerates header whitespace so
 * partners copying from Excel don't have to scrub it.
 */
function indexHeader(header: string[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (let i = 0; i < header.length; i += 1) {
    map[header[i].trim().toLowerCase()] = i;
  }
  return map;
}

/**
 * Convert one parsed row into an `ExternalSession`, or return `null` if
 * the row is malformed (caller aggregates skips into an adapter error).
 */
function rowToSession(
  row: string[],
  idx: Record<string, number>,
  activityMap: Record<string, string>,
): { session: ExternalSession; hakunaActivityId: string } | { skip: true; reason: string } {
  const nameIdx = idx["activity_name"];
  const startsIdx = idx["starts_at"];
  const endsIdx = idx["ends_at"];
  const capIdx = idx["capacity"];
  const statusIdx = idx["status"];
  const extIdx = idx["external_id"];

  if (nameIdx === undefined || startsIdx === undefined || endsIdx === undefined || capIdx === undefined) {
    return { skip: true, reason: "missing required column" };
  }

  const name = (row[nameIdx] ?? "").trim();
  const startsAt = (row[startsIdx] ?? "").trim();
  const endsAt = (row[endsIdx] ?? "").trim();
  const capRaw = (row[capIdx] ?? "").trim();
  const statusRaw = statusIdx !== undefined ? (row[statusIdx] ?? "").trim().toLowerCase() : "";
  const extRaw = extIdx !== undefined ? (row[extIdx] ?? "").trim() : "";

  if (!name) return { skip: true, reason: "empty activity_name" };

  const hakunaId = activityMap[name];
  if (!hakunaId) return { skip: true, reason: `unmapped activity_name="${name}"` };

  const startsDate = new Date(startsAt);
  const endsDate = new Date(endsAt);
  if (Number.isNaN(startsDate.getTime())) return { skip: true, reason: `bad starts_at="${startsAt}"` };
  if (Number.isNaN(endsDate.getTime())) return { skip: true, reason: `bad ends_at="${endsAt}"` };
  if (endsDate.getTime() <= startsDate.getTime()) {
    return { skip: true, reason: "ends_at must be after starts_at" };
  }

  const capacity = Number.parseInt(capRaw, 10);
  if (!Number.isInteger(capacity) || capacity <= 0) {
    return { skip: true, reason: `bad capacity="${capRaw}"` };
  }

  let status: ExternalSession["status"] | undefined;
  if (statusRaw === "cancelled" || statusRaw === "scheduled") {
    status = statusRaw;
  } else if (statusRaw !== "") {
    // Unknown status values are tolerated but ignored (default = scheduled).
    status = undefined;
  }

  // synthesise an externalId when the CSV doesn't provide one. Must be stable
  // across re-uploads so `(activity_id, pos_external_id)` upserts don't
  // explode into duplicate sessions every sync.
  const externalId = extRaw !== "" ? extRaw : `${hakunaId}@${startsDate.toISOString()}`;

  return {
    hakunaActivityId: hakunaId,
    session: {
      externalId,
      activityNameOrId: name,
      startsAt: startsDate.toISOString(),
      endsAt: endsDate.toISOString(),
      capacity,
      status,
    },
  };
}

export const csvAdapter: POSAdapter = {
  provider: "csv",

  async fetchSchedule(config: PosConfig): Promise<ExternalSession[]> {
    const cfg = assertCsvConfig(config);
    const text = await downloadLatest(cfg.partnerId);
    if (!text) {
      // No upload yet — treat as "nothing to sync", not an error.
      return [];
    }

    const rows = parseCsv(text);
    if (rows.length === 0) {
      throw new POSAdapterError("csv", "empty-file", "CSV has no rows");
    }

    const header = rows[0];
    const idx = indexHeader(header);
    const out: ExternalSession[] = [];
    const skipped: string[] = [];

    for (let r = 1; r < rows.length; r += 1) {
      // column-count tolerance: allow short rows (missing optional trailing
      // columns) — `rowToSession` validates the columns it actually needs.
      const result = rowToSession(rows[r], idx, cfg.activityMap);
      if ("skip" in result) {
        skipped.push(`row ${r + 1}: ${result.reason}`);
        continue;
      }
      out.push(result.session);
    }

    if (out.length === 0) {
      // Every row was malformed — surface the first few reasons so the
      // operator can see *why* when they open the integrations page.
      throw new POSAdapterError(
        "csv",
        "all-rows-malformed",
        `No valid rows in CSV. First issues: ${skipped.slice(0, 3).join(" | ")}`,
      );
    }

    return out;
  },

  // Reverse sync intentionally unimplemented — partners using CSV edit their
  // source-of-truth elsewhere; we don't have a write-back target.
  pushBooking: undefined,

  async testConnection(_config: PosConfig): Promise<{ ok: boolean; message: string }> {
    return {
      ok: true,
      message: "CSV ingest ready — upload a file on the integrations page.",
    };
  },
};

/**
 * Small helper so the integrations page can run the same rowToSession logic
 * on an upload before persisting — the page extracts distinct activity names
 * from the header + rows and hands unresolved ones back to the operator.
 */
export function extractActivityNames(rows: string[][]): string[] {
  if (rows.length === 0) return [];
  const idx = indexHeader(rows[0]);
  const nameIdx = idx["activity_name"];
  if (nameIdx === undefined) return [];
  const seen = new Set<string>();
  for (let r = 1; r < rows.length; r += 1) {
    const raw = (rows[r][nameIdx] ?? "").trim();
    if (raw) seen.add(raw);
  }
  return [...seen];
}

