"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";

import {
  signupAction,
  googleSignInAction,
  type AuthActionState,
} from "../actions";

const initialState: AuthActionState = {};

export default function SignupForm({ locale }: { locale: string }) {
  const t = useTranslations("Auth");
  const [state, formAction] = useActionState(signupAction, initialState);

  if (state.awaitingConfirmation) {
    return <CheckEmailPanel email={state.email ?? ""} />;
  }

  return (
    <div className="space-y-6">
      <form action={googleSignInAction}>
        <input type="hidden" name="locale" value={locale} />
        <GoogleButton label={t("button.google")} />
      </form>

      <Divider label={t("divider")} />

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="locale" value={locale} />
        <Field
          id="fullName"
          type="text"
          label={t("field.fullName")}
          autoComplete="name"
          required
          maxLength={120}
        />
        <Field
          id="email"
          type="email"
          label={t("field.email")}
          autoComplete="email"
          required
        />
        <Field
          id="password"
          type="password"
          label={t("field.password")}
          autoComplete="new-password"
          required
          minLength={8}
        />
        {state.error ? <ErrorBox message={t(`error.${state.error}`)} /> : null}
        <SubmitButton label={t("button.signup")} />
      </form>
    </div>
  );
}

function CheckEmailPanel({ email }: { email: string }) {
  const t = useTranslations("Auth.checkEmail");
  return (
    <div className="rounded-2xl border border-on-surface/10 bg-surface-container-lowest p-6 space-y-3 text-center">
      <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
        ✉️
      </div>
      <h2 className="font-headline text-xl font-bold text-on-surface">
        {t("title")}
      </h2>
      <p className="text-on-surface/70 text-sm">
        {t("body", { email })}
      </p>
      <p className="text-on-surface/50 text-xs">{t("hint")}</p>
    </div>
  );
}

function Field({
  id,
  type,
  label,
  ...rest
}: {
  id: string;
  type: string;
  label: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-on-surface"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        className="w-full rounded-xl border border-on-surface/15 bg-surface-container-lowest px-4 py-3 text-on-surface placeholder-on-surface/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        {...rest}
      />
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-lg bg-error-container/40 px-3 py-2 text-sm text-on-error-container">
      {message}
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-primary text-on-primary font-headline uppercase tracking-widest text-[0.85rem] font-bold py-3.5 rounded-xl hover:bg-tertiary disabled:opacity-50 transition-colors"
    >
      {label}
    </button>
  );
}

function GoogleButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full inline-flex items-center justify-center gap-3 border border-on-surface/15 bg-surface-container-lowest text-on-surface py-3.5 rounded-xl font-semibold hover:bg-surface-container disabled:opacity-50 transition-colors"
    >
      <GoogleIcon />
      {label}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-on-surface/10" />
      <span className="text-xs uppercase tracking-widest text-on-surface/50">
        {label}
      </span>
      <div className="flex-1 h-px bg-on-surface/10" />
    </div>
  );
}
