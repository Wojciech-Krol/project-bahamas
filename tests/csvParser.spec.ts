import { describe, it, expect } from "vitest";
import { parseCsv, extractActivityNames } from "@/src/lib/pos/adapters/csv";

describe("parseCsv", () => {
  it("parses a simple header + row", () => {
    expect(parseCsv("a,b,c\n1,2,3\n")).toEqual([
      ["a", "b", "c"],
      ["1", "2", "3"],
    ]);
  });

  it("handles quoted fields containing commas", () => {
    expect(parseCsv('name,city\n"Smith, John",Warsaw\n')).toEqual([
      ["name", "city"],
      ["Smith, John", "Warsaw"],
    ]);
  });

  it("handles doubled quotes as a literal quote", () => {
    expect(parseCsv('q\n"he said ""hi"""\n')).toEqual([
      ["q"],
      ['he said "hi"'],
    ]);
  });

  it("handles CRLF line endings", () => {
    expect(parseCsv("a,b\r\n1,2\r\n")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  it("handles newlines inside quoted fields", () => {
    expect(parseCsv('name,note\n"Ana","line1\nline2"\n')).toEqual([
      ["name", "note"],
      ["Ana", "line1\nline2"],
    ]);
  });

  it("ignores a trailing blank line", () => {
    expect(parseCsv("a\n1\n\n")).toEqual([["a"], ["1"]]);
  });

  it("strips a leading UTF-8 BOM", () => {
    // Quoting the second field exercises the "first-char-is-quote" branch
    // that was previously mis-triggered when the BOM prefixed the field.
    expect(parseCsv("﻿a,b\n1,\"2\"\n")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  it("tolerates a missing final newline", () => {
    expect(parseCsv("a,b\n1,2")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });
});

describe("extractActivityNames", () => {
  it("returns distinct non-empty activity_name values", () => {
    const rows = parseCsv(
      "activity_name,starts_at\nYoga,2026-05-01T10:00\nYoga,2026-05-02T10:00\nPilates,2026-05-01T11:00\n",
    );
    expect(extractActivityNames(rows)).toEqual(["Yoga", "Pilates"]);
  });

  it("returns [] when header lacks activity_name", () => {
    const rows = parseCsv("foo,bar\n1,2\n");
    expect(extractActivityNames(rows)).toEqual([]);
  });
});
