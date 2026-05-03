/**
 * POST /api/pos/import
 *
 * Partner uploads a CSV file via multipart/form-data; this route
 * stores the file in the `pos-uploads` Supabase Storage bucket and
 * runs the canonical import pipeline (see src/lib/pos/importJobs.ts).
 *
 * Auth: caller must be a partner_member of the targeted partner OR
 * an admin. We rely on Supabase auth via the request-scoped client;
 * the orchestrator uses the service-role admin client internally.
 *
 * Request:
 *   FormData {
 *     partnerId:    uuid,
 *     resourceType: "sessions" | "activities" | "instructors" | "pricing",
 *     file:         File (CSV)
 *   }
 *
 * Response: ImportJobResult JSON.
 */

import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@/src/lib/db/admin";
import { createClient, getCurrentUser } from "@/src/lib/db/server";
import { processCsvImport } from "@/src/lib/pos/importJobs";
import type { ResourceType } from "@/src/lib/pos/csv/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_RESOURCES: ReadonlyArray<ResourceType> = [
  "sessions",
  "activities",
  "instructors",
  "pricing",
];

const STORAGE_BUCKET = "pos-uploads";
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB — generous for CSV

export async function POST(req: NextRequest) {
  const current = await getCurrentUser();
  if (!current) {
    return NextResponse.json({ error: "not_signed_in" }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "bad_form" }, { status: 400 });
  }

  const partnerId = String(form.get("partnerId") ?? "");
  const resourceType = String(form.get("resourceType") ?? "");
  const file = form.get("file");

  if (!partnerId || !VALID_RESOURCES.includes(resourceType as ResourceType)) {
    return NextResponse.json(
      { error: "bad_input", message: "partnerId + resourceType required" },
      { status: 400 },
    );
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "no_file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "too_large" }, { status: 413 });
  }

  // Authorization: caller must be a member of the target partner.
  const supabase = await createClient();
  const { data: membership } = await supabase
    .from("partner_members")
    .select("user_id")
    .eq("partner_id", partnerId)
    .eq("user_id", current.user.id)
    .maybeSingle();

  const isAdmin =
    (current.profile?.role as string | undefined) === "admin";
  if (!membership && !isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const buf = Buffer.from(await file.arrayBuffer());

  // Upload raw file to storage for audit. Path includes resource type
  // so multiple resources can be tracked side by side.
  const stamp = Date.now();
  const storagePath = `${partnerId}/${resourceType}-${stamp}.csv`;
  const admin = createAdminClient();
  const { error: uploadErr } = await admin.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, buf, {
      contentType: file.type || "text/csv",
      upsert: false,
    });
  if (uploadErr) {
    return NextResponse.json(
      { error: "storage_failed", message: uploadErr.message },
      { status: 500 },
    );
  }

  try {
    const result = await processCsvImport({
      partnerId,
      resourceType: resourceType as ResourceType,
      bytes: buf,
      storagePath,
      createdBy: current.user.id,
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      {
        error: "internal",
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
