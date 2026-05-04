/**
 * Per-provider capabilities. UI surfaces (Book button, Coming soon
 * card, schedule editor lock) gate on these flags rather than
 * inspecting provider id directly. Adding a new POS = declare
 * capabilities here + wire its adapter.
 */

import type { PosProvider } from "./adapter";

export type POSCapabilities = {
  /** Adapter can read schedule from upstream. */
  canRead: boolean;
  /** Adapter can write bookings/cancellations to upstream. */
  canWrite: boolean;
  /** Provider pushes events; we expose a webhook handler. */
  hasWebhooks: boolean;
  /** Read latency < 30s end-to-end (webhook / push) vs polling. */
  realtimeSync: boolean;
  /** Adapter can cancel an upstream booking on user action. */
  supportsCancellation: boolean;
  /** Adapter can import partner schedule via batch CSV upload. */
  batchImport: boolean;
};

const DEFAULT: POSCapabilities = {
  canRead: false,
  canWrite: false,
  hasWebhooks: false,
  realtimeSync: false,
  supportsCancellation: false,
  batchImport: false,
};

const REGISTRY: Record<PosProvider, POSCapabilities> = {
  manual: { ...DEFAULT },
  csv: { ...DEFAULT, canRead: true, batchImport: true },
  // Phase-2+ targets — keep the entries so UI doesn't crash on
  // an unflagged provider; flip flags as adapters ship.
  efitness: { ...DEFAULT },
  activenow: { ...DEFAULT },
  wodguru: { ...DEFAULT, canRead: true, batchImport: true }, // CSV-only
  langlion: { ...DEFAULT },
};

export function getCapabilities(provider: PosProvider): POSCapabilities {
  return REGISTRY[provider] ?? DEFAULT;
}
