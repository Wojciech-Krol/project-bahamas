"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";
import BrandLogo from "@/app/components/BrandLogo";

import {
  loginAction,
  type AuthActionState,
} from "../../(auth)/actions";

const initialState: AuthActionState = {};

export default function PartnerLoginPage() {
  const t = useTranslations("Partner");
  const tAuth = useTranslations("Auth");
  const locale = useLocale();
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <div className="min-h-screen bg-surface text-on-surface relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-secondary-fixed/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-primary-fixed/40 rounded-full blur-[120px] pointer-events-none" />

      <nav className="relative z-10 bg-surface/70 backdrop-blur-xl">
        <div className="flex justify-between items-center px-6 py-4 max-w-site mx-auto">
          <Link href="/partner" className="flex items-center gap-3">
            <BrandLogo size={34} />
            <div className="h-4 w-px bg-on-surface/20" />
            <div className="text-[0.65rem] font-headline font-bold uppercase tracking-[0.2em] text-on-surface/60">
              {t("brand")}
            </div>
          </Link>
          <Link
            href="/"
            className="text-[0.7rem] font-headline font-semibold uppercase tracking-widest text-on-surface/60 hover:text-primary"
          >
            {t("nav.backToSite")}
          </Link>
        </div>
      </nav>

      <div className="relative z-10 flex items-center justify-center px-6 py-20">
        <div className="bg-surface-container-lowest rounded-[2rem] p-10 md:p-14 max-w-[480px] w-full editorial-shadow border border-[#FAEEDA]">
          <span className="inline-block bg-primary-fixed/60 px-4 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-widest text-primary mb-6">
            {t("login.badge")}
          </span>
          <h1 className="font-headline font-extrabold text-4xl leading-[1.05] tracking-tight mb-3">
            {t("login.titleStart")}{" "}
            <span className="italic text-primary">{t("login.titleEmph")}</span>
            {t("login.titleEnd")}
          </h1>
          <p className="text-on-surface/60 mb-8">{t("login.subtitle")}</p>

          <form className="space-y-4" action={formAction}>
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="next" value={`/${locale}/partner`} />
            <div>
              <label
                htmlFor="partner-email"
                className="block text-[0.6rem] font-bold uppercase tracking-[0.2em] text-on-surface/50 mb-2"
              >
                {t("login.email")}
              </label>
              <input
                id="partner-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full px-5 py-3.5 bg-surface-container-low border border-outline-variant/50 rounded-2xl focus:outline-none focus:border-primary text-on-surface font-medium"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="partner-password"
                  className="block text-[0.6rem] font-bold uppercase tracking-[0.2em] text-on-surface/50"
                >
                  {t("login.password")}
                </label>
                <Link
                  href="/login"
                  className="text-[0.65rem] font-bold uppercase tracking-widest text-primary hover:underline"
                >
                  {t("login.forgot")}
                </Link>
              </div>
              <input
                id="partner-password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="current-password"
                className="w-full px-5 py-3.5 bg-surface-container-low border border-outline-variant/50 rounded-2xl focus:outline-none focus:border-primary text-on-surface font-medium"
              />
            </div>
            {state.error ? (
              <div className="rounded-xl bg-error-container/40 px-3 py-2 text-sm text-on-error-container">
                {tAuth(`error.${state.error}`)}
              </div>
            ) : null}
            <SubmitButton label={t("login.submit")} />
          </form>

          <div className="mt-8 pt-6 border-t border-on-surface/5 text-center">
            <p className="text-sm text-on-surface/60">
              {t("login.newStudio")}{" "}
              <Link
                href="/about"
                className="text-primary font-bold hover:underline ml-1"
              >
                {t("login.apply")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-primary text-on-primary py-4 rounded-2xl font-headline uppercase tracking-widest text-[0.75rem] font-bold hover:bg-tertiary transition-colors mt-2 disabled:opacity-50"
    >
      {label}
    </button>
  );
}
