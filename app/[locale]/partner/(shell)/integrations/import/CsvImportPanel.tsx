"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import { Icon } from "@/src/components/Icon";

type ResourceKey = "sessions" | "activities" | "instructors" | "pricing";

type ImportError = {
  rowNumber: number;
  field?: string;
  code: string;
  message: string;
};

type Result = {
  jobId: string;
  status: "completed" | "failed" | "duplicate";
  totalRows: number;
  successfulRows: number;
  errors: ImportError[];
  cached: boolean;
};

type Props = {
  partnerId: string;
  resourceType: ResourceKey;
  locale: "pl" | "en";
};

const ACCEPT = ".csv,text/csv";
const MAX_BYTES = 10 * 1024 * 1024;

export default function CsvImportPanel({
  partnerId,
  resourceType,
  locale,
}: Props) {
  const t = useTranslations("Partner.import");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = useCallback(
    (f: File) => {
      if (f.size > MAX_BYTES) {
        setError(t("errors.tooLarge"));
        return;
      }
      setError(null);
      setResult(null);
      setFile(f);
      const fd = new FormData();
      fd.set("partnerId", partnerId);
      fd.set("resourceType", resourceType);
      fd.set("file", f);

      startTransition(async () => {
        try {
          const res = await fetch("/api/pos/import", {
            method: "POST",
            body: fd,
          });
          const json = (await res.json()) as Result | { error: string };
          if (!res.ok) {
            setError(t(`errors.${(json as { error: string }).error ?? "internal"}`));
            return;
          }
          setResult(json as Result);
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err));
        }
      });
    },
    [partnerId, resourceType, t],
  );

  function downloadTemplate() {
    void fetch(
      `/api/pos/import/template?resource=${encodeURIComponent(resourceType)}`,
    )
      .then((r) => r.blob())
      .then((b) => {
        const url = URL.createObjectURL(b);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${resourceType}-template.csv`;
        a.click();
        URL.revokeObjectURL(url);
      });
  }

  function downloadErrorsCsv() {
    if (!result || result.errors.length === 0) return;
    const header = "row,field,code,message";
    const lines = result.errors.map(
      (e) =>
        `${e.rowNumber},${esc(e.field ?? "")},${esc(e.code)},${esc(e.message)}`,
    );
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${resourceType}-errors.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-[1.75rem] bg-surface-container-lowest border border-on-surface/[0.06] editorial-shadow p-6 md:p-8">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center">
            <Icon name="upload_file" className="text-[22px]" />
          </span>
          <div>
            <h3 className="font-headline font-bold text-lg">
              {t(`panels.${resourceType}.title`)}
            </h3>
            <p className="text-sm text-on-surface/60">
              {t(`panels.${resourceType}.subtitle`)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={downloadTemplate}
          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all"
        >
          <Icon name="download" className="text-[18px]" />
          {t("downloadTemplate")}
        </button>
      </div>

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) submit(f);
        }}
        className={`flex flex-col items-center justify-center gap-3 rounded-[1.5rem] border-2 border-dashed p-10 cursor-pointer transition-colors ${
          dragOver
            ? "border-primary bg-primary-fixed/40"
            : "border-on-surface/15 hover:border-primary/40 hover:bg-primary-fixed/20"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) submit(f);
          }}
        />
        <span className="w-14 h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center">
          <Icon name="upload" className="text-[24px]" />
        </span>
        <div className="text-center">
          <p className="font-semibold text-on-surface">
            {file ? file.name : t("dropZone.title")}
          </p>
          <p className="text-xs text-on-surface/55 mt-1">
            {t("dropZone.subtitle")}
          </p>
        </div>
      </label>

      {pending && (
        <div className="mt-5 flex items-center gap-2 text-sm text-on-surface/65">
          <Icon name="sync" className="text-[18px] animate-spin" />
          {t("status.processing")}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-2xl bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm flex items-center gap-2"
        >
          <Icon name="error" className="text-[18px]" />
          {error}
        </div>
      )}

      {result && <ResultPanel result={result} t={t} onDownload={downloadErrorsCsv} locale={locale} />}
    </div>
  );
}

function ResultPanel({
  result,
  t,
  onDownload,
  locale,
}: {
  result: Result;
  t: ReturnType<typeof useTranslations>;
  onDownload: () => void;
  locale: "pl" | "en";
}) {
  const fmt = new Intl.NumberFormat(locale === "pl" ? "pl-PL" : "en-GB");
  const isOk = result.status === "completed";
  return (
    <div className="mt-6 space-y-4">
      <div
        className={`rounded-2xl px-5 py-4 flex items-center gap-3 ${
          isOk
            ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
            : "bg-amber-50 border border-amber-200 text-amber-900"
        }`}
      >
        <Icon
          name={isOk ? "check_circle" : "error"}
          className="text-[22px]"
        />
        <div className="flex-1 min-w-0">
          <p className="font-headline font-bold">
            {result.cached
              ? t("status.duplicate")
              : isOk
                ? t("status.completed")
                : t("status.failed")}
          </p>
          <p className="text-sm">
            {fmt.format(result.successfulRows)} / {fmt.format(result.totalRows)}{" "}
            {t("rowsImported")} · {fmt.format(result.errors.length)}{" "}
            {t("errorsCount")}
          </p>
        </div>
      </div>

      {result.errors.length > 0 && (
        <div className="rounded-[1.5rem] bg-surface-container-low border border-on-surface/[0.06] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-surface-container-lowest border-b border-on-surface/[0.06]">
            <h4 className="font-headline font-bold text-sm">
              {t("errorsTable.title")}
            </h4>
            <button
              type="button"
              onClick={onDownload}
              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:gap-2 transition-all"
            >
              <Icon name="download" className="text-[14px]" />
              {t("errorsTable.download")}
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface/55">
                <tr>
                  <th className="text-left px-4 py-2">
                    {t("errorsTable.row")}
                  </th>
                  <th className="text-left px-4 py-2">
                    {t("errorsTable.field")}
                  </th>
                  <th className="text-left px-4 py-2">
                    {t("errorsTable.message")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.errors.slice(0, 100).map((e, i) => (
                  <tr key={i} className="border-t border-on-surface/[0.06]">
                    <td className="px-4 py-2 tabular-nums text-on-surface/65">
                      {e.rowNumber}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs text-on-surface/65">
                      {e.field ?? "—"}
                    </td>
                    <td className="px-4 py-2">{e.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.errors.length > 100 && (
            <p className="px-5 py-3 text-xs text-on-surface/55 border-t border-on-surface/[0.06]">
              {t("errorsTable.truncated", { shown: 100, total: result.errors.length })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function esc(v: string): string {
  if (v.includes(",") || v.includes('"') || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}
