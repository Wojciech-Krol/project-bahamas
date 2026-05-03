"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient, getCurrentUser } from "@/src/lib/db/server";

export type ToggleFavoriteResult =
  | { ok: true; favorited: boolean }
  | {
      ok: false;
      error: "not_signed_in" | "validation" | "not_found" | "server";
    };

const idSchema = z.object({ activityId: z.string().uuid() });

/**
 * Toggle a favorite for the signed-in user.
 *
 * Behaviour: if (user, activity) row exists → DELETE → favorited=false.
 * Otherwise → INSERT → favorited=true. Single round-trip optimistic
 * approach: try INSERT first; on PK conflict assume the row is there
 * and fall through to DELETE. This avoids the SELECT → branch race.
 */
export async function toggleFavorite(
  raw: unknown,
): Promise<ToggleFavoriteResult> {
  const parsed = idSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "validation" };

  const current = await getCurrentUser();
  if (!current) return { ok: false, error: "not_signed_in" };

  const supabase = await createClient();

  const { error: insertErr } = await supabase
    .from("favorites")
    .insert({ user_id: current.user.id, activity_id: parsed.data.activityId });

  if (!insertErr) {
    revalidatePath("/account/favorites");
    return { ok: true, favorited: true };
  }

  // 23505 = unique_violation → row already there → toggle off via DELETE.
  // Other errors (FK violation, RLS) propagate as a generic failure.
  const isConflict =
    (insertErr as { code?: string }).code === "23505" ||
    insertErr.message?.includes("duplicate key");

  if (!isConflict) {
    // FK violation on activity_id → the requested activity does not exist.
    if ((insertErr as { code?: string }).code === "23503") {
      return { ok: false, error: "not_found" };
    }
    console.error("[favorites.toggle] insert failed", insertErr);
    return { ok: false, error: "server" };
  }

  const { error: deleteErr } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", current.user.id)
    .eq("activity_id", parsed.data.activityId);

  if (deleteErr) {
    console.error("[favorites.toggle] delete failed", deleteErr);
    return { ok: false, error: "server" };
  }

  revalidatePath("/account/favorites");
  return { ok: true, favorited: false };
}

/** Returns the set of activity IDs the current user has favorited.
 *  Empty Set when not signed in — callers shouldn't gate on auth. */
export async function getFavoriteIds(): Promise<Set<string>> {
  const current = await getCurrentUser();
  if (!current) return new Set();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("favorites")
    .select("activity_id")
    .eq("user_id", current.user.id);

  if (error) {
    console.error("[favorites.getFavoriteIds] select failed", error);
    return new Set();
  }

  return new Set((data ?? []).map((r: { activity_id: string }) => r.activity_id));
}
