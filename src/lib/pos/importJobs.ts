/**
 * pos_import_jobs orchestrator. Connects the CSV pipeline
 * (`src/lib/pos/csv/import.ts`) to the DB:
 *
 *   1. SHA-256 the raw bytes → `file_hash`. Same partner uploading
 *      byte-identical file twice short-circuits to the prior result
 *      via the unique `(partner_id, resource_type, file_hash)` index.
 *   2. INSERT a `pos_import_jobs` row with status='pending'.
 *   3. Run the CSV pipeline (parse → validate → map). Update status
 *      through 'parsing' → 'validating' → 'importing' → 'completed'
 *      or 'failed'.
 *   4. Upsert the canonical rows into the right table:
 *        sessions    → public.sessions
 *        activities  → public.activities
 *        instructors → public.activity_instructors
 *        pricing     → public.pricing_rules
 *   5. Persist `errors` JSONB blob on the job row.
 *
 * Service-role only (writes bypass RLS). Server actions or the
 * cron handler invoke this; never invoked from a request scope
 * directly.
 */

import { createHash } from "node:crypto";

import { createAdminClient } from "@/src/lib/db/admin";
import type {
  ClassDefinition,
  ImportError,
  Instructor,
  PricingRule,
  Session,
} from "./canonical";
import { importCsv } from "./csv/import";
import type { ResourceType } from "./csv/schema";

export type ImportJobResult = {
  jobId: string;
  status: "completed" | "failed" | "duplicate";
  totalRows: number;
  successfulRows: number;
  errors: ImportError[];
  /** True when SHA-256 matched a prior job → no work was done; the
   *  prior job's result was returned. */
  cached: boolean;
};

type ProcessInput = {
  partnerId: string;
  resourceType: ResourceType;
  bytes: Buffer;
  storagePath?: string;
  createdBy?: string;
  sourceTimezone?: string;
};

export async function processCsvImport(
  input: ProcessInput,
): Promise<ImportJobResult> {
  const admin = createAdminClient();
  const fileHash = sha256(input.bytes);

  // 1. Idempotency check — same file already imported = return cached.
  const { data: cached } = await admin
    .from("pos_import_jobs")
    .select("id, status, total_rows, successful_rows, errors")
    .eq("partner_id", input.partnerId)
    .eq("resource_type", input.resourceType)
    .eq("file_hash", fileHash)
    .maybeSingle();

  if (cached) {
    return {
      jobId: (cached as { id: string }).id,
      status:
        (cached as { status: string }).status === "completed"
          ? "completed"
          : "duplicate",
      totalRows: (cached as { total_rows: number | null }).total_rows ?? 0,
      successfulRows:
        (cached as { successful_rows: number | null }).successful_rows ?? 0,
      errors: ((cached as { errors: ImportError[] | null }).errors ?? []) as ImportError[],
      cached: true,
    };
  }

  // 2. Open job row.
  const { data: jobRow, error: jobErr } = await admin
    .from("pos_import_jobs")
    .insert({
      partner_id: input.partnerId,
      pos_provider: "csv",
      resource_type: input.resourceType,
      status: "pending",
      storage_path: input.storagePath ?? null,
      file_hash: fileHash,
      created_by: input.createdBy ?? null,
    })
    .select("id")
    .single();

  if (jobErr || !jobRow) {
    throw new Error(`Failed to create pos_import_jobs row: ${jobErr?.message}`);
  }
  const jobId = (jobRow as { id: string }).id;

  await setStatus(jobId, "parsing");

  // 3. Pipeline.
  let pipeline;
  try {
    pipeline = importCsv(input.resourceType, input.bytes, {
      sourceTimezone: input.sourceTimezone,
    });
  } catch (err) {
    await markFailed(jobId, err);
    throw err;
  }

  await admin
    .from("pos_import_jobs")
    .update({
      encoding: pipeline.encoding,
      total_rows: pipeline.totalRows,
      status: "validating",
    })
    .eq("id", jobId);

  // Hard-stop on header / encoding errors — pipeline returned no rows.
  if (pipeline.successful.length === 0 && pipeline.errors.length > 0) {
    await admin
      .from("pos_import_jobs")
      .update({
        status: "failed",
        successful_rows: 0,
        error_count: pipeline.errors.length,
        errors: pipeline.errors,
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);
    return {
      jobId,
      status: "failed",
      totalRows: pipeline.totalRows,
      successfulRows: 0,
      errors: pipeline.errors,
      cached: false,
    };
  }

  await setStatus(jobId, "importing");

  // 4. Upsert canonical rows → DB.
  let upsertErrors: ImportError[] = [];
  try {
    // Pipeline output type is a discriminated union per resource;
    // upsertCanonical narrows internally based on the resourceType
    // arg, so a runtime cast is safe and the type checker would
    // otherwise demand a switch wrapper at the call site.
    upsertErrors = await upsertCanonical(
      input.partnerId,
      input.resourceType,
      pipeline.successful as never,
    );
  } catch (err) {
    await markFailed(jobId, err);
    throw err;
  }

  const allErrors = [...pipeline.errors, ...upsertErrors];
  const successfulRows = pipeline.successful.length - upsertErrors.length;
  const finalStatus =
    upsertErrors.length === pipeline.successful.length
      ? "failed"
      : "completed";

  await admin
    .from("pos_import_jobs")
    .update({
      status: finalStatus,
      successful_rows: Math.max(0, successfulRows),
      error_count: allErrors.length,
      errors: allErrors,
      completed_at: new Date().toISOString(),
    })
    .eq("id", jobId);

  return {
    jobId,
    status: finalStatus,
    totalRows: pipeline.totalRows,
    successfulRows: Math.max(0, successfulRows),
    errors: allErrors,
    cached: false,
  };
}

function sha256(b: Buffer): string {
  return createHash("sha256").update(b).digest("hex");
}

async function setStatus(jobId: string, status: string): Promise<void> {
  const admin = createAdminClient();
  await admin.from("pos_import_jobs").update({ status }).eq("id", jobId);
}

async function markFailed(jobId: string, err: unknown): Promise<void> {
  const admin = createAdminClient();
  await admin
    .from("pos_import_jobs")
    .update({
      status: "failed",
      errors: [
        {
          rowNumber: 0,
          code: "PARSE",
          message: err instanceof Error ? err.message : String(err),
        },
      ],
      error_count: 1,
      completed_at: new Date().toISOString(),
    })
    .eq("id", jobId);
}

// --------------------------------------------------------------------
// Resource-specific upserts
// --------------------------------------------------------------------

type UpsertCanonicalArgs<T extends ResourceType> = T extends "sessions"
  ? Session[]
  : T extends "activities"
    ? ClassDefinition[]
    : T extends "instructors"
      ? Instructor[]
      : PricingRule[];

async function upsertCanonical<T extends ResourceType>(
  partnerId: string,
  resource: T,
  rows: UpsertCanonicalArgs<T>,
): Promise<ImportError[]> {
  if (rows.length === 0) return [];
  switch (resource) {
    case "sessions":
      return upsertSessions(partnerId, rows as Session[]);
    case "activities":
      return upsertActivities(partnerId, rows as ClassDefinition[]);
    case "instructors":
      return upsertInstructors(partnerId, rows as Instructor[]);
    case "pricing":
      return upsertPricing(partnerId, rows as PricingRule[]);
    default:
      return [];
  }
}

async function upsertSessions(
  partnerId: string,
  rows: Session[],
): Promise<ImportError[]> {
  const admin = createAdminClient();
  // Resolve activity_external_id → activity_id via existing activities
  // table. We store external_id on the session row for round-trip via
  // pos_external_id.
  const externalIds = Array.from(new Set(rows.map((r) => r.classExternalId)));
  const { data: activities } = await admin
    .from("activities")
    .select("id, slug, venue:venues!inner(partner_id)")
    .eq("venues.partner_id", partnerId)
    .in("slug", externalIds);

  type ActRow = { id: string; slug: string };
  const actMap = new Map<string, string>();
  for (const a of (activities ?? []) as ActRow[]) actMap.set(a.slug, a.id);

  const errors: ImportError[] = [];
  const insertable = rows
    .map((row, i) => {
      const activityId = actMap.get(row.classExternalId);
      if (!activityId) {
        errors.push({
          rowNumber: i + 2,
          field: "activity_external_id",
          code: "FK_MISSING",
          message: `Brak zajęć o slug="${row.classExternalId}" w tym partnerze.`,
        });
        return null;
      }
      return {
        activity_id: activityId,
        starts_at: row.startsAt.toISOString(),
        ends_at: row.endsAt.toISOString(),
        capacity: row.capacity,
        spots_taken: row.capacity - row.spotsLeft,
        status: row.status,
        pos_provider: "csv" as const,
        pos_external_id: row.externalId,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  if (insertable.length === 0) return errors;

  const { error } = await admin
    .from("sessions")
    .upsert(insertable, {
      onConflict: "activity_id,pos_external_id",
      ignoreDuplicates: false,
    });
  if (error) {
    errors.push({
      rowNumber: 0,
      code: "UPSTREAM",
      message: `DB upsert sessions failed: ${error.message}`,
    });
  }
  return errors;
}

async function upsertActivities(
  partnerId: string,
  rows: ClassDefinition[],
): Promise<ImportError[]> {
  const admin = createAdminClient();

  // Resolve a venue for each activity. CSV partners typically have one
  // venue; pick it. Multi-venue partners can specify per-activity via
  // metadata.venue_external_id (future).
  const { data: venues } = await admin
    .from("venues")
    .select("id")
    .eq("partner_id", partnerId)
    .limit(1);

  const venueId = (venues?.[0] as { id: string } | undefined)?.id;
  if (!venueId) {
    return [
      {
        rowNumber: 0,
        code: "FK_MISSING",
        message:
          "Partner nie ma żadnego venue. Dodaj venue zanim zaimportujesz zajęcia.",
      },
    ];
  }

  const insertable = rows.map((row) => ({
    venue_id: venueId,
    slug: row.externalId,
    title_i18n: { pl: row.name, en: row.name },
    description_i18n: row.description
      ? { pl: row.description, en: row.description }
      : {},
    price_cents: 0,
    currency: "PLN",
    duration_min: row.durationMinutes,
    level: row.level ?? null,
    category: row.category,
    is_published: false,
  }));

  const { error } = await admin
    .from("activities")
    .upsert(insertable, { onConflict: "slug", ignoreDuplicates: false });
  if (error) {
    return [
      {
        rowNumber: 0,
        code: "UPSTREAM",
        message: `DB upsert activities failed: ${error.message}`,
      },
    ];
  }
  return [];
}

async function upsertInstructors(
  partnerId: string,
  rows: Instructor[],
): Promise<ImportError[]> {
  const admin = createAdminClient();

  // activity_instructors stores per-activity rows. The CSV instructors
  // resource is partner-scoped — we store the instructor-only fields
  // and let the partner UI assign them to activities later. For now,
  // store one row per first activity owned by the partner so the
  // foreign key constraint is satisfied; better: dedicated instructors
  // table in a follow-up.
  //
  // Stub: drop into metadata-only on the partner's profile until the
  // dedicated instructors table lands.
  const errors: ImportError[] = [];
  errors.push({
    rowNumber: 0,
    code: "UPSTREAM",
    message:
      "Import instruktorów wymaga dedykowanej tabeli instructors (TODO 0019). Tymczasem dodaj instruktorów ręcznie w panelu zajęcia → instructors.",
  });
  void partnerId;
  void rows;
  return errors;
}

async function upsertPricing(
  partnerId: string,
  rows: PricingRule[],
): Promise<ImportError[]> {
  const admin = createAdminClient();

  // Resolve applies_to external ids (= activity slugs) → uuid[]
  const externalIds = Array.from(
    new Set(rows.flatMap((r) => r.appliesToClassExternalIds)),
  );
  const { data: activities } = await admin
    .from("activities")
    .select("id, slug, venue:venues!inner(partner_id)")
    .eq("venues.partner_id", partnerId)
    .in("slug", externalIds);

  const slugMap = new Map<string, string>();
  for (const a of (activities ?? []) as Array<{ id: string; slug: string }>) {
    slugMap.set(a.slug, a.id);
  }

  const errors: ImportError[] = [];
  const insertable = rows
    .map((row, i) => {
      const ids: string[] = [];
      for (const slug of row.appliesToClassExternalIds) {
        const id = slugMap.get(slug);
        if (!id) {
          errors.push({
            rowNumber: i + 2,
            field: "applies_to_activity_external_ids",
            code: "FK_MISSING",
            message: `Brak zajęć o slug="${slug}" w tym partnerze.`,
          });
        } else {
          ids.push(id);
        }
      }
      return {
        partner_id: partnerId,
        external_id: row.externalId,
        name: row.name,
        rule_type: row.ruleType,
        price_minor: row.price.amountMinor,
        currency: row.price.currency,
        pass_count: row.passCount ?? null,
        validity_days: row.validityDays ?? null,
        applies_to_activity_ids: ids,
      };
    })
    .filter((r) => !!r);

  const { error } = await admin
    .from("pricing_rules")
    .upsert(insertable, { onConflict: "partner_id,external_id" });
  if (error) {
    errors.push({
      rowNumber: 0,
      code: "UPSTREAM",
      message: `DB upsert pricing_rules failed: ${error.message}`,
    });
  }
  return errors;
}
