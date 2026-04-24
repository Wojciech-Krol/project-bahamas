/**
 * POS config encryption — aes-256-gcm, server-only.
 *
 * Every `pos_integrations.config_encrypted` value is a binary blob shaped as:
 *
 *     ┌──── 12 bytes ────┬──── 16 bytes ────┬──── N bytes ────┐
 *     │        IV        │    auth tag      │   ciphertext    │
 *     └──────────────────┴──────────────────┴─────────────────┘
 *
 * The key is read from `POS_CONFIG_ENCRYPTION_KEY` (base64-encoded 32 bytes).
 *
 * Rotation story:
 *   The key is *only* needed to decrypt existing rows. If you change
 *   POS_CONFIG_ENCRYPTION_KEY:
 *     1. Rows written with the old key become unreadable — the GCM auth tag
 *        check fails and `decryptConfig()` throws.
 *     2. To rotate safely, run a one-off script that (a) decrypts with the
 *        old key, (b) re-encrypts with the new key, (c) overwrites the row.
 *        Keep the old key available for the duration of the rollout.
 *     3. There is no automatic re-keying — partners would otherwise need to
 *        re-enter credentials after every key change.
 *
 * This module is server-only. Never import from a client component; the key
 * would end up in the browser bundle.
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
const IV_BYTES = 12; // NIST-recommended length for GCM
const TAG_BYTES = 16; // aes-gcm tag is always 16 bytes
const KEY_BYTES = 32; // aes-256 → 256-bit key

type ServerEnv = typeof env & { POS_CONFIG_ENCRYPTION_KEY?: string };

function readKey(): Buffer {
  const serverEnv = env as ServerEnv;
  const raw = serverEnv.POS_CONFIG_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "POS_CONFIG_ENCRYPTION_KEY is not set. Generate a 32-byte key with " +
        "`openssl rand -base64 32` and add it to .env.local (server-only).",
    );
  }

  // Support both plain base64 and base64url just in case ops pipes through a
  // URL-safe variant. Node accepts both via Buffer.from(raw, 'base64') for
  // standard base64; base64url is normalised first.
  const normalised = raw.replace(/-/g, "+").replace(/_/g, "/");
  const key = Buffer.from(normalised, "base64");

  if (key.length !== KEY_BYTES) {
    throw new Error(
      `POS_CONFIG_ENCRYPTION_KEY must decode to ${KEY_BYTES} bytes, got ` +
        `${key.length}. Regenerate with \`openssl rand -base64 32\`.`,
    );
  }

  return key;
}

/**
 * Serialize the plain config object as JSON and encrypt it.
 *
 * Returns a single Buffer ready to write straight into the `bytea` column:
 * `[iv(12)][tag(16)][ciphertext(N)]`.
 */
export function encryptConfig(plain: Record<string, unknown>): Buffer {
  const key = readKey();
  const iv = randomBytes(IV_BYTES);

  const cipher = createCipheriv(ALGO, key, iv) as CipherGCM;
  const json = JSON.stringify(plain);
  const ciphertext = Buffer.concat([
    cipher.update(json, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, ciphertext]);
}

/**
 * Reverse of `encryptConfig`. Accepts anything that Supabase hands back for
 * a bytea column (Buffer, Uint8Array, or the `\x…` hex string when the JS
 * client is configured in `bytea_output=hex` mode).
 */
export function decryptConfig(buf: Buffer | Uint8Array | string): Record<string, unknown> {
  const key = readKey();
  const payload = coerceBuffer(buf);

  if (payload.length < IV_BYTES + TAG_BYTES + 1) {
    throw new Error(
      "POS config ciphertext is too short — expected at least " +
        `${IV_BYTES + TAG_BYTES + 1} bytes, got ${payload.length}.`,
    );
  }

  const iv = payload.subarray(0, IV_BYTES);
  const tag = payload.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
  const ciphertext = payload.subarray(IV_BYTES + TAG_BYTES);

  const decipher = createDecipheriv(ALGO, key, iv) as DecipherGCM;
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

  return JSON.parse(plain.toString("utf8"));
}

function coerceBuffer(buf: Buffer | Uint8Array | string): Buffer {
  if (Buffer.isBuffer(buf)) return buf;
  if (buf instanceof Uint8Array) return Buffer.from(buf);
  // PostgREST returns bytea as `\x…` hex (default) or base64 depending on
  // server settings. Handle the hex form defensively.
  if (typeof buf === "string") {
    if (buf.startsWith("\\x") || buf.startsWith("\\X")) {
      return Buffer.from(buf.slice(2), "hex");
    }
    // Fall through to base64 — the only other realistic shape a string could
    // take in this codepath.
    return Buffer.from(buf, "base64");
  }
  throw new Error("Unsupported payload shape for decryptConfig.");
}

/**
 * True if the operator has configured a key. Pages / cron routes use this to
 * degrade gracefully when the key is missing — see integrations page and
 * `/api/cron/pos-sync` for the two entry points.
 */
export function isPosCryptoConfigured(): boolean {
  const serverEnv = env as ServerEnv;
  return Boolean(serverEnv.POS_CONFIG_ENCRYPTION_KEY);
}
