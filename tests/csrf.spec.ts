import { describe, expect, it } from "vitest";

import { isSameOriginRequest } from "@/src/lib/auth/csrf";

function req(headers: Record<string, string>): Request {
  return new Request("https://hakuna.app/api/x", {
    method: "POST",
    headers,
  });
}

describe("isSameOriginRequest", () => {
  it("trusts Sec-Fetch-Site: same-origin", () => {
    expect(isSameOriginRequest(req({ "sec-fetch-site": "same-origin" }))).toBe(
      true,
    );
  });

  it("trusts Sec-Fetch-Site: same-site", () => {
    expect(isSameOriginRequest(req({ "sec-fetch-site": "same-site" }))).toBe(
      true,
    );
  });

  it("trusts Sec-Fetch-Site: none (top-level nav)", () => {
    expect(isSameOriginRequest(req({ "sec-fetch-site": "none" }))).toBe(true);
  });

  it("rejects Sec-Fetch-Site: cross-site", () => {
    expect(isSameOriginRequest(req({ "sec-fetch-site": "cross-site" }))).toBe(
      false,
    );
  });

  it("falls back to Origin matching when Sec-Fetch-Site missing", () => {
    expect(
      isSameOriginRequest(
        req({ origin: "https://hakuna.app", host: "hakuna.app" }),
      ),
    ).toBe(true);
  });

  it("rejects mismatched Origin", () => {
    expect(
      isSameOriginRequest(
        req({ origin: "https://evil.com", host: "hakuna.app" }),
      ),
    ).toBe(false);
  });

  it("rejects when Origin missing and Sec-Fetch-Site missing", () => {
    // Old browsers without sec-fetch-site AND without origin (unusual) →
    // be conservative and reject so attackers can't strip headers.
    expect(isSameOriginRequest(req({ host: "hakuna.app" }))).toBe(false);
  });

  it("respects x-forwarded-host (Vercel/proxy case)", () => {
    expect(
      isSameOriginRequest(
        req({
          origin: "https://hakuna.app",
          "x-forwarded-host": "hakuna.app",
          host: "internal-vercel.app",
        }),
      ),
    ).toBe(true);
  });
});
