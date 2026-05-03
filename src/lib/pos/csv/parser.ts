/**
 * RFC-4180-ish CSV parser. Pure function, no dependencies.
 *
 * Returns rows as `string[][]`. Header parsing + Zod validation
 * live in `mappers.ts` / `schema.ts`.
 *
 * Correctness:
 *   - quoted fields support `""` as a literal `"` escape
 *   - fields may span lines inside quotes
 *   - delimiter = `,`; record separator = LF, CRLF, or bare CR
 *   - leading BOM stripped on the first character
 *   - blank lines (zero non-empty fields) dropped silently
 *   - any character after a closing quote and before delimiter / EOL
 *     becomes part of the next unquoted continuation, which the
 *     validator will catch as a column-count mismatch
 */

export type ParsedCsv = {
  rows: string[][];
  /** 1-indexed row numbers in the source that were skipped because
   *  they were entirely blank. Useful when the caller wants their
   *  own row counter to align with the source file. */
  blankRowNumbers: number[];
};

export function parseCsv(input: string): ParsedCsv {
  // strip utf-8 BOM
  if (input.charCodeAt(0) === 0xfeff) {
    input = input.slice(1);
  }

  const rows: string[][] = [];
  const blankRowNumbers: number[] = [];
  let field = "";
  let row: string[] = [];
  let quoted = false;
  let sourceLine = 1;
  let i = 0;
  const n = input.length;

  function flushRow(): void {
    row.push(field);
    field = "";
    if (rowIsNotEmpty(row)) {
      rows.push(row);
    } else {
      blankRowNumbers.push(sourceLine);
    }
    row = [];
  }

  while (i < n) {
    const ch = input[i];

    if (quoted) {
      if (ch === '"') {
        if (i + 1 < n && input[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        quoted = false;
        i += 1;
        continue;
      }
      if (ch === "\n") sourceLine += 1;
      field += ch;
      i += 1;
      continue;
    }

    if (ch === '"' && field.length === 0) {
      quoted = true;
      i += 1;
      continue;
    }

    if (ch === ",") {
      row.push(field);
      field = "";
      i += 1;
      continue;
    }

    if (ch === "\r") {
      i += 1;
      if (i >= n || input[i] !== "\n") {
        flushRow();
        sourceLine += 1;
      }
      continue;
    }

    if (ch === "\n") {
      flushRow();
      sourceLine += 1;
      i += 1;
      continue;
    }

    field += ch;
    i += 1;
  }

  if (field.length > 0 || row.length > 0) {
    flushRow();
  }

  return { rows, blankRowNumbers };
}

function rowIsNotEmpty(row: string[]): boolean {
  if (row.length === 0) return false;
  if (row.length === 1 && row[0] === "") return false;
  return true;
}

/** Lowercased trimmed header → column index. Tolerates header
 *  whitespace so partners pasting from Excel don't have to scrub. */
export function indexHeader(header: string[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (let i = 0; i < header.length; i += 1) {
    map[header[i].trim().toLowerCase()] = i;
  }
  return map;
}

/** Read a column safely with a default. Returns trimmed value or the
 *  fallback when the column index isn't present in the header. */
export function readCol(
  row: string[],
  idx: Record<string, number>,
  name: string,
  fallback = "",
): string {
  const i = idx[name];
  if (i === undefined) return fallback;
  return (row[i] ?? "").trim();
}
