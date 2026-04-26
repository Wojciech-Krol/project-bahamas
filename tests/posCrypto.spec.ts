import { beforeAll, describe, it, expect } from "vitest";

// Set the key BEFORE importing the module — env.ts parses on import.
const TEST_KEY = Buffer.alloc(32, 7).toString("base64"); // deterministic 32-byte key

beforeAll(() => {
  process.env.POS_CONFIG_ENCRYPTION_KEY = TEST_KEY;
});

describe("pos crypto", () => {
  it("round-trips a JSON config through encrypt/decrypt", async () => {
    const { encryptConfig, decryptConfig } = await import("@/src/lib/pos/crypto");
    const original = { foo: "bar", n: 42, nested: { a: [1, 2, 3] } };
    const enc = encryptConfig(original);
    expect(Buffer.isBuffer(enc)).toBe(true);
    // 12-byte IV + 16-byte tag + N ciphertext bytes — must be > 28 for any
    // non-empty plaintext.
    expect(enc.byteLength).toBeGreaterThan(28);
    const back = decryptConfig(enc);
    expect(back).toEqual(original);
  });

  it("rejects tampered ciphertext via GCM auth tag", async () => {
    const { encryptConfig, decryptConfig } = await import("@/src/lib/pos/crypto");
    const enc = Buffer.from(encryptConfig({ secret: "shh" }));
    // Flip a bit in the ciphertext portion (past IV + tag).
    enc[enc.length - 1] ^= 0x01;
    expect(() => decryptConfig(enc)).toThrow();
  });

  it("encryptedConfigToPostgres yields PostgREST-friendly hex literal", async () => {
    const { encryptConfig, decryptConfig, encryptedConfigToPostgres } =
      await import("@/src/lib/pos/crypto");
    const original = { token: "abc123", venue: "studio-x" };
    const enc = encryptConfig(original);
    const wire = encryptedConfigToPostgres(enc);
    // Shape: \x followed by lowercase hex, length = 2 * byte length.
    expect(wire.startsWith("\\x")).toBe(true);
    expect(wire.slice(2)).toMatch(/^[0-9a-f]+$/);
    expect(wire.length).toBe(2 + enc.byteLength * 2);
    // The decryptConfig string path already accepts the same shape — round
    // trip through the wire format proves end-to-end compatibility.
    expect(decryptConfig(wire)).toEqual(original);
  });
});
