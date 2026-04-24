"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";

import TurnstileWidget from "@/app/components/TurnstileWidget";
import { Icon } from "@/app/components/Icon";

import { applyAsPartner, type ApplyActionState } from "./actions";

const EXPECTED_BRACKETS = ["<50", "50-200", "200-500", "500+"] as const;
type ExpectedBracket = (typeof EXPECTED_BRACKETS)[number];

const initialState: ApplyActionState = {};

function isSuccessState(state: ApplyActionState): state is { ok: true } {
  return (state as { ok?: boolean }).ok === true;
}

function isErrorState(
  state: ApplyActionState,
): state is Extract<ApplyActionState, { error: string }> {
  return typeof (state as { error?: string }).error === "string";
}

export default function PartnerApplyForm({ locale }: { locale: string }) {
  const t = useTranslations("PartnerApply");
  const [state, formAction] = useActionState<ApplyActionState, FormData>(
    applyAsPartner,
    initialState,
  );
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  if (isSuccessState(state)) {
    return (
      <div className="rounded-3xl bg-surface-container-lowest border border-on-surface/[0.05] editorial-shadow px-6 md:px-10 py-10 md:py-14 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary-fixed text-primary mb-5">
          <Icon name="check_circle" className="text-[32px]" />
        </div>
        <h2 className="font-headline font-bold text-2xl md:text-3xl text-on-surface mb-3">
          {t("success.heading")}
        </h2>
        <p className="text-on-surface/70 max-w-md mx-auto">
          {t("success.body")}
        </p>
      </div>
    );
  }

  const fieldErrors =
    isErrorState(state) && state.error === "validation"
      ? state.fields ?? {}
      : {};

  const topError = isErrorState(state)
    ? resolveTopError(state, t)
    : null;

  return (
    <form
      action={formAction}
      className="space-y-5 bg-surface-container-lowest rounded-3xl border border-on-surface/[0.05] editorial-shadow px-6 md:px-10 py-8 md:py-10"
    >
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="turnstile_token" value={turnstileToken} />

      {topError ? <TopAlert message={topError} /> : null}

      <Field
        id="name"
        name="name"
        type="text"
        label={t("field.name.label")}
        placeholder={t("field.name.placeholder")}
        autoComplete="organization"
        required
        minLength={2}
        maxLength={120}
        errors={fieldErrors.name}
        errorLabel={t}
      />

      <Field
        id="contact_email"
        name="contact_email"
        type="email"
        label={t("field.contactEmail.label")}
        placeholder={t("field.contactEmail.placeholder")}
        autoComplete="email"
        required
        maxLength={254}
        errors={fieldErrors.contact_email}
        errorLabel={t}
      />

      <Field
        id="city"
        name="city"
        type="text"
        label={t("field.city.label")}
        placeholder={t("field.city.placeholder")}
        autoComplete="address-level2"
        required
        maxLength={80}
        errors={fieldErrors.city}
        errorLabel={t}
      />

      <Field
        id="website"
        name="website"
        type="text"
        label={t("field.website.label")}
        placeholder={t("field.website.placeholder")}
        inputMode="url"
        autoComplete="url"
        maxLength={2048}
        errors={fieldErrors.website}
        errorLabel={t}
      />

      <div className="space-y-1.5">
        <label
          htmlFor="expected_monthly_bookings"
          className="block text-sm font-semibold text-on-surface"
        >
          {t("field.expected.label")}
        </label>
        <select
          id="expected_monthly_bookings"
          name="expected_monthly_bookings"
          defaultValue=""
          className="w-full rounded-xl border border-on-surface/15 bg-surface-container-lowest px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        >
          <option value="">{t("field.expected.placeholder")}</option>
          {EXPECTED_BRACKETS.map((bracket: ExpectedBracket) => (
            <option key={bracket} value={bracket}>
              {t(`field.expected.options.${bracketKey(bracket)}`)}
            </option>
          ))}
        </select>
        {fieldErrors.expected_monthly_bookings?.length ? (
          <FieldError message={t("error.invalidInput")} />
        ) : null}
      </div>

      <div className="pt-2">
        <TurnstileWidget
          action="partner-apply"
          onVerify={(token) => setTurnstileToken(token)}
        />
      </div>

      <SubmitButton label={t("submit")} />
    </form>
  );
}

function bracketKey(b: ExpectedBracket): string {
  switch (b) {
    case "<50":
      return "lt50";
    case "50-200":
      return "50to200";
    case "200-500":
      return "200to500";
    case "500+":
      return "gte500";
  }
}

function resolveTopError(
  state: Extract<ApplyActionState, { error: string }>,
  t: ReturnType<typeof useTranslations>,
): string | null {
  switch (state.error) {
    case "validation":
      // Field-level errors render inline; no top banner needed.
      return null;
    case "rateLimited": {
      const minutes = Math.max(
        1,
        Math.ceil((state.retryAfterMs ?? 60_000) / 60_000),
      );
      return t("error.rateLimited", { minutes });
    }
    case "botCheck":
      return t("error.botCheck");
    case "server":
    default:
      return t("error.server");
  }
}

function Field({
  id,
  name,
  type,
  label,
  errors,
  errorLabel,
  ...rest
}: {
  id: string;
  name: string;
  type: string;
  label: string;
  errors?: string[];
  errorLabel: ReturnType<typeof useTranslations>;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const hasError = !!errors?.length;
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
        name={name}
        type={type}
        aria-invalid={hasError || undefined}
        className={`w-full rounded-xl border bg-surface-container-lowest px-4 py-3 text-on-surface placeholder-on-surface/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
          hasError ? "border-error" : "border-on-surface/15"
        }`}
        {...rest}
      />
      {hasError ? (
        <FieldError message={errorLabel("error.invalidInput")} />
      ) : null}
    </div>
  );
}

function FieldError({ message }: { message: string }) {
  return <p className="text-sm text-error">{message}</p>;
}

function TopAlert({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-xl bg-error-container/40 px-4 py-3 text-sm text-on-error-container"
    >
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
