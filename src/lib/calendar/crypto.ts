/**
 * Calendar OAuth token encryption — aes-256-gcm, server-only.
 *
 * Used for the `user_calendar_integrations` access_token /
 * refresh_token columns. Encryption shape and rotation story mirror
 * `src/lib/pos/crypto.ts` exactly:
 *
 *     [iv(12)][tag(16)][ciphertext(N)]
 *
 * The key is read from `CALENDAR_ENCRYPTION_KEY` (base64-encoded
 * 32 bytes). Generate with `openssl rand -base64 32`.
 *
 * Server-only — never import from a client component.
 */

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  type CipherGCM,
  type DecipherGCM,
} from "node:crypto";

import { env } from "@/src/env";

const ALGO = "aes-256-gcm" as const;
const IV_BYTES = 12;
const TAG_BYTES = 16;
const KEY_BYTES = 32;

type ServerEnv = typeof env & { CALENDAR_ENCRYPTION_KEY?: string };

function readKey(): Buffer {
  const serverEnv = env as ServerEnv;
  const raw = serverEnv.CALENDAR_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "CALENDAR_ENCRYPTION_KEY is not set. Generate a 32-byte key with " +
        "`openssl rand -base64 32` and add it to .env.local (server-only).",
    );
  }
  const normalised = raw.replace(/-/g, "+").replace(/_/g, "/");
  const key = Buffer.from(normalised, "base64");
  if (key.length !== KEY_BYTES) {
    throw new Error(
      `CALENDAR_ENCRYPTION_KEY must decode to ${KEY_BYTES} bytes, got ` +
        `${key.length}. Regenerate with \`openssl rand -base64 32\`.`,
    );
  }
  return key;
}

export function encryptToken(plain: string): Buffer {
  const key = readKey();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGO, key, iv) as CipherGCM;
  const ciphertext = Buffer.concat([
    cipher.update(plain, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]);
}

export function encryptedTokenToPostgres(buf: Buffer): string {
  return "\\x" + buf.toString("hex");
}

export function decryptToken(buf: Buffer | Uint8Array | string): string {
  const key = readKey();
  const payload = coerceBuffer(buf);
  if (payload.length < IV_BYTES + TAG_BYTES + 1) {
    throw new Error("Calendar token ciphertext is too short.");
  }
  const iv = payload.subarray(0, IV_BYTES);
  const tag = payload.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
  const ciphertext = payload.subarray(IV_BYTES + TAG_BYTES);
  const decipher = createDecipheriv(ALGO, key, iv) as DecipherGCM;
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plain.toString("utf8");
}

function coerceBuffer(buf: Buffer | Uint8Array | string): Buffer {
  if (Buffer.isBuffer(buf)) return buf;
  if (buf instanceof Uint8Array) return Buffer.from(buf);
  if (buf.startsWith("\\x")) return Buffer.from(buf.slice(2), "hex");
  return Buffer.from(buf, "base64");
}
