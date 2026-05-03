import { describe, expect, it } from "vitest";

import {
  externalIdSet,
  findDuplicateExternalIds,
  validateBatch,
  validatePricingFks,
  validateSessionFks,
} from "@/src/lib/pos/csv/validator";

const session = (id: string, classId: string, instructorId = "") => ({
  external_id: id,
  activity_external_id: classId,
  instructor_external_id: instructorId,
  starts_at: "2026-05-15 18:00",
  ends_at: "2026-05-15 19:00",
  capacity: 10,
  spots_left: undefined as number | undefined,
  price_pln: "50",
  currency: "PLN",
  status: "scheduled" as const,
});

describe("findDuplicateExternalIds", () => {
  it("flags second + later occurrences, points to first", () => {
    const errors = findDuplicateExternalIds([
      { row: { external_id: "A" }, rowNumber: 2 },
      { row: { external_id: "B" }, rowNumber: 3 },
      { row: { external_id: "A" }, rowNumber: 4 },
      { row: { external_id: "A" }, rowNumber: 5 },
    ]);
    expect(errors).toHaveLength(2);
    expect(errors[0].rowNumber).toBe(4);
    expect(errors[0].message).toContain("wierszu 2");
    expect(errors[1].rowNumber).toBe(5);
  });

  it("clean batch returns zero errors", () => {
    const errors = findDuplicateExternalIds([
      { row: { external_id: "A" }, rowNumber: 2 },
      { row: { external_id: "B" }, rowNumber: 3 },
    ]);
    expect(errors).toEqual([]);
  });
});

describe("validateSessionFks", () => {
  it("flags missing activity FK", () => {
    const errors = validateSessionFks(
      [{ row: session("SES-1", "CLS-missing"), rowNumber: 2 }],
      new Set(["CLS-yoga"]),
      new Set(),
    );
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("activity_external_id");
    expect(errors[0].code).toBe("FK_MISSING");
  });

  it("flags missing instructor FK", () => {
    const errors = validateSessionFks(
      [{ row: session("SES-1", "CLS-yoga", "INS-missing"), rowNumber: 2 }],
      new Set(["CLS-yoga"]),
      new Set(["INS-known"]),
    );
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("instructor_external_id");
  });

  it("clean batch returns zero errors", () => {
    const errors = validateSessionFks(
      [
        { row: session("SES-1", "CLS-yoga", "INS-anna"), rowNumber: 2 },
        { row: session("SES-2", "CLS-yoga"), rowNumber: 3 },
      ],
      new Set(["CLS-yoga"]),
      new Set(["INS-anna"]),
    );
    expect(errors).toEqual([]);
  });
});

describe("validatePricingFks", () => {
  it("flags pricing referencing missing activity", () => {
    const errors = validatePricingFks(
      [
        {
          row: {
            external_id: "PRC-1",
            name: "x",
            rule_type: "pass_unlimited" as const,
            price_pln: "100",
            applies_to_activity_external_ids: "CLS-yoga, CLS-missing",
          },
          rowNumber: 2,
        },
      ],
      new Set(["CLS-yoga"]),
    );
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain("CLS-missing");
  });

  it("empty applies_to = no FK check", () => {
    const errors = validatePricingFks(
      [
        {
          row: {
            external_id: "PRC-1",
            name: "x",
            rule_type: "single" as const,
            price_pln: "50",
            applies_to_activity_external_ids: "",
          },
          rowNumber: 2,
        },
      ],
      new Set(),
    );
    expect(errors).toEqual([]);
  });
});

describe("externalIdSet + validateBatch", () => {
  it("extracts external id sets", () => {
    expect(
      externalIdSet([
        { row: { external_id: "A" }, rowNumber: 2 },
        { row: { external_id: "B" }, rowNumber: 3 },
      ]),
    ).toEqual(new Set(["A", "B"]));
  });

  it("knownActivityIds satisfies session FKs without an activities CSV", () => {
    const errors = validateBatch({
      sessions: [{ row: session("SES-1", "CLS-yoga"), rowNumber: 2 }],
      activities: [],
      instructors: [],
      pricing: [],
      knownActivityIds: new Set(["CLS-yoga"]),
    });
    expect(errors).toEqual([]);
  });
});
