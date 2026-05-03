/**
 * Cross-row validators — duplicate external_id detection within one
 * file, FK checks against other files in the same upload batch.
 *
 * Pure functions. Each takes already-parsed (Zod-validated) rows
 * and returns a list of `ImportError`s; empty list = clean.
 */

import type { ImportError } from "@/src/lib/pos/canonical";

import type {
  ActivityRow,
  InstructorRow,
  PricingRow,
  SessionRow,
} from "./schema";

type WithRowNum<T> = { row: T; rowNumber: number };

/**
 * Find duplicate `external_id` rows within a single resource. The
 * second + later occurrences become errors; the first one passes
 * through so the validator output deterministically points at the
 * "extra" rows.
 */
export function findDuplicateExternalIds<
  T extends { external_id: string },
>(rows: WithRowNum<T>[]): ImportError[] {
  const seen = new Map<string, number>();
  const errors: ImportError[] = [];
  for (const { row, rowNumber } of rows) {
    const id = row.external_id;
    const firstSeen = seen.get(id);
    if (firstSeen !== undefined) {
      errors.push({
        rowNumber,
        field: "external_id",
        code: "DUPLICATE",
        message: `external_id "${id}" już występuje w wierszu ${firstSeen}`,
      });
    } else {
      seen.set(id, rowNumber);
    }
  }
  return errors;
}

/**
 * Sessions referencing activity_external_id / instructor_external_id
 * that aren't present in the same upload batch.
 *
 * `activityIds` / `instructorIds` are the sets of external_ids the
 * caller has parsed from the activities.csv / instructors.csv (or
 * loaded from existing DB rows when partner is uploading sessions
 * standalone).
 */
export function validateSessionFks(
  sessions: WithRowNum<SessionRow>[],
  activityIds: Set<string>,
  instructorIds: Set<string>,
): ImportError[] {
  const errors: ImportError[] = [];
  for (const { row, rowNumber } of sessions) {
    if (!activityIds.has(row.activity_external_id)) {
      errors.push({
        rowNumber,
        field: "activity_external_id",
        code: "FK_MISSING",
        message: `activity_external_id "${row.activity_external_id}" nie istnieje wśród zajęć`,
      });
    }
    const inst = row.instructor_external_id;
    if (inst && inst.length > 0 && !instructorIds.has(inst)) {
      errors.push({
        rowNumber,
        field: "instructor_external_id",
        code: "FK_MISSING",
        message: `instructor_external_id "${inst}" nie istnieje wśród instruktorów`,
      });
    }
  }
  return errors;
}

/**
 * Pricing rows referencing applies_to_activity_external_ids that
 * aren't in the activities batch / DB. Empty list of ids = applies
 * to all → no FK check needed.
 */
export function validatePricingFks(
  pricing: WithRowNum<PricingRow>[],
  activityIds: Set<string>,
): ImportError[] {
  const errors: ImportError[] = [];
  for (const { row, rowNumber } of pricing) {
    const csv = row.applies_to_activity_external_ids ?? "";
    if (!csv) continue;
    const ids = csv.split(",").map((s) => s.trim()).filter(Boolean);
    for (const id of ids) {
      if (!activityIds.has(id)) {
        errors.push({
          rowNumber,
          field: "applies_to_activity_external_ids",
          code: "FK_MISSING",
          message: `activity_external_id "${id}" nie istnieje wśród zajęć`,
        });
      }
    }
  }
  return errors;
}

/** Common helper: extract the external_id set from any rows. */
export function externalIdSet<T extends { external_id: string }>(
  rows: WithRowNum<T>[],
): Set<string> {
  const out = new Set<string>();
  for (const { row } of rows) out.add(row.external_id);
  return out;
}

/** All cross-row checks at once for a four-resource batch upload. */
export function validateBatch(input: {
  sessions: WithRowNum<SessionRow>[];
  activities: WithRowNum<ActivityRow>[];
  instructors: WithRowNum<InstructorRow>[];
  pricing: WithRowNum<PricingRow>[];
  /** External activity ids already in the DB (for partial uploads). */
  knownActivityIds?: Set<string>;
  knownInstructorIds?: Set<string>;
}): ImportError[] {
  const errors: ImportError[] = [];

  errors.push(...findDuplicateExternalIds(input.sessions));
  errors.push(...findDuplicateExternalIds(input.activities));
  errors.push(...findDuplicateExternalIds(input.instructors));
  errors.push(...findDuplicateExternalIds(input.pricing));

  const activityIds = new Set([
    ...externalIdSet(input.activities),
    ...(input.knownActivityIds ?? []),
  ]);
  const instructorIds = new Set([
    ...externalIdSet(input.instructors),
    ...(input.knownInstructorIds ?? []),
  ]);

  errors.push(...validateSessionFks(input.sessions, activityIds, instructorIds));
  errors.push(...validatePricingFks(input.pricing, activityIds));

  return errors;
}
