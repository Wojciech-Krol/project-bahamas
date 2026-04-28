"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { cancelBooking } from "@/src/lib/payments/bookingActions";

type CancelResult = { ok: true } | { error: string } | null;

export default function CancelBookingButton({
  bookingId,
}: {
  bookingId: string;
}) {
  const t = useTranslations("BookingDetail");
  const tErr = useTranslations("BookingDetail.cancelError");
  const router = useRouter();

  const action = async (
    _prev: CancelResult,
    _formData: FormData,
  ): Promise<CancelResult> => {
    const result = await cancelBooking(bookingId);
    if ("ok" in result && result.ok) {
      router.refresh();
    }
    return result;
  };

  const [state, formAction] = useActionState<CancelResult, FormData>(
    action,
    null,
  );

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!confirm(`${t("cancelConfirmTitle")}\n\n${t("cancelConfirmBody")}`)) {
      e.preventDefault();
    }
  }

  if (state && "ok" in state && state.ok) {
    return (
      <p className="text-sm text-tertiary font-bold">{t("cancelSuccess")}</p>
    );
  }

  return (
    <form action={formAction} onSubmit={onSubmit} className="text-right">
      <SubmitButton label={t("cancelButton")} />
      {state && "error" in state && (
        <p className="text-xs text-error mt-2" role="alert">
          {tErr.has(state.error)
            ? tErr(state.error as never)
            : tErr("internal")}
        </p>
      )}
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-sm font-bold uppercase tracking-widest text-error hover:underline disabled:opacity-50"
    >
      {label}
    </button>
  );
}
