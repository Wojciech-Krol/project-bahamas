/**
 * CSV import orchestrator. Glues parser → schema (Zod) → mappers →
 * validator. Pure function: takes raw bytes + resource type, returns
 * canonical rows + errors. No DB, no I/O.
 *
 * The DB upsert step lives in `src/lib/pos/import.ts` (PR 8).
 */

import { z } from "zod";

import type {
  ClassDefinition,
  ImportError,
  Instructor,
  PricingRule,
  Session,
} from "@/src/lib/pos/canonical";

import { decodeCsv, type DetectedEncoding } from "./encoding";
import {
  mapActivityRow,
  mapInstructorRow,
  mapPricingRow,
  mapSessionRow,
  PriceParseError,
  TimestampDstGapError,
  TimestampParseError,
} from "./mappers";
import { indexHeader, parseCsv, readCol } from "./parser";
import {
  SCHEMAS,
  type ResourceType,
  type SessionRow,
  type ActivityRow,
  type InstructorRow,
  type PricingRow,
} from "./schema";

type Canonical = {
  sessions: Session;
  activities: ClassDefinition;
  instructors: Instructor;
  pricing: PricingRule;
};

export type CsvImportResult<T extends ResourceType> = {
  encoding: DetectedEncoding;
  totalRows: number;
  successful: Canonical[T][];
  errors: ImportError[];
  /** Zod-validated raw rows + their source row number, for the
   *  cross-row validator step in the orchestrator. */
  rawRows: Array<{ row: SchemaRow<T>; rowNumber: number }>;
};

type SchemaRow<T extends ResourceType> = T extends "sessions"
  ? SessionRow
  : T extends "activities"
    ? ActivityRow
    : T extends "instructors"
      ? InstructorRow
      : PricingRow;

/**
 * Parse + validate one CSV resource. Each row that fails Zod or
 * mapper conversion is logged as an `ImportError`; remaining rows
 * are returned in canonical shape.
 */
export function importCsv<T extends ResourceType>(
  resource: T,
  bytes: Buffer | Uint8Array,
  options?: { sourceTimezone?: string },
): CsvImportResult<T> {
  const tz = options?.sourceTimezone ?? "Europe/Warsaw";
  const errors: ImportError[] = [];

  const { text, encoding } = decodeCsv(bytes);
  const { rows } = parseCsv(text);

  if (rows.length === 0) {
    return {
      encoding,
      totalRows: 0,
      successful: [],
      errors: [
        {
          rowNumber: 0,
          code: "PARSE",
          message: "Plik jest pusty.",
        },
      ],
      rawRows: [],
    };
  }

  const header = rows[0];
  const idx = indexHeader(header);
  const schema = SCHEMAS[resource];

  // Required-column presence check up-front. A missing required
  // column would produce one identical error per data row otherwise.
  const required = requiredColumnsFor(resource);
  const missing = required.filter((c) => idx[c] === undefined);
  if (missing.length > 0) {
    return {
      encoding,
      totalRows: rows.length - 1,
      successful: [],
      errors: [
        {
          rowNumber: 1,
          code: "VALIDATION",
          message: `Brakuje kolumn: ${missing.join(", ")}`,
        },
      ],
      rawRows: [],
    };
  }

  const successful: Canonical[T][] = [];
  const rawRows: Array<{ row: SchemaRow<T>; rowNumber: number }> = [];

  for (let r = 1; r < rows.length; r += 1) {
    const rowNumber = r + 1; // 1-indexed; header = 1, first data row = 2
    const rawRow = rowToObject(rows[r], idx);

    const parsed = schema.safeParse(rawRow);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors.push(zodIssueToError(issue, rowNumber, rawRow));
      }
      continue;
    }

    try {
      const canonical = applyMapper(resource, parsed.data, tz);
      successful.push(canonical as Canonical[T]);
      rawRows.push({ row: parsed.data as SchemaRow<T>, rowNumber });
    } catch (err) {
      errors.push(mapperErrorToImportError(err, rowNumber, rawRow));
    }
  }

  return {
    encoding,
    totalRows: rows.length - 1,
    successful,
    errors,
    rawRows,
  };
}

function requiredColumnsFor(resource: ResourceType): string[] {
  switch (resource) {
    case "sessions":
      return [
        "external_id",
        "activity_external_id",
        "starts_at",
        "ends_at",
        "capacity",
        "price_pln",
      ];
    case "activities":
      return [
        "external_id",
        "name",
        "category",
        "duration_minutes",
      ];
    case "instructors":
      return ["external_id", "name"];
    case "pricing":
      return ["external_id", "name", "rule_type", "price_pln"];
  }
}

function rowToObject(
  row: string[],
  idx: Record<string, number>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [name, i] of Object.entries(idx)) {
    out[name] = readCol(row, idx, name);
    void i;
  }
  return out;
}

function applyMapper(
  resource: ResourceType,
  row: unknown,
  tz: string,
): unknown {
  switch (resource) {
    case "sessions":
      return mapSessionRow(row as SessionRow, tz);
    case "activities":
      return mapActivityRow(row as ActivityRow);
    case "instructors":
      return mapInstructorRow(row as InstructorRow);
    case "pricing":
      return mapPricingRow(row as PricingRow);
  }
}

function zodIssueToError(
  issue: z.ZodIssue,
  rowNumber: number,
  rawRow: Record<string, string>,
): ImportError {
  const field = issue.path.length > 0 ? String(issue.path[0]) : undefined;
  return {
    rowNumber,
    field,
    code: "VALIDATION",
    message: issue.message,
    rawRow,
  };
}

function mapperErrorToImportError(
  err: unknown,
  rowNumber: number,
  rawRow: Record<string, string>,
): ImportError {
  if (err instanceof PriceParseError) {
    return {
      rowNumber,
      field: "price_pln",
      code: "VALIDATION",
      message: `Nieprawidłowa cena "${err.input}"`,
      rawRow,
    };
  }
  if (err instanceof TimestampDstGapError) {
    return {
      rowNumber,
      field: "starts_at",
      code: "VALIDATION",
      message: `Data "${err.input}" wpada w lukę zmiany czasu (DST). Zmień godzinę.`,
      rawRow,
    };
  }
  if (err instanceof TimestampParseError) {
    return {
      rowNumber,
      field: "starts_at",
      code: "VALIDATION",
      message: `Nieprawidłowa data "${err.input}". Użyj formatu YYYY-MM-DD HH:MM lub DD.MM.YYYY HH:MM.`,
      rawRow,
    };
  }
  return {
    rowNumber,
    code: "PARSE",
    message: err instanceof Error ? err.message : String(err),
    rawRow,
  };
}
