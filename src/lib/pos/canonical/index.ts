/**
 * Canonical Hakuna POS types — vendor-neutral shape every adapter
 * (CSV, eFitness, future) maps to before reaching the DB.
 *
 * Naming maps onto existing schema:
 *   ClassDefinition  ↔ public.activities
 *   Instructor       ↔ public.activity_instructors
 *   Session          ↔ public.sessions
 *   PricingRule      ↔ public.pricing_rules (migration 0018)
 *
 * Adapters never speak to the DB directly; they emit these types and
 * let the orchestrator `src/lib/pos/import.ts` upsert via service role.
 */

export type Money = {
  /** Integer minor units (grosze for PLN, cents for EUR). */
  amountMinor: number;
  /** ISO 4217. PLN today; multi-currency reserved for future phase. */
  currency: string;
};

export type ActivityCategory =
  | "fitness"
  | "dance"
  | "language"
  | "wellness"
  | "kids"
  | "martial_arts";

export type ActivityLevel = "beginner" | "intermediate" | "advanced";

/** Canonical "what gets taught". Maps to public.activities. */
export type ClassDefinition = {
  externalId: string;
  name: string;
  description?: string;
  category: ActivityCategory;
  durationMinutes: number;
  capacity?: number;
  level?: ActivityLevel;
  language: string;
  metadata?: Record<string, unknown>;
};

/** Canonical instructor record. Maps to public.activity_instructors
 *  (joined per-activity via adapter logic). */
export type Instructor = {
  externalId: string;
  name: string;
  bio?: string;
  photoUrl?: string;
  metadata?: Record<string, unknown>;
};

export type SessionStatus = "scheduled" | "cancelled" | "completed";

/** Canonical bookable slot. Maps to public.sessions. */
export type Session = {
  externalId: string;
  classExternalId: string;
  instructorExternalId?: string;
  startsAt: Date;
  endsAt: Date;
  capacity: number;
  spotsLeft: number;
  price: Money;
  status: SessionStatus;
  /** IANA tz the source row was written in. Adapters convert local
   *  to UTC before populating startsAt/endsAt. */
  sourceTimezone: string;
  metadata?: Record<string, unknown>;
};

export type PricingRuleType =
  | "single"
  | "pass_count"
  | "pass_unlimited"
  | "subscription";

/** Canonical pricing product. Maps to public.pricing_rules. */
export type PricingRule = {
  externalId: string;
  name: string;
  ruleType: PricingRuleType;
  price: Money;
  /** pass_count → number of entries on the card. null for other types. */
  passCount?: number;
  /** Validity window after purchase, in days. */
  validityDays?: number;
  /** External activity ids this product applies to. Empty = all
   *  partner activities. */
  appliesToClassExternalIds: string[];
  metadata?: Record<string, unknown>;
};

/** What every adapter `import*` method returns. */
export type ImportResult<T> = {
  jobId: string;
  totalRows: number;
  successfulRows: number;
  errors: ImportError[];
  upserted: T[];
};

export type ImportErrorCode =
  | "VALIDATION"
  | "FK_MISSING"
  | "DUPLICATE"
  | "ENCODING"
  | "PARSE"
  | "UPSTREAM";

export type ImportError = {
  /** 1-indexed; 1 = header row, first data row = 2. */
  rowNumber: number;
  field?: string;
  code: ImportErrorCode;
  /** User-facing message, locale-aware. Adapter writes Polish. */
  message: string;
  rawRow?: Record<string, unknown>;
};

/** Provider-agnostic input for a batch import call. */
export type ImportInput =
  | {
      kind: "file";
      partnerId: string;
      storagePath: string;
      jobId: string;
    }
  | {
      kind: "inline";
      partnerId: string;
      content: string;
      jobId: string;
    };
