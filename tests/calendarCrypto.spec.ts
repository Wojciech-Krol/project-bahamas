import { beforeAll, describe, it, expect } from "vitest";

// Set the key BEFORE importing the module — env.ts parses on import.
const TEST_KEY = Buffer.alloc(32, 11).toString("base64");

beforeAll(() => {
  process.env.CALENDAR_ENCRYPTION_KEY = TEST_KEY;
});

describe("calendar crypto", () => {
  it("round-trips a token string through encrypt/decrypt", async () => {
    const { encryptToken, decryptToken } = await import(
      "@/src/lib/calendar/crypto"
    );
    const original = "ya29.a0ARrdaM-fake-google-token-string";
    const enc = encryptToken(original);
    expect(Buffer.isBuffer(enc)).toBe(true);
    expect(enc.byteLength).toBeGreaterThan(28);
    const back = decryptToken(enc);
    expect(back).toBe(original);
  });

  it("rejects tampered ciphertext via GCM auth tag", async () => {
    const { encryptToken, decryptToken } = await import(
      "@/src/lib/calendar/crypto"
    );
    const enc = Buffer.from(encryptToken("secret-refresh-token"));
    enc[enc.length - 1] ^= 0x01;
    expect(() => decryptToken(enc)).toThrow();
  });

  it("encryptedTokenToPostgres yields a PostgREST-friendly hex literal", async () => {
    const {
      encryptToken,
      decryptToken,
      encryptedTokenToPostgres,
    } = await import("@/src/lib/calendar/crypto");
    const original = "1//0gabc-refresh-xyz";
    const enc = encryptToken(original);
    const wire = encryptedTokenToPostgres(enc);
    expect(wire.startsWith("\\x")).toBe(true);
    expect(wire.slice(2)).toMatch(/^[0-9a-f]+$/);
    expect(wire.length).toBe(2 + enc.byteLength * 2);
    expect(decryptToken(wire)).toBe(original);
  });
});
