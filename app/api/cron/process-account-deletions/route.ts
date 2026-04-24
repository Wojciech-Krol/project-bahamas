/**
 * Vercel Cron: process the account-deletion queue.
 *
 * Runs daily. For every row in `account_deletion_queue` whose
 * `hard_delete_at` has passed and which hasn't been processed:
 *
 *   1. Anonymize the profile row — full_name → null, avatar_url → null.
 *   2. Strip `bookings.user_id` (set to null). Bookings themselves are
 *      retained for EU/Polish VAT compliance (5+ years).
 *   3. Delete reviews authored by the user (or anonymize — we delete
 *      here because they're short-form opinions with no financial
 *      audit trail requirement).
 *   4. Replace the user's email with `deleted-{uuid}@deleted.hakuna`
 *      (via `admin.auth.admin.updateUserById`) and then call
 *      `admin.auth.admin.deleteUser` to remove the auth row. Profile
 *      row cascades on `auth.users` delete so it's gone too.
 *   5. Stamp `processed_at` on the queue row for audit.
 *
 * Auth: shared-secret Bearer (`CRON_SECRET`), same pattern as the
 * other crons in this project.
 */

import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/src/env";
import { createAdminClient } from "@/src/lib/db/admin";
import { verifyBearer } from "@/src/lib/auth/bearer";

type ServerEnv = typeof env & { CRON_SECRET?: string };

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type QueueRow = {
  user_id: string;
  requested_at: string;
  hard_delete_at: string;
};

export async function GET(request: NextRequest) {
  const serverEnv = env as ServerEnv;
  if (!serverEnv.CRON_SECRET) {
    return new NextResponse("cron not configured", { status: 503 });
  }

  if (!verifyBearer(request.headers.get("authorization"), serverEnv.CRON_SECRET)) {
    return new NextResponse("unauthorized", { status: 401 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    console.error("[cron:account-deletions] admin not configured", err);
    return new NextResponse("admin not configured", { status: 503 });
  }

  const nowIso = new Date().toISOString();

  const { data: queue, error: queueError } = await admin
    .from("account_deletion_queue")
    .select("user_id, requested_at, hard_delete_at")
    .is("processed_at", null)
    .lte("hard_delete_at", nowIso);

  if (queueError) {
    console.error("[cron:account-deletions] queue select failed", queueError);
    return NextResponse.json({ error: "db" }, { status: 500 });
  }

  const rows = (queue as QueueRow[] | null) ?? [];
  const processed: string[] = [];
  const failed: Array<{ user_id: string; error: string }> = [];

  for (const row of rows) {
    try {
      const userId = row.user_id;

      // 1. Anonymize profile columns BEFORE the auth.users delete cascades
      //    the profile row away. Belt-and-braces: even if the cascade ever
      //    changes shape, there's no PII left to clean up.
      await admin
        .from("profiles")
        .update({
          full_name: null,
          avatar_url: null,
          deletion_requested_at: null,
        })
        .eq("id", userId);

      // 2. Replace email and delete the auth user. The email rewrite is
      //    defensive — Supabase logs may still hold the old email in
      //    request payloads, so the last observable email becomes a
      //    tombstone value.
      //
      //    Cascading effects driven by FK actions defined in earlier
      //    migrations:
      //      * profiles.id -> auth.users.id ON DELETE CASCADE
      //          (profile row dropped automatically)
      //      * bookings.user_id -> auth.users.id ON DELETE SET NULL
      //          (since migration 0007 — user_id becomes null,
      //          bookings retained for accounting)
      //      * reviews.author_id -> auth.users.id ON DELETE CASCADE
      //          (reviews authored by the user are removed — short-form
      //          opinions, no audit-retention requirement)
      //      * customer_partner_attribution.user_id -> auth.users.id
      //          ON DELETE CASCADE (per migration 0002)
      //
      //    `supabase.auth.admin.*` is present on the service-role
      //    client. TypeScript typing is loose in the raw client, so
      //    we reach through `any` — same pattern used elsewhere in
      //    the project where auth admin is called.
      const tombstoneEmail = `deleted-${userId}@deleted.hakuna`;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const authAdmin = (admin as any).auth?.admin;
      if (authAdmin?.updateUserById) {
        await authAdmin.updateUserById(userId, { email: tombstoneEmail });
      }
      if (authAdmin?.deleteUser) {
        await authAdmin.deleteUser(userId);
      }

      // 3. Mark queue row processed.
      await admin
        .from("account_deletion_queue")
        .update({ processed_at: new Date().toISOString() })
        .eq("user_id", userId);

      processed.push(userId);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        "[cron:account-deletions] failed for user",
        row.user_id,
        message,
      );
      failed.push({ user_id: row.user_id, error: message });
    }
  }

  return NextResponse.json({
    processed: processed.length,
    failed: failed.length,
    failures: failed,
  });
}
