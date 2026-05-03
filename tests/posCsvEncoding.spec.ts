import { describe, expect, it } from "vitest";

import { decodeCsv, detectEncoding } from "@/src/lib/pos/csv/encoding";

describe("detectEncoding", () => {
  it("detects UTF-8 BOM", () => {
    const buf = Buffer.from([0xef, 0xbb, 0xbf, 0x61]);
    expect(detectEncoding(buf)).toBe("utf-8-bom");
  });

  it("detects clean UTF-8 (Polish text)", () => {
    const buf = Buffer.from("Joga z Anią — wtorek", "utf8");
    expect(detectEncoding(buf)).toBe("utf-8");
  });

  it("detects Windows-1250 from polish-byte heuristic", () => {
    // Polish chars Ł=0xA3, ą=0xB9, ę=0xEA in Windows-1250.
    const buf = Buffer.from([0xa3, 0x4f, 0xb9, 0x4b, 0xea]);
    expect(detectEncoding(buf)).toBe("windows-1250");
  });

  it("decodeCsv strips the BOM", () => {
    const buf = Buffer.from([0xef, 0xbb, 0xbf, 0x61, 0x2c, 0x62]);
    const out = decodeCsv(buf);
    expect(out.encoding).toBe("utf-8-bom");
    expect(out.text).toBe("a,b");
  });

  it("decodeCsv windows-1250 → readable Polish", () => {
    // "Łąka" in Win-1250: 0xA3 0xB9 0x6B 0x61
    const buf = Buffer.from([0xa3, 0xb9, 0x6b, 0x61]);
    const out = decodeCsv(buf);
    expect(out.encoding).toBe("windows-1250");
    expect(out.text).toBe("Łąka");
  });
});
