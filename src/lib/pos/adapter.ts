/**
 * POS adapter framework — phase 5a.
 *
 * A POS adapter is a small object that knows how to talk to one booking
 * system (ActiveNow, WodGuru, eFitness, LangLion, or a plain CSV file) and
 * translate that system's schedule into Hakuna's canonical `ExternalSession`
 * shape. The cron (`/api/cron/pos-sync`) calls `fetchSchedule` on every
 * active `pos_integrations` row and upserts the result into `public.sessions`
 * on the `(activity_id, pos_external_id)` natural key defined in migration
 * `0001_initial.sql`.
 *
 * Only the CSV adapter is implemented today. The remaining providers are
 * scheduled for phases 5b–5e and need API access secured by the operator
 * before any code can be written — do not scrape.
 */

export type PosProvider =
  | "manual"
  | "csv"
  | "activenow"
  | "wodguru"
  | "efitness"
  | "langlion";

/**
 * What an adapter returns per class occurrence. `externalId` must be stable
 * for the lifetime of the occurrence in the upstream system — we use it as
 * half of the `(activity_id, pos_external_id)` upsert key.
 */
export type ExternalSession = {
  /** Unique per (provider, partner, activity). Stable across polls. */
  externalId: string;
  /**
   * Whatever the adapter knows — a human-readable name for CSV, or an
   * upstream activity id for API providers. The cron resolves this to a
   * Hakuna `activity_id` using per-integration mapping stored on the
   * `pos_integrations.config_encrypted` blob.
   */
  activityNameOrId: string;
  /** ISO-8601 timestamp. */
  startsAt: string;
  /** ISO-8601 timestamp. */
  endsAt: string;
  capacity: number;
  status?: "scheduled" | "cancelled";
};

/**
 * Adapter-specific credentials + mapping. Always JSON-serialisable — the
 * whole object is aes-256-gcm encrypted via `src/lib/pos/crypto.ts` before
 * it lands in `pos_integrations.config_encrypted`.
 */
export type PosConfig = Record<string, unknown>;

export type BookingExport = {
  bookingId: string;
  customerEmail: string;
  customerName?: string;
  startsAt: string;
  /**
   * If set, mirrors the `pos_external_id` that was imported into the
   * session — lets the adapter target the exact upstream class.
   */
  activityExternalId?: string;
};

export interface POSAdapter {
  provider: PosProvider;
  /**
   * Read the partner's upstream schedule and return `ExternalSession[]`.
   * May throw — the cron catches, marks the integration errored, and
   * increments `consecutive_failures`.
   */
  fetchSchedule(config: PosConfig): Promise<ExternalSession[]>;
  /**
   * Optional reverse sync. Most adapters won't implement this initially.
   * The cron never calls this; it's invoked from the booking confirmation
   * path when an operator opts in per provider.
   */
  pushBooking?(config: PosConfig, booking: BookingExport): Promise<void>;
  /**
   * Cheap connectivity check used by the integrations page.
   */
  testConnection(config: PosConfig): Promise<{ ok: boolean; message: string }>;
}

/**
 * Discriminated error for adapter failures. Cron logs the `code` verbatim
 * onto `pos_integrations.last_error`, so keep codes short and actionable.
 */
export class POSAdapterError extends Error {
  public readonly code: string;
  public readonly provider: PosProvider;
  public readonly cause?: unknown;

  constructor(
    provider: PosProvider,
    code: string,
    message: string,
    cause?: unknown,
  ) {
    super(`[${provider}:${code}] ${message}`);
    this.name = "POSAdapterError";
    this.provider = provider;
    this.code = code;
    this.cause = cause;
  }
}

/**
 * Registry. Today only `csv` is wired up. Other providers are TODO phase-5b
 * onwards — those ship one at a time, each in its own PR, after the operator
 * secures API access from the upstream vendor.
 *
 * Kept lazy (import inside the switch) so phases 5b–5e can add adapters
 * without any of them being dragged into bundles that only need CSV.
 */
export async function getAdapter(
  provider: PosProvider,
): Promise<POSAdapter | null> {
  switch (provider) {
    case "csv": {
      const { csvAdapter } = await import("./adapters/csv");
      return csvAdapter;
    }
    case "activenow":
      // TODO phase-5b: waiting on ActiveNow API credentials from operator.
      return null;
    case "wodguru":
      // TODO phase-5c: waiting on WodGuru API credentials from operator.
      return null;
    case "efitness":
      // TODO phase-5d: waiting on eFitness API credentials from operator.
      return null;
    case "langlion":
      // TODO phase-5e: waiting on LangLion API credentials from operator.
      return null;
    case "manual":
    default:
      // `manual` is not an adapter — it is the default `pos_provider` on
      // sessions that partners edit by hand via the dashboard. It never has
      // a `pos_integrations` row.
      return null;
  }
}

/**
 * List of providers the operator can connect today. The integrations page
 * renders every `PosProvider` regardless, showing a disabled "coming soon"
 * card for any provider not in this list.
 */
export const IMPLEMENTED_PROVIDERS: ReadonlyArray<PosProvider> = ["csv"];

/**
 * The full ordered list rendered on the integrations page. `manual` is
 * excluded — it's not a connectable provider.
 */
export const CONNECTABLE_PROVIDERS: ReadonlyArray<PosProvider> = [
  "csv",
  "activenow",
  "wodguru",
  "efitness",
  "langlion",
];
