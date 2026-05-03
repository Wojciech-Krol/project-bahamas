/**
 * Encoding detection — heuristic, no external dep.
 *
 * Polish POS exports tend to be one of:
 *   - UTF-8 (modern systems)
 *   - UTF-8 with BOM (Excel "save as CSV UTF-8")
 *   - Windows-1250 (legacy desktop tools)
 *   - ISO-8859-2 (rare, treat same as Win-1250 for our charset)
 *
 * Strategy:
 *   1. BOM (\xEF \xBB \xBF) → utf-8
 *   2. Try strict UTF-8 decode. Success = utf-8.
 *   3. Otherwise count Polish high bytes (\x8C \x9C \xB1 \xE6 etc).
 *      Many = windows-1250. Fallback = utf-8 with replacement chars
 *      (better than throwing — caller's per-row Zod validate will
 *      flag rows that came out as gibberish).
 */

export type DetectedEncoding =
  | "utf-8"
  | "utf-8-bom"
  | "windows-1250"
  | "iso-8859-2";

export function detectEncoding(buf: Buffer | Uint8Array): DetectedEncoding {
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);

  if (
    b.length >= 3 &&
    b[0] === 0xef &&
    b[1] === 0xbb &&
    b[2] === 0xbf
  ) {
    return "utf-8-bom";
  }

  if (isStrictUtf8(b)) return "utf-8";

  // Heuristic: count bytes that are valid Polish glyphs in
  // Windows-1250 (the Polish-specific block). High hit rate = the
  // file was written by a legacy tool with a Polish locale.
  const winHits = countWin1250PolishBytes(b);
  if (winHits > 0) return "windows-1250";

  // Last-resort default — decoding as utf-8 with replacement
  // characters lets the Zod validators surface bad rows individually
  // rather than blowing up the whole import.
  return "utf-8";
}

/**
 * Strict UTF-8 validity check. Returns false on the first invalid
 * sequence. Mirrors the WHATWG decoder's strict mode without the
 * TextDecoder allocation.
 */
function isStrictUtf8(b: Buffer): boolean {
  let i = 0;
  const n = b.length;
  while (i < n) {
    const byte = b[i];
    if (byte <= 0x7f) {
      i += 1;
      continue;
    }
    let extra: number;
    let min: number;
    if ((byte & 0xe0) === 0xc0) {
      extra = 1;
      min = 0x80;
    } else if ((byte & 0xf0) === 0xe0) {
      extra = 2;
      min = 0x800;
    } else if ((byte & 0xf8) === 0xf0) {
      extra = 3;
      min = 0x10000;
    } else {
      return false;
    }
    if (i + extra >= n) return false;
    let codepoint = byte & ((1 << (6 - extra)) - 1);
    for (let k = 1; k <= extra; k += 1) {
      const c = b[i + k];
      if ((c & 0xc0) !== 0x80) return false;
      codepoint = (codepoint << 6) | (c & 0x3f);
    }
    if (codepoint < min) return false;
    if (codepoint >= 0xd800 && codepoint <= 0xdfff) return false;
    if (codepoint > 0x10ffff) return false;
    i += extra + 1;
  }
  return true;
}

const WIN1250_POLISH_BYTES = new Set<number>([
  0x8c, // Ś
  0x8f, // Ź
  0x9c, // ś
  0x9f, // ź
  0xa3, // Ł
  0xa5, // Ą
  0xaf, // Ż
  0xb3, // ł
  0xb9, // ą
  0xbf, // ż
  0xc6, // Ć
  0xca, // Ę
  0xd1, // Ń
  0xd3, // Ó
  0xe6, // ć
  0xea, // ę
  0xf1, // ń
  0xf3, // ó
]);

function countWin1250PolishBytes(b: Buffer): number {
  let hits = 0;
  // Sample at most first 32KB — header + a few hundred rows is
  // plenty to get a confident verdict, and CSVs can be megabytes.
  const max = Math.min(b.length, 32 * 1024);
  for (let i = 0; i < max; i += 1) {
    if (WIN1250_POLISH_BYTES.has(b[i])) hits += 1;
  }
  return hits;
}

/**
 * Decode raw bytes to a string using the detected encoding. BOM is
 * stripped on the way out so downstream parsers don't need to know.
 */
export function decode(buf: Buffer | Uint8Array, encoding: DetectedEncoding): string {
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);

  if (encoding === "utf-8") return b.toString("utf8");
  if (encoding === "utf-8-bom") return b.subarray(3).toString("utf8");

  // Node's built-in TextDecoder supports windows-1250 + iso-8859-2.
  const decoder = new TextDecoder(encoding, { fatal: false });
  return decoder.decode(b);
}

/** Convenience — detect + decode in one call. */
export function decodeCsv(buf: Buffer | Uint8Array): {
  text: string;
  encoding: DetectedEncoding;
} {
  const encoding = detectEncoding(buf);
  return { text: decode(buf, encoding), encoding };
}
