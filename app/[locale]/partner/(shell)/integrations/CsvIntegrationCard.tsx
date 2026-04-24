"use client";

import { useActionState, useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";

import { Icon } from "@/app/components/Icon";

import {
  confirmActivityMap,
  disconnectCsv,
  uploadCsv,
  type ConfirmMapResult,
  type UploadCsvResult,
} from "./actions";

type ActivityOption = { id: string; label: string };

type Props = {
  locale: "pl" | "en";
  providerLabel: string;
  activities: ActivityOption[];
  statusChip: ReactNode;
  lastSyncedLabel: string | null;
  lastErrorLabel: string | null;
  isConnected: boolean;
};

/**
 * Two-step UI:
 *   1. File upload form. Server action writes to storage and returns a list
 *      of activity names that couldn't be auto-matched.
 *   2. Mapping form. One <select> per unmatched name; submit encrypts the
 *      full config and upserts `pos_integrations`.
 *
 * Steps render inline — we don't push extra routes because the whole thing
 * is inside the partner shell and the partner often tweaks mapping on the
 * same visit as upload.
 */
export default function CsvIntegrationCard({
  locale,
  providerLabel,
  activities,
  statusChip,
  lastSyncedLabel,
  lastErrorLabel,
  isConnected,
}: Props) {
  const t = useTranslations("Partner.integrations");
  const tCsv = useTranslations("Partner.integrations.csv");

  const [uploadState, uploadAction, uploadPending] = useActionState<UploadCsvResult | null, FormData>(
    uploadCsv,
    null,
  );
  const [confirmState, confirmAction, confirmPending] = useActionState<ConfirmMapResult | null, FormData>(
    confirmActivityMap,
    null,
  );

  // Local mapping state — start blank when a fresh upload comes in. The
  // dependency on `uploadState?.uploadedAt` resets the map on every fresh
  // upload without an effect (derived state is fine here because the key is
  // deterministic).
  const [mapDraft, setMapDraft] = useState<Record<string, string>>({});
  const uploadedAt = uploadState?.ok ? uploadState.uploadedAt : null;
  const needsResolution = useMemo(
    () => (uploadState?.ok ? uploadState.needsResolution : []),
    [uploadState],
  );

  const uploadErrorKey = uploadState && uploadState.ok === false ? uploadState.error : null;
  const resolvedUploadError = resolveUploadError(uploadErrorKey, tCsv);

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-[#FAEEDA] editorial-shadow p-6 space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="w-12 h-12 rounded-xl bg-primary-fixed text-primary flex items-center justify-center">
          <Icon name="upload_file" className="text-[24px]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-headline font-bold text-lg">{providerLabel}</div>
          <p className="text-sm text-on-surface/60 mt-1">{tCsv("description")}</p>
        </div>
        <div>{statusChip}</div>
      </div>

      {(lastSyncedLabel || lastErrorLabel) && (
        <div className="text-xs text-on-surface/60 space-y-1 border-t border-on-surface/5 pt-4">
          {lastSyncedLabel && <div>{lastSyncedLabel}</div>}
          {lastErrorLabel && <div className="text-error font-medium">{lastErrorLabel}</div>}
        </div>
      )}

      <form action={uploadAction} className="space-y-3 border-t border-on-surface/5 pt-4">
        <input type="hidden" name="locale" value={locale} />
        <label className="block text-sm font-medium text-on-surface/80">
          {tCsv("uploadLabel")}
        </label>
        <input
          type="file"
          name="file"
          accept=".csv,text/csv"
          className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-fixed file:text-primary hover:file:bg-primary-fixed-dim"
          required
        />
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="submit"
            disabled={uploadPending}
            className="bg-primary text-on-primary px-6 py-2.5 rounded-2xl font-headline uppercase tracking-widest text-[0.7rem] font-bold hover:bg-tertiary transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            <Icon name="upload" className="text-[18px]" />
            {tCsv("uploadCta")}
          </button>
          {isConnected && (
            <form action={disconnectCsv}>
              <input type="hidden" name="locale" value={locale} />
              <button
                type="submit"
                className="bg-surface-container-high text-on-surface/80 px-6 py-2.5 rounded-2xl font-headline uppercase tracking-widest text-[0.7rem] font-bold hover:bg-surface-container-highest transition-colors"
              >
                {t("actions.disconnect")}
              </button>
            </form>
          )}
        </div>
        {resolvedUploadError && (
          <p className="text-sm text-error font-medium">{resolvedUploadError}</p>
        )}
        {uploadState?.ok && needsResolution.length === 0 && !confirmState?.ok && (
          <p className="text-sm text-on-surface/70">{tCsv("uploadSuccess")}</p>
        )}
      </form>

      {uploadState?.ok && uploadedAt && (
        <form action={confirmAction} className="border-t border-on-surface/5 pt-4 space-y-4">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="fileName" value={uploadState.fileName} />
          <input type="hidden" name="uploadedAt" value={uploadedAt} />
          <input type="hidden" name="activityMap" value={JSON.stringify(mapDraft)} />

          <div>
            <h3 className="font-headline font-bold text-base">{tCsv("mapHeader")}</h3>
            <p className="text-sm text-on-surface/60 mt-1">{tCsv("mapIntro")}</p>
          </div>

          {needsResolution.length === 0 ? (
            <p className="text-sm text-on-surface/60 italic">
              {/* All names matched automatically — the submit still needs to run
                  to persist the empty map + metadata so the cron can pick up
                  the upload. */}
            </p>
          ) : (
            <div className="space-y-3">
              {needsResolution.map((csvName) => (
                <div key={csvName} className="flex items-center gap-3 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <div className="text-sm font-medium truncate">{csvName}</div>
                    <div className="text-xs text-on-surface/50">{tCsv("mapSelectLabel")}</div>
                  </div>
                  <select
                    value={mapDraft[csvName] ?? ""}
                    onChange={(e) =>
                      setMapDraft((prev) => ({ ...prev, [csvName]: e.target.value }))
                    }
                    className="bg-surface-container-low border border-on-surface/10 rounded-xl px-3 py-2 text-sm min-w-[200px]"
                  >
                    <option value="">{tCsv("mapSelectPlaceholder")}</option>
                    {activities.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={confirmPending}
            className="bg-primary text-on-primary px-6 py-2.5 rounded-2xl font-headline uppercase tracking-widest text-[0.7rem] font-bold hover:bg-tertiary transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            <Icon name="check" className="text-[18px]" />
            {tCsv("mapConfirm")}
          </button>

          {confirmState?.ok && (
            <p className="text-sm text-primary font-medium">{tCsv("savedMapping")}</p>
          )}
          {confirmState && confirmState.ok === false && (
            <p className="text-sm text-error font-medium">{tCsv("errors.generic")}</p>
          )}
        </form>
      )}
    </div>
  );
}

function resolveUploadError(
  raw: string | null,
  tCsv: ReturnType<typeof useTranslations>,
): string | null {
  if (!raw) return null;
  if (raw === "not-csv") return tCsv("errors.notCsv");
  if (raw === "empty" || raw === "no-file") return tCsv("errors.empty");
  if (raw.startsWith("missing-columns:")) {
    const cols = raw.slice("missing-columns:".length);
    return tCsv("errors.missingColumn", { columns: cols });
  }
  if (raw === "crypto-missing") return tCsv("errors.generic");
  if (raw.startsWith("upload-failed:")) {
    const msg = raw.slice("upload-failed:".length);
    return tCsv("errors.uploadFailed", { error: msg });
  }
  return tCsv("errors.generic");
}
