"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";

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
    <div className="space-y-6">
      <section className="rounded-2xl bg-surface-container-lowest border border-on-surface/10 p-6">
        <h2 className="font-headline text-xl font-semibold mb-2">
          {t("export.heading")}
        </h2>
        <p className="text-sm text-on-surface/70 mb-4">
          {t("export.description")}
        </p>
        <form action="/api/account/export" method="post">
          <button
            type="submit"
            className="rounded-xl bg-primary text-on-primary px-4 py-2 text-sm font-headline uppercase tracking-widest font-bold hover:bg-tertiary transition-colors"
          >
            {t("export.button")}
          </button>
        </form>
      </section>

      <section className="rounded-2xl bg-surface-container-lowest border border-on-surface/10 p-6">
        <h2 className="font-headline text-xl font-semibold mb-2">
          {t("delete.heading")}
        </h2>
        <p className="text-sm text-on-surface/70 mb-4">
          {t("delete.description")}
        </p>
        {deletionPending && deletionDate ? (
          <div className="rounded-lg bg-primary/10 text-primary px-4 py-3 text-sm">
            {t("delete.pending", { date: deletionDate })}
          </div>
        ) : (
          <form action={onDelete}>
            <input type="hidden" name="locale" value={locale} />
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl border border-red-400 text-red-600 px-4 py-2 text-sm font-headline uppercase tracking-widest font-bold hover:bg-red-50 transition-colors disabled:opacity-60"
            >
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
