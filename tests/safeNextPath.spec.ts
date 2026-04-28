import { describe, expect, it } from "vitest";

import { safeNextPath } from "@/src/lib/auth/redirects";

describe("safeNextPath", () => {
  it("returns the input when it is a safe locale-relative path", () => {
    expect(safeNextPath("/pl/search", "pl")).toBe("/pl/search");
    expect(safeNextPath("/en/account", "pl")).toBe("/en/account");
  });

  it("falls back to /<locale> for missing or empty input", () => {
    expect(safeNextPath(null, "pl")).toBe("/pl");
    expect(safeNextPath(undefined, "en")).toBe("/en");
    expect(safeNextPath("", "pl")).toBe("/pl");
  });

  it("rejects external URLs", () => {
    expect(safeNextPath("https://evil.com/x", "pl")).toBe("/pl");
    expect(safeNextPath("http://evil.com/x", "pl")).toBe("/pl");
  });

  it("rejects protocol-relative URLs", () => {
    expect(safeNextPath("//evil.com/x", "pl")).toBe("/pl");
  });

  it("rejects backslash escape attempts", () => {
    expect(safeNextPath("/\\evil.com/x", "pl")).toBe("/pl");
    expect(safeNextPath("\\evil.com", "pl")).toBe("/pl");
  });

  it("rejects paths missing leading slash", () => {
    expect(safeNextPath("pl/search", "pl")).toBe("/pl");
  });

  it("preserves query strings on safe paths", () => {
    expect(safeNextPath("/pl/search?q=foo", "pl")).toBe("/pl/search?q=foo");
  });
});
