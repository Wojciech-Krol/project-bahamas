"use server";

import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createAdminClient } from "@/src/lib/db/admin";
import { createClient, getCurrentUser } from "@/src/lib/db/server";
import { env } from "@/src/env";
import {
  encryptConfig,
  encryptedConfigToPostgres,
  isPosCryptoConfigured,
} from "@/src/lib/pos/crypto";
import { extractActivityNames, parseCsv } from "@/src/lib/pos/adapters/csv";

/**
 * Partner → Integrations server actions.
 *
 * Two actions:
 *
 *   1. `uploadCsv(formData)` — accept a multipart upload, save it to the
 *      private `pos-uploads/{partner_id}/latest.csv` object, validate the
 *      header, and return a list of CSV activity names that do NOT
 *      auto-match an existing partner activity. The caller renders a mapping
 *      UI from that list.
 *
 *   2. `confirmActivityMap(formData)` — persists a user-confirmed
 *      `{ csvName: activityId }` map plus upload metadata into
 *      `pos_integrations.config_encrypted` (aes-256-gcm via
 *      `encryptConfig`). Status is flipped to 'active' so the cron
 *      picks up the integration on the next tick.
 *
 * Trust model: every action re-resolves the partner from `auth.users.id`
 * via `partner_members`. Client-supplied partner ids are ignored.
 */

const LOCALES = ["pl", "en"] as const;
type Locale = (typeof LOCALES)[number];

type ServerEnv = typeof env & {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
};

type PartnerContext = { partnerId: string; locale: Locale };

async function requirePartner(localeRaw: FormDataEntryValue | null): Promise<PartnerContext> {
  const parsedLocale = z.enum(LOCALES).safeParse(localeRaw);
  const locale: Locale = parsedLocale.success ? parsedLocale.data : "pl";

  const serverEnv = env as ServerEnv;
  if (!serverEnv.NEXT_PUBLIC_SUPABASE_URL || !serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // Supabase not configured — nothing to save against. Punting to notFound
    // keeps this consistent with how the payments page handles the same
    // preflight.
    notFound();
  }

  const current = await getCurrentUser();
  if (!current) {
    redirect(`/${locale}/login?next=/${locale}/partner/integrations`);
  }

  const supabase = await createClient();
  const { data: memberships } = await supabase
    .from("partner_members")
    .select("partner_id")
    .eq("user_id", current.user.id)
    .limit(1);
  const membership = memberships?.[0];
  if (!membership) notFound();

  return { partnerId: membership.partner_id as string, locale };
}

/** Shape the upload action returns via `useFormState`. */
export type UploadCsvResult =
  | { ok: true; needsResolution: string[]; fileName: string; uploadedAt: string }
  | { ok: false; error: string };

const CSV_REQUIRED_HEADERS = ["activity_name", "starts_at", "ends_at", "capacity"] as const;
const STORAGE_BUCKET = "pos-uploads";
/** 5 MB. A real partner schedule export almost never exceeds this; anything
 *  larger is far more likely to be a DoS attempt than legitimate data.
 *  Counted as raw bytes so the limit is enforceable before we read the file
 *  into memory. */
const CSV_MAX_BYTES = 5 * 1024 * 1024;

async function readFile(formData: FormData): Promise<File | null> {
  const raw = formData.get("file");
  if (!raw || !(raw instanceof File) || raw.size === 0) return null;
  return raw;
}

export async function uploadCsv(
  _prev: UploadCsvResult | null,
  formData: FormData,
): Promise<UploadCsvResult> {
  if (!isPosCryptoConfigured()) {
    return { ok: false, error: "crypto-missing" };
  }

  const { partnerId } = await requirePartner(formData.get("locale"));

  const file = await readFile(formData);
  if (!file) return { ok: false, error: "no-file" };

  // Cap size BEFORE reading into memory — a 100 MB upload would otherwise
  // get fully buffered just to be rejected. file.size is the metadata
  // length the browser/runtime reports; treat as untrusted but useful.
  if (file.size > CSV_MAX_BYTES) {
    return { ok: false, error: "too-large" };
  }

  const isCsvMime = file.type === "text/csv" || file.type === "application/vnd.ms-excel";
  const isCsvExt = /\.csv$/i.test(file.name);
  if (!isCsvMime && !isCsvExt) return { ok: false, error: "not-csv" };

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.byteLength === 0) return { ok: false, error: "empty" };
  // Belt-and-braces: enforce again on the actual bytes after read in case
  // file.size lied (some runtimes don't populate it accurately for
  // multipart uploads).
  if (buf.byteLength > CSV_MAX_BYTES) {
    return { ok: false, error: "too-large" };
  }

  // Header / row sniff BEFORE upload — if the file is malformed we don't
  // want to overwrite the existing latest.csv.
  const text = buf.toString("utf8");
  const rows = parseCsv(text);
  if (rows.length < 2) return { ok: false, error: "empty" };

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const missing = CSV_REQUIRED_HEADERS.filter((c) => !header.includes(c));
  if (missing.length > 0) {
    return { ok: false, error: `missing-columns:${missing.join(",")}` };
  }

  const admin = createAdminClient();
  const path = `${partnerId}/latest.csv`;
  const { error: uploadError } = await admin.storage
    .from(STORAGE_BUCKET)
    .upload(path, buf, {
      contentType: "text/csv",
      upsert: true,
    });
  if (uploadError) {
    return { ok: false, error: `upload-failed:${uploadError.message}` };
  }

  // Pull distinct activity names from the CSV and diff against what the
  // partner already has in `activities`. Unmatched names go back to the UI
  // so the operator can pick a target from a dropdown per row.
  const names = extractActivityNames(rows);

  const { data: partnerActivities } = await admin
    .from("activities")
    .select("id, title_i18n, venues!inner(partner_id)")
    .eq("venues.partner_id", partnerId);

  const known = new Set<string>();
  for (const row of (partnerActivities ?? []) as Array<{
    id: string;
    title_i18n: Record<string, string> | null;
  }>) {
    const titles = row.title_i18n ?? {};
    for (const v of Object.values(titles)) {
      if (typeof v === "string" && v.trim().length > 0) {
        known.add(v.trim().toLowerCase());
      }
    }
  }

  const needsResolution = names.filter((n) => !known.has(n.trim().toLowerCase()));
  const uploadedAt = new Date().toISOString();

  return {
    ok: true,
    needsResolution,
    fileName: file.name,
    uploadedAt,
  };
}

const ConfirmSchema = z.object({
  locale: z.enum(LOCALES).optional(),
  fileName: z.string().min(1),
  uploadedAt: z.string().min(1),
  // JSON-stringified { csvActivityName: hakunaActivityId (uuid) }
  activityMap: z.string().min(2),
});

export type ConfirmMapResult =
  | { ok: true }
  | { ok: false; error: string };

export async function confirmActivityMap(
  _prev: ConfirmMapResult | null,
  formData: FormData,
): Promise<ConfirmMapResult> {
  if (!isPosCryptoConfigured()) {
    return { ok: false, error: "crypto-missing" };
  }

  const { partnerId, locale } = await requirePartner(formData.get("locale"));

  const parsed = ConfirmSchema.safeParse({
    locale: formData.get("locale") ?? undefined,
    fileName: formData.get("fileName"),
    uploadedAt: formData.get("uploadedAt"),
    activityMap: formData.get("activityMap"),
  });
  if (!parsed.success) {
    return { ok: false, error: "bad-form" };
  }

  let map: Record<string, string>;
  try {
    const raw = JSON.parse(parsed.data.activityMap);
    if (!raw || typeof raw !== "object") throw new Error("not an object");
    map = {};
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      if (typeof k === "string" && typeof v === "string" && v.length > 0) {
        map[k] = v;
      }
    }
  } catch {
    return { ok: false, error: "bad-map" };
  }

  // Validate every mapped uuid actually belongs to an activity owned by this
  // partner — cheap defence against a client that POSTs a random uuid.
  const activityIds = Array.from(new Set(Object.values(map)));
  if (activityIds.length > 0) {
    const admin = createAdminClient();
    const { data: owned } = await admin
      .from("activities")
      .select("id, venues!inner(partner_id)")
      .eq("venues.partner_id", partnerId)
      .in("id", activityIds);
    const ownedSet = new Set(
      ((owned ?? []) as Array<{ id: string }>).map((r) => r.id),
    );
    for (const id of activityIds) {
      if (!ownedSet.has(id)) {
        return { ok: false, error: "activity-not-owned" };
      }
    }
  }

  const configBlob = {
    partnerId,
    fileName: parsed.data.fileName,
    uploadedAt: parsed.data.uploadedAt,
    activityMap: map,
  };

  const encrypted = encryptConfig(configBlob);
  // Bytea columns must be sent to PostgREST as `\x{hex}` — sending a raw
  // Buffer would JSON-serialise to `{type:"Buffer",data:[…]}` and the
  // upsert would either fail or silently corrupt the column.
  const encryptedForPostgres = encryptedConfigToPostgres(encrypted);

  const admin = createAdminClient();
  // Upsert on (partner_id, provider). We intentionally reset consecutive
  // failures + last_error here so a partner reconfiguring after an error
  // state gets a clean slate for the cron.
  const { error: upsertError } = await admin
    .from("pos_integrations")
    .upsert(
      {
        partner_id: partnerId,
        provider: "csv",
        config_encrypted: encryptedForPostgres,
        status: "active",
        last_error: null,
        consecutive_failures: 0,
      },
      { onConflict: "partner_id,provider" },
    );
  if (upsertError) {
    return { ok: false, error: `upsert-failed:${upsertError.message}` };
  }

  revalidatePath(`/${locale}/partner/integrations`);
  return { ok: true };
}

export async function disconnectCsv(formData: FormData): Promise<void> {
  const { partnerId, locale } = await requirePartner(formData.get("locale"));
  const admin = createAdminClient();
  await admin
    .from("pos_integrations")
    .delete()
    .eq("partner_id", partnerId)
    .eq("provider", "csv");
  // Clean up the stored CSV too — a half-disconnected integration with a
  // stale file in storage is exactly the kind of inconsistency that bites
  // partners later when they re-upload and wonder why old data shows up.
  await admin.storage
    .from(STORAGE_BUCKET)
    .remove([`${partnerId}/latest.csv`]);
  revalidatePath(`/${locale}/partner/integrations`);
}
