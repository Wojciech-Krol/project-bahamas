"use server";

/**
 * Server Actions for the /account page.
 *
 * - `requestAccountDeletion` — soft-deletes the account by stamping
 *   `profiles.deletion_requested_at` and enqueueing a row in
 *   `account_deletion_queue`. The nightly cron at
 *   `/api/cron/process-account-deletions` picks it up after 30 days.
 *
 * Export is handled by a Route Handler (`/api/account/export`) rather
 * than an Action — a Server Action can only return a serializable
 * value, not a raw `Response` with a `Content-Disposition` header, so
 * the export form targets the route handler directly. The handler
 * uses the same session cookie so auth works identically.
 */

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/src/lib/db/server";
import { createAdminClient } from "@/src/lib/db/admin";

export async function requestAccountDeletion(
  _prev: { error?: string; success?: boolean } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const current = await getCurrentUser();
  if (!current) {
    // Hit from a stale client — send them to login, the account page
    // will bounce them back here after signing in.
    redirect("/login");
  }

  const locale = (formData.get("locale") as string) ?? "pl";

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    console.error("[account:delete] admin client not configured", err);
    return { error: "Service temporarily unavailable." };
  }

  // Mark profile first — this is what the UI reads to show "pending".
  const { error: profileError } = await admin
    .from("profiles")
    .update({ deletion_requested_at: new Date().toISOString() })
    .eq("id", current.user.id);

  if (profileError) {
    console.error("[account:delete] profile update failed", profileError);
    return { error: "Couldn't mark your account for deletion. Try again." };
  }

  // Upsert the queue row — idempotent if the user clicks twice, and
  // preserves the original `requested_at` / `hard_delete_at` from the
  // first request so the grace window doesn't keep resetting.
  const { error: queueError } = await admin
    .from("account_deletion_queue")
    .upsert(
      { user_id: current.user.id },
      { onConflict: "user_id", ignoreDuplicates: true },
    );

  if (queueError) {
    console.error("[account:delete] queue insert failed", queueError);
    return { error: "Couldn't schedule deletion. Try again." };
  }

  revalidatePath(`/${locale}/account`);
  return { success: true };
}
