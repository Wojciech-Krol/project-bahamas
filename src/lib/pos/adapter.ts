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
 * Thrown when the integrations cron or a partner action targets a
 * provider that the operator has not enabled in `POS_PROVIDERS_ENABLED`.
 * Distinct from POSAdapterError so callers can decide whether to surface
 * "Coming soon" copy vs treat as a fetch failure to retry.
 */
export class PosProviderUnavailableError extends Error {
  public readonly provider: PosProvider;
  constructor(provider: PosProvider) {
    super(
      `POS provider "${provider}" is not enabled. Add it to ` +
        `POS_PROVIDERS_ENABLED in the deployment env.`,
    );
    this.name = "PosProviderUnavailableError";
    this.provider = provider;
  }
}

const PROVIDER_DEFAULTS: ReadonlyArray<PosProvider> = ["csv"];

/**
 * Resolve the active allow-list of POS providers from
 * `POS_PROVIDERS_ENABLED` (csv-of-slugs). Falls back to `["csv"]` —
 * the only provider with a real adapter today. Reading at call time
 * (not at import) lets ops flip the flag without redeploy.
 */
function getEnabledProviders(): ReadonlyArray<PosProvider> {
  const raw = process.env.POS_PROVIDERS_ENABLED;
  if (!raw) return PROVIDER_DEFAULTS;
  const parsed = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean) as PosProvider[];
  // Filter to known providers — typo'd entries (e.g. "wodgru") get
  // dropped so we don't accidentally match a non-existent slug.
  const known: PosProvider[] = [
    "csv",
    "activenow",
    "wodguru",
    "efitness",
    "langlion",
  ];
  const filtered = parsed.filter((p): p is PosProvider => known.includes(p));
  return filtered.length > 0 ? filtered : PROVIDER_DEFAULTS;
}

export function isProviderEnabled(provider: PosProvider): boolean {
  return getEnabledProviders().includes(provider);
}

/**
 * Registry. CSV is the only adapter implementation that ships today;
 * the other slugs are scaffolded for phases 5b–5e. Even when an
 * adapter exists, `getAdapter` enforces the `POS_PROVIDERS_ENABLED`
 * gate — operators flip a provider live by adding it to the env, not
 * by code change.
 *
 * Kept lazy (import inside the switch) so future adapters don't get
 * dragged into bundles that only need CSV.
 */
export async function getAdapter(
  provider: PosProvider,
): Promise<POSAdapter | null> {
  if (provider === "manual") {
    // `manual` is not an adapter — it is the default `pos_provider` on
    // sessions that partners edit by hand via the dashboard. It never
    // has a `pos_integrations` row.
    return null;
  }
  if (!isProviderEnabled(provider)) {
    throw new PosProviderUnavailableError(provider);
  }
  switch (provider) {
    case "csv": {
      const { csvAdapter } = await import("./adapters/csv");
      return csvAdapter;
    }
    case "activenow":
    case "wodguru":
    case "efitness":
    case "langlion":
      // The provider was flagged on but no adapter ships yet. Treat as
      // unavailable so the cron records a clear error instead of
      // silently no-op'ing.
      throw new PosProviderUnavailableError(provider);
    default:
      return null;
  }
}

/**
 * Set of providers that the operator can connect today, derived from
 * `POS_PROVIDERS_ENABLED`. The integrations page uses this to decide
 * which cards render the live UI vs the "Coming soon" stub.
 */
export function getImplementedProviders(): ReadonlyArray<PosProvider> {
  return getEnabledProviders();
}

/**
 * @deprecated since flag-driven gating: prefer `getImplementedProviders()`
 *             so the value reflects current env at call time. Kept as
 *             a snapshot for callsites that read it once at module load.
 */
export const IMPLEMENTED_PROVIDERS: ReadonlyArray<PosProvider> =
  getEnabledProviders();

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
