"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient, getCurrentUser } from "@/src/lib/db/server";

const replySchema = z.object({
  reviewId: z.string().uuid(),
  reply: z.string().min(0).max(1000),
});

export type ReplyResult = { ok: true } | { error: string };

export async function replyToReview(
  formData: FormData,
): Promise<ReplyResult> {
  const parsed = replySchema.safeParse({
    reviewId: formData.get("reviewId"),
    reply: formData.get("reply") ?? "",
  });
  if (!parsed.success) return { error: "invalid_input" };

  const current = await getCurrentUser();
  if (!current) return { error: "forbidden" };

  const supabase = await createClient();
  const trimmed = parsed.data.reply.trim();
  // Empty reply means "delete reply" — null both columns.
  const partnerReply = trimmed.length === 0 ? null : trimmed;
  const partnerReplyAt = trimmed.length === 0 ? null : new Date().toISOString();

  // RLS gates UPDATE on the row to partner_members of the venue. We touch
  // only partner_reply / partner_reply_at — never the customer's rating
  // or text.
  const { error } = await supabase
    .from("reviews")
    .update({
      partner_reply: partnerReply,
      partner_reply_at: partnerReplyAt,
    })
    .eq("id", parsed.data.reviewId);

  if (error) {
    console.error("[replyToReview] update failed", error);
    return { error: "internal" };
  }

  revalidatePath("/partner/reviews");
  return { ok: true };
}
