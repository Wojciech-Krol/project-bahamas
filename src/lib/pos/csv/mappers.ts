/**
 * Pure functions: validated row → canonical type. No DB, no I/O.
 *
 * Date handling:
 *   Accepted formats —
 *     - ISO-8601: `2026-05-15T18:00:00Z`, `2026-05-15T18:00`
 *     - SQL-ish:  `2026-05-15 18:00`, `2026-05-15 18:00:00`
 *     - PL date:  `15.05.2026 18:00`, `15.05.2026 18:00:00`
 *   The first two are interpreted as the partner's source timezone
 *   (default Europe/Warsaw); ISO-8601 with explicit offset wins.
 *   DST gaps (e.g. 2026-03-29 02:30 CET) throw — silent shifting
 *   would book sessions an hour off. Caller catches + emits an error.
 *
 * Money:
 *   `price_pln` accepts `50.00`, `50,00`, `50`, `1 234,50` (NBSP or
 *   regular space). Output is integer minor units (grosze).
 */

import type {
  ClassDefinition,
  Instructor,
  PricingRule,
  Session,
} from "@/src/lib/pos/canonical";

import type {
  ActivityRow,
  InstructorRow,
  PricingRow,
  SessionRow,
} from "./schema";

const DEFAULT_TIMEZONE = "Europe/Warsaw";

// --------------------------------------------------------------------
// price
// --------------------------------------------------------------------

/**
 * Parse a localized price string into integer minor units.
 * Throws on unparseable input — caller wraps in ImportError.
 */
export function parsePriceMinor(input: string): number {
  // Strip currency hints, whitespace (incl. NBSP / thin space).
  const cleaned = input
    .replace(/ | | /g, " ")
    .replace(/[\p{Letter}]+|€|\$/gu, "")
    .replace(/\s+/g, "")
    .replace(",", ".");
  if (!cleaned) throw new PriceParseError(input);

  // Allow at most one decimal point; accept "50", "50.5", "50.50".
  const m = cleaned.match(/^-?\d+(?:\.\d{1,2})?$/);
  if (!m) throw new PriceParseError(input);

  const n = Number(cleaned);
  if (!Number.isFinite(n)) throw new PriceParseError(input);

  return Math.round(n * 100);
}

export class PriceParseError extends Error {
  constructor(public readonly input: string) {
    super(`Could not parse price "${input}"`);
    this.name = "PriceParseError";
  }
}

// --------------------------------------------------------------------
// timestamps
// --------------------------------------------------------------------

const ISO_RE = /^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/;
const PL_DATE_RE = /^(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?$/;

/**
 * Parse a timestamp into a UTC Date. Throws on invalid / DST gap.
 * `tz` is the assumed source timezone for naive inputs.
 */
export function parseTimestamp(
  input: string,
  tz: string = DEFAULT_TIMEZONE,
): Date {
  const trimmed = input.trim();
  if (!trimmed) throw new TimestampParseError(input);

  // ISO with explicit offset → JS Date can handle it directly.
  if (
    ISO_RE.test(trimmed) &&
    /[Zz]|[+-]\d{2}:?\d{2}$/.test(trimmed)
  ) {
    const d = new Date(trimmed);
    if (Number.isNaN(d.getTime())) throw new TimestampParseError(input);
    return d;
  }

  // PL "DD.MM.YYYY HH:MM[:SS]" → naive parts.
  let y: number, mo: number, d: number, h: number, mi: number, s: number;
  const pl = trimmed.match(PL_DATE_RE);
  if (pl) {
    d = parseInt(pl[1], 10);
    mo = parseInt(pl[2], 10);
    y = parseInt(pl[3], 10);
    h = parseInt(pl[4], 10);
    mi = parseInt(pl[5], 10);
    s = pl[6] ? parseInt(pl[6], 10) : 0;
  } else {
    // ISO without offset: "YYYY-MM-DD[ T]HH:MM[:SS]"
    const m = trimmed.match(
      /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?$/,
    );
    if (!m) throw new TimestampParseError(input);
    y = parseInt(m[1], 10);
    mo = parseInt(m[2], 10);
    d = parseInt(m[3], 10);
    h = parseInt(m[4], 10);
    mi = parseInt(m[5], 10);
    s = m[6] ? parseInt(m[6], 10) : 0;
  }

  // Field-level sanity (catches "30.02.2026" / "32.13.…").
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || h > 23 || mi > 59 || s > 59) {
    throw new TimestampParseError(input);
  }
  // Day-of-month sanity — Date.UTC silently overflows (Feb 30 → Mar 2).
  // Build the candidate UTC date and reject if any field rolled over.
  const probe = new Date(Date.UTC(y, mo - 1, d, h, mi, s));
  if (
    probe.getUTCFullYear() !== y ||
    probe.getUTCMonth() !== mo - 1 ||
    probe.getUTCDate() !== d
  ) {
    throw new TimestampParseError(input);
  }

  return zonedTimeToUtc({ y, mo, d, h, mi, s }, tz);
}

export class TimestampParseError extends Error {
  constructor(public readonly input: string) {
    super(`Could not parse timestamp "${input}"`);
    this.name = "TimestampParseError";
  }
}

export class TimestampDstGapError extends Error {
  constructor(public readonly input: string) {
    super(`Timestamp "${input}" falls in a DST gap (clock skipped over it).`);
    this.name = "TimestampDstGapError";
  }
}

/**
 * Convert (y,mo,d,h,mi,s) interpreted as local time in `tz` into a
 * UTC Date. Detects DST gap — when no instant maps onto the wall
 * clock — and throws so callers can emit a clear error.
 *
 * Implementation: binary-search-ish iteration via the formatToParts
 * inverse trick. The Intl API doesn't expose tz offset for arbitrary
 * dates directly; we round-trip a candidate UTC timestamp through
 * the target tz formatter and adjust until the parts match.
 */
function zonedTimeToUtc(
  parts: { y: number; mo: number; d: number; h: number; mi: number; s: number },
  tz: string,
): Date {
  // Start with the naive UTC interpretation and refine.
  const utcGuess = Date.UTC(
    parts.y,
    parts.mo - 1,
    parts.d,
    parts.h,
    parts.mi,
    parts.s,
  );
  const guess = new Date(utcGuess);
  const offsetMin = tzOffsetMinutes(guess, tz);
  const adjusted = new Date(utcGuess - offsetMin * 60_000);

  // Validate by re-projecting into tz; if the wall-clock parts don't
  // match the input we're in a DST gap (or on a non-existent local
  // time). Re-check across the second offset (DST transition) before
  // declaring failure.
  if (!sameLocalParts(adjusted, parts, tz)) {
    const offsetMin2 = tzOffsetMinutes(adjusted, tz);
    const adjusted2 = new Date(utcGuess - offsetMin2 * 60_000);
    if (sameLocalParts(adjusted2, parts, tz)) return adjusted2;
    throw new TimestampDstGapError(
      `${parts.y}-${pad2(parts.mo)}-${pad2(parts.d)} ${pad2(parts.h)}:${pad2(parts.mi)}`,
    );
  }
  return adjusted;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function tzOffsetMinutes(d: Date, tz: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = dtf.formatToParts(d).reduce<Record<string, string>>(
    (acc, p) => {
      if (p.type !== "literal") acc[p.type] = p.value;
      return acc;
    },
    {},
  );
  const asUtcGuess = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return (asUtcGuess - d.getTime()) / 60_000;
}

function sameLocalParts(
  d: Date,
  parts: { y: number; mo: number; d: number; h: number; mi: number; s: number },
  tz: string,
): boolean {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const got = dtf.formatToParts(d).reduce<Record<string, string>>(
    (acc, p) => {
      if (p.type !== "literal") acc[p.type] = p.value;
      return acc;
    },
    {},
  );
  return (
    Number(got.year) === parts.y &&
    Number(got.month) === parts.mo &&
    Number(got.day) === parts.d &&
    Number(got.hour) === parts.h &&
    Number(got.minute) === parts.mi &&
    Number(got.second) === parts.s
  );
}

// --------------------------------------------------------------------
// row → canonical
// --------------------------------------------------------------------

export function mapSessionRow(
  row: SessionRow,
  tz: string = DEFAULT_TIMEZONE,
): Session {
  return {
    externalId: row.external_id,
    classExternalId: row.activity_external_id,
    instructorExternalId:
      row.instructor_external_id && row.instructor_external_id.length > 0
        ? row.instructor_external_id
        : undefined,
    startsAt: parseTimestamp(row.starts_at, tz),
    endsAt: parseTimestamp(row.ends_at, tz),
    capacity: row.capacity,
    spotsLeft: row.spots_left ?? row.capacity,
    price: {
      amountMinor: parsePriceMinor(row.price_pln),
      currency: row.currency,
    },
    status: row.status,
    sourceTimezone: tz,
  };
}

export function mapActivityRow(row: ActivityRow): ClassDefinition {
  const level = row.level && row.level.length > 0 ? row.level : undefined;
  return {
    externalId: row.external_id,
    name: row.name,
    description:
      row.description && row.description.length > 0 ? row.description : undefined,
    category: row.category,
    durationMinutes: row.duration_minutes,
    capacity: row.capacity,
    level,
    language: row.language,
  };
}

export function mapInstructorRow(row: InstructorRow): Instructor {
  return {
    externalId: row.external_id,
    name: row.name,
    bio: row.bio && row.bio.length > 0 ? row.bio : undefined,
    photoUrl:
      row.photo_url && row.photo_url.length > 0 ? row.photo_url : undefined,
  };
}

export function mapPricingRow(row: PricingRow): PricingRule {
  const csv = row.applies_to_activity_external_ids ?? "";
  const ids = csv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    externalId: row.external_id,
    name: row.name,
    ruleType: row.rule_type,
    price: { amountMinor: parsePriceMinor(row.price_pln), currency: "PLN" },
    passCount: row.pass_count,
    validityDays: row.validity_days,
    appliesToClassExternalIds: ids,
  };
}
