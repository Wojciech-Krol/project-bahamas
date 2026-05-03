"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import { Icon } from "@/src/components/Icon";

import { requestAccountDeletion } from "./actions";

type Props = {
  locale: string;
  deletionPending: boolean;
  deletionDate: string | null;
};

export default function AccountForms({
  locale,
  deletionPending,
  deletionDate,
}: Props) {
  const t = useTranslations("Account");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onDelete(formData: FormData) {
    setError(null);
    // Native confirm is fine for a destructive action — matches the
    // spec's "simplest possible" UX and avoids a full modal component
    // for a rarely-hit flow. The message is translated.
    if (typeof window !== "undefined" && !window.confirm(t("delete.confirm"))) {
      return;
    }
    startTransition(async () => {
      const result = await requestAccountDeletion(undefined, formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <section className="rounded-[1.75rem] bg-surface-container-lowest border border-on-surface/[0.06] editorial-shadow p-6 md:p-7 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center">
            <Icon name="download" className="text-[22px]" />
          </span>
          <h3 className="font-headline font-bold text-xl text-on-surface">
            {t("export.heading")}
          </h3>
        </div>
        <p className="text-sm text-on-surface/65 leading-relaxed">
          {t("export.description")}
        </p>
        <form action="/api/account/export" method="post" className="mt-auto">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-primary text-on-primary px-5 py-2.5 text-sm font-headline uppercase tracking-widest font-bold hover:bg-tertiary transition-colors active:scale-95"
          >
            <Icon name="download" className="text-[18px]" />
            {t("export.button")}
          </button>
        </form>
      </section>

      <section className="rounded-[1.75rem] bg-surface-container-lowest border border-on-surface/[0.06] editorial-shadow p-6 md:p-7 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-2xl bg-error-container/60 text-on-error-container flex items-center justify-center">
            <Icon name="lock" className="text-[22px]" />
          </span>
          <h3 className="font-headline font-bold text-xl text-on-surface">
            {t("delete.heading")}
          </h3>
        </div>
        <p className="text-sm text-on-surface/65 leading-relaxed">
          {t("delete.description")}
        </p>
        {deletionPending && deletionDate ? (
          <div className="rounded-2xl bg-primary-fixed/60 text-primary px-4 py-3 text-sm font-semibold flex items-center gap-2 mt-auto">
            <Icon name="schedule" className="text-[18px]" />
            {t("delete.pending", { date: deletionDate })}
          </div>
        ) : (
          <form action={onDelete} className="mt-auto">
            <input type="hidden" name="locale" value={locale} />
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-full border border-red-400 text-red-600 px-5 py-2.5 text-sm font-headline uppercase tracking-widest font-bold hover:bg-red-50 transition-colors disabled:opacity-60 active:scale-95"
            >
              <Icon name="logout" className="text-[18px]" />
              {t("delete.button")}
            </button>
            {error && (
              <p className="mt-3 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
          </form>
        )}
      </section>
    </div>
  );
}
