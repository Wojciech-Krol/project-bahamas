/**
 * Zod row schemas for the four CSV resource types — sessions,
 * activities (the plan calls these "classes"), instructors, pricing.
 *
 * Schemas validate row shape only. Cross-row checks (FK, duplicates)
 * live in `validator.ts`. Numeric conversions (price PLN → grosze,
 * date local → UTC) happen in `mappers.ts`.
 */

import { z } from "zod";

const nonEmpty = z
  .string()
  .min(1, { message: "wymagane" })
  .max(200);

const externalId = z
  .string()
  .min(1, { message: "wymagane" })
  .max(100, { message: "max 100 znaków" })
  .regex(/^[A-Za-z0-9_\-.@:+]+$/, {
    message: "dozwolone: litery, cyfry, _ - . @ : +",
  });

/** Either empty string or a non-empty match — used for optional
 *  text columns where the partner often writes nothing. */
const optionalText = z.string().max(2000).optional().or(z.literal(""));

export const sessionRowSchema = z
  .object({
    external_id: externalId,
    activity_external_id: externalId,
    instructor_external_id: z
      .string()
      .max(100)
      .optional()
      .or(z.literal("")),
    starts_at: nonEmpty,
    ends_at: nonEmpty,
    capacity: z.coerce.number().int().positive(),
    spots_left: z.coerce.number().int().nonnegative().optional(),
    price_pln: z.string().min(1, { message: "wymagane" }),
    currency: z
      .string()
      .length(3, { message: "ISO-4217 (3 znaki)" })
      .default("PLN"),
    status: z
      .enum(["scheduled", "cancelled", "completed"])
      .default("scheduled"),
  })
  .refine(
    (d) => d.spots_left === undefined || d.spots_left <= d.capacity,
    { message: "spots_left > capacity", path: ["spots_left"] },
  );

export const activityRowSchema = z.object({
  external_id: externalId,
  name: nonEmpty,
  description: optionalText,
  category: z.enum([
    "fitness",
    "dance",
    "language",
    "wellness",
    "kids",
    "martial_arts",
  ]),
  duration_minutes: z.coerce.number().int().positive(),
  capacity: z.coerce.number().int().positive().optional(),
  level: z
    .enum(["beginner", "intermediate", "advanced"])
    .optional()
    .or(z.literal("")),
  language: z
    .string()
    .length(2, { message: "ISO-639-1 (2 znaki)" })
    .default("pl"),
});

export const instructorRowSchema = z.object({
  external_id: externalId,
  name: nonEmpty,
  bio: optionalText,
  photo_url: z.string().url().optional().or(z.literal("")),
});

export const pricingRowSchema = z
  .object({
    external_id: externalId,
    name: nonEmpty,
    rule_type: z.enum([
      "single",
      "pass_count",
      "pass_unlimited",
      "subscription",
    ]),
    price_pln: z.string().min(1, { message: "wymagane" }),
    pass_count: z.coerce.number().int().positive().optional(),
    validity_days: z.coerce.number().int().positive().optional(),
    /** Comma-separated activity external_ids; mappers.ts splits +
     *  trims, validator.ts FK-checks. */
    applies_to_activity_external_ids: z.string().max(2000).optional().or(z.literal("")),
  })
  .refine(
    (d) =>
      d.rule_type !== "pass_count" ||
      (typeof d.pass_count === "number" && d.pass_count > 0),
    {
      message: "pass_count wymagany dla rule_type=pass_count",
      path: ["pass_count"],
    },
  );

export type SessionRow = z.infer<typeof sessionRowSchema>;
export type ActivityRow = z.infer<typeof activityRowSchema>;
export type InstructorRow = z.infer<typeof instructorRowSchema>;
export type PricingRow = z.infer<typeof pricingRowSchema>;

export const SCHEMAS = {
  sessions: sessionRowSchema,
  activities: activityRowSchema,
  instructors: instructorRowSchema,
  pricing: pricingRowSchema,
} as const;

export type ResourceType = keyof typeof SCHEMAS;
