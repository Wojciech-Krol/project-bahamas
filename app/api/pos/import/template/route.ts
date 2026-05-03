/**
 * GET /api/pos/import/template?resource={sessions|activities|instructors|pricing}
 *
 * Returns the header-only CSV template for one resource. Public —
 * no auth required (templates are static).
 */

import { NextResponse, type NextRequest } from "next/server";

import { csvTemplate } from "@/src/lib/pos/csv/templates";
import type { ResourceType } from "@/src/lib/pos/csv/schema";

const VALID: ReadonlyArray<ResourceType> = [
  "sessions",
  "activities",
  "instructors",
  "pricing",
];

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const resource = req.nextUrl.searchParams.get("resource");
  if (!resource || !VALID.includes(resource as ResourceType)) {
    return NextResponse.json({ error: "bad_resource" }, { status: 400 });
  }
  const csv = csvTemplate(resource as ResourceType);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${resource}-template.csv"`,
      "cache-control": "public, max-age=3600",
    },
  });
}
