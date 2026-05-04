"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { unlockLandingGate, type GateState } from "./actions";

const INITIAL_STATE: GateState = { error: null };

export default function LandingGateForm({ locale }: { locale: string }) {
  const t = useTranslations("LandingGate");
  const [state, formAction, pending] = useActionState(
    unlockLandingGate,
    INITIAL_STATE,
  );

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl bg-surface-container-lowest p-8 editorial-shadow">
        <h1 className="font-headline text-3xl text-on-surface">{t("title")}</h1>
        <p className="mt-2 text-sm text-on-surface-variant">{t("subtitle")}</p>
        <form action={formAction} className="mt-6 space-y-4">
          <input type="hidden" name="locale" value={locale} />
          <label className="block">
            <span className="sr-only">{t("passwordLabel")}</span>
            <input
              type="password"
              name="password"
              required
              autoFocus
              autoComplete="off"
              placeholder={t("passwordLabel")}
              aria-invalid={state.error === "wrong"}
              className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </label>
          {state.error === "wrong" ? (
            <p className="text-sm text-error" role="alert">
              {t("error")}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-primary px-4 py-3 font-label text-on-primary transition disabled:opacity-60"
          >
            {pending ? t("submitting") : t("submit")}
          </button>
        </form>
      </div>
    </main>
  );
}
