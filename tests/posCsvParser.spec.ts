import { describe, expect, it } from "vitest";

import { indexHeader, parseCsv, readCol } from "@/src/lib/pos/csv/parser";

describe("parseCsv", () => {
  it("parses a simple file with header + two rows", () => {
    const out = parseCsv("name,age\nAlice,30\nBob,25\n");
    expect(out.rows).toEqual([
      ["name", "age"],
      ["Alice", "30"],
      ["Bob", "25"],
    ]);
    expect(out.blankRowNumbers).toEqual([]);
  });

  it("handles CRLF line endings", () => {
    const out = parseCsv("a,b\r\n1,2\r\n");
    expect(out.rows).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  it("strips UTF-8 BOM", () => {
    const out = parseCsv("﻿a,b\n1,2\n");
    expect(out.rows[0]).toEqual(["a", "b"]);
  });

  it("supports quoted fields with embedded commas", () => {
    const out = parseCsv('a,b\n"hello, world",2\n');
    expect(out.rows[1]).toEqual(["hello, world", "2"]);
  });

  it("supports doubled quotes as a literal quote", () => {
    const out = parseCsv('a\n"she said ""hi"""\n');
    expect(out.rows[1]).toEqual(['she said "hi"']);
  });

  it("supports newlines inside quoted fields", () => {
    const out = parseCsv('a,b\n"line1\nline2",2\n');
    expect(out.rows[1]).toEqual(["line1\nline2", "2"]);
  });

  it("drops blank rows but tracks their source line numbers", () => {
    const out = parseCsv("a\nx\n\ny\n");
    expect(out.rows).toEqual([["a"], ["x"], ["y"]]);
    expect(out.blankRowNumbers).toEqual([3]);
  });

  it("flushes a trailing field when no final newline", () => {
    const out = parseCsv("a,b\n1,2");
    expect(out.rows[1]).toEqual(["1", "2"]);
  });
});

describe("indexHeader / readCol", () => {
  it("indexes case-insensitively + trimmed", () => {
    const idx = indexHeader([" Name ", "AGE", "City"]);
    expect(idx).toEqual({ name: 0, age: 1, city: 2 });
  });

  it("readCol returns trimmed value", () => {
    const idx = indexHeader(["a", "b"]);
    expect(readCol(["  hi  ", "x"], idx, "a")).toBe("hi");
  });

  it("readCol returns fallback when column missing", () => {
    const idx = indexHeader(["a"]);
    expect(readCol(["x"], idx, "missing", "default")).toBe("default");
  });
});
