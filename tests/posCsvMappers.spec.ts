import { describe, expect, it } from "vitest";

import {
  mapActivityRow,
  mapInstructorRow,
  mapPricingRow,
  mapSessionRow,
  parsePriceMinor,
  parseTimestamp,
  PriceParseError,
  TimestampDstGapError,
  TimestampParseError,
} from "@/src/lib/pos/csv/mappers";

describe("parsePriceMinor", () => {
  it("parses dot-decimal", () => {
    expect(parsePriceMinor("50.00")).toBe(5000);
    expect(parsePriceMinor("12.5")).toBe(1250);
    expect(parsePriceMinor("12")).toBe(1200);
  });

  it("parses comma-decimal", () => {
    expect(parsePriceMinor("50,00")).toBe(5000);
    expect(parsePriceMinor("12,5")).toBe(1250);
  });

  it("strips currency hints", () => {
    expect(parsePriceMinor("50,00 zł")).toBe(5000);
    expect(parsePriceMinor("PLN 12.50")).toBe(1250);
    expect(parsePriceMinor("€19.99")).toBe(1999);
  });

  it("strips thousands separator (NBSP, regular space)", () => {
    expect(parsePriceMinor("1 234,50")).toBe(123450);
    expect(parsePriceMinor("1 234,50")).toBe(123450);
  });

  it("throws on garbage", () => {
    expect(() => parsePriceMinor("abc")).toThrow(PriceParseError);
    expect(() => parsePriceMinor("")).toThrow(PriceParseError);
  });
});

describe("parseTimestamp", () => {
  it("parses ISO with explicit Z offset", () => {
    const d = parseTimestamp("2026-05-15T16:00:00Z");
    expect(d.toISOString()).toBe("2026-05-15T16:00:00.000Z");
  });

  it("parses naive ISO as Europe/Warsaw local", () => {
    // 2026-05-15 18:00 Europe/Warsaw (CEST = +02:00) → 16:00 UTC
    const d = parseTimestamp("2026-05-15 18:00");
    expect(d.toISOString()).toBe("2026-05-15T16:00:00.000Z");
  });

  it("parses Polish DD.MM.YYYY HH:MM", () => {
    const d = parseTimestamp("15.05.2026 18:00");
    expect(d.toISOString()).toBe("2026-05-15T16:00:00.000Z");
  });

  it("parses with seconds", () => {
    const d = parseTimestamp("2026-05-15 18:00:30");
    expect(d.toISOString()).toBe("2026-05-15T16:00:30.000Z");
  });

  it("throws on DST gap (2026-03-29 02:30 Europe/Warsaw)", () => {
    expect(() => parseTimestamp("2026-03-29 02:30")).toThrow(
      TimestampDstGapError,
    );
  });

  it("throws on garbage", () => {
    expect(() => parseTimestamp("not-a-date")).toThrow(TimestampParseError);
  });

  it("rejects field-level invalid (Feb 30)", () => {
    expect(() => parseTimestamp("30.02.2026 10:00")).toThrow(
      TimestampParseError,
    );
  });
});

describe("mapSessionRow", () => {
  it("converts a happy row", () => {
    const out = mapSessionRow({
      external_id: "SES-001",
      activity_external_id: "CLS-yoga",
      instructor_external_id: "INS-anna",
      starts_at: "2026-05-15 18:00",
      ends_at: "2026-05-15 19:00",
      capacity: 12,
      spots_left: 8,
      price_pln: "50,00",
      currency: "PLN",
      status: "scheduled",
    });
    expect(out.externalId).toBe("SES-001");
    expect(out.classExternalId).toBe("CLS-yoga");
    expect(out.instructorExternalId).toBe("INS-anna");
    expect(out.startsAt.toISOString()).toBe("2026-05-15T16:00:00.000Z");
    expect(out.endsAt.toISOString()).toBe("2026-05-15T17:00:00.000Z");
    expect(out.capacity).toBe(12);
    expect(out.spotsLeft).toBe(8);
    expect(out.price).toEqual({ amountMinor: 5000, currency: "PLN" });
    expect(out.status).toBe("scheduled");
  });

  it("defaults spotsLeft to capacity when omitted", () => {
    const out = mapSessionRow({
      external_id: "SES-002",
      activity_external_id: "CLS-yoga",
      instructor_external_id: "",
      starts_at: "2026-05-15 18:00",
      ends_at: "2026-05-15 19:00",
      capacity: 10,
      price_pln: "50",
      currency: "PLN",
      status: "scheduled",
    });
    expect(out.spotsLeft).toBe(10);
    expect(out.instructorExternalId).toBeUndefined();
  });
});

describe("mapActivityRow / mapInstructorRow / mapPricingRow", () => {
  it("activity happy path", () => {
    const out = mapActivityRow({
      external_id: "CLS-yoga",
      name: "Yoga Flow",
      description: "Vinyasa",
      category: "wellness",
      duration_minutes: 60,
      capacity: 12,
      level: "intermediate",
      language: "pl",
    });
    expect(out.externalId).toBe("CLS-yoga");
    expect(out.category).toBe("wellness");
    expect(out.durationMinutes).toBe(60);
    expect(out.level).toBe("intermediate");
  });

  it("activity without optional level/description", () => {
    const out = mapActivityRow({
      external_id: "CLS-x",
      name: "X",
      description: "",
      category: "fitness",
      duration_minutes: 45,
      level: "",
      language: "pl",
    });
    expect(out.level).toBeUndefined();
    expect(out.description).toBeUndefined();
  });

  it("instructor without bio/photo", () => {
    const out = mapInstructorRow({
      external_id: "INS-1",
      name: "Anna",
      bio: "",
      photo_url: "",
    });
    expect(out.bio).toBeUndefined();
    expect(out.photoUrl).toBeUndefined();
  });

  it("pricing pass_count splits applies-to csv", () => {
    const out = mapPricingRow({
      external_id: "PRC-10",
      name: "Karnet 10",
      rule_type: "pass_count",
      price_pln: "400,00",
      pass_count: 10,
      validity_days: 90,
      applies_to_activity_external_ids: "CLS-yoga, CLS-yin",
    });
    expect(out.ruleType).toBe("pass_count");
    expect(out.passCount).toBe(10);
    expect(out.appliesToClassExternalIds).toEqual(["CLS-yoga", "CLS-yin"]);
    expect(out.price).toEqual({ amountMinor: 40000, currency: "PLN" });
  });
});
