"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { replyToReview, type ReplyResult } from "./actions";

const initialState: ReplyResult | null = null;

export default function ReviewReplyForm({
  reviewId,
  initialReply,
}: {
  reviewId: string;
  initialReply: string | null;
}) {
  const t = useTranslations("Partner.reviewsAdmin");
  const action = async (
    _prev: ReplyResult | null,
    formData: FormData,
  ): Promise<ReplyResult | null> => replyToReview(formData);
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-3 space-y-2">
      <input type="hidden" name="reviewId" value={reviewId} />
      <label className="block text-[0.6rem] font-bold uppercase tracking-[0.2em] text-on-surface/50">
        {t("replyLabel")}
      </label>
      <textarea
        name="reply"
        defaultValue={initialReply ?? ""}
        rows={2}
        maxLength={1000}
        placeholder={t("replyPlaceholder")}
        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/50 rounded-xl focus:outline-none focus:border-primary text-sm resize-none"
      />
      <div className="flex items-center gap-3 justify-end">
        {state && "ok" in state && state.ok && (
          <span className="text-xs text-tertiary font-bold">{t("replySaved")}</span>
        )}
        {state && "error" in state && (
          <span className="text-xs text-error font-bold">{t("replyError")}</span>
        )}
        <SubmitButton labelNew={t("replyButton")} labelEdit={t("replyEdit")} hasReply={!!initialReply} />
      </div>
    </form>
  );
}

function SubmitButton({
  labelNew,
  labelEdit,
  hasReply,
}: {
  labelNew: string;
  labelEdit: string;
  hasReply: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-primary text-on-primary px-4 py-1.5 rounded-xl text-[0.65rem] font-bold uppercase tracking-widest hover:bg-tertiary disabled:opacity-50"
    >
      {hasReply ? labelEdit : labelNew}
    </button>
  );
}
