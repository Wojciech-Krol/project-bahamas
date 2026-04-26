"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";

import { Icon } from "@/src/components/Icon";
import type { PartnerProfile } from "@/src/lib/db/queries";

import {
  updatePartnerProfile,
  type SettingsActionResult,
} from "./actions";

const initialState: SettingsActionResult | null = null;

export default function PartnerSettingsClient({
  profile,
}: {
  profile: PartnerProfile;
}) {
  const t = useTranslations("Partner.settings");
  const tCommon = useTranslations("Partner.common");
  const tErr = useTranslations("Partner.settings.error");
  const action = async (
    _prev: SettingsActionResult | null,
    formData: FormData,
  ): Promise<SettingsActionResult | null> => updatePartnerProfile(formData);
  const [state, formAction] = useActionState(action, initialState);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <span className="inline-block bg-primary-fixed/60 px-3 py-1 rounded-full text-[0.6rem] font-bold uppercase tracking-widest text-primary mb-2">
          {t("badge")}
        </span>
        <h1 className="font-headline font-extrabold text-3xl tracking-tight">
          {t("title")}
        </h1>
      </div>

      <form action={formAction} className="space-y-6">
        <Section icon="badge" title={t("sections.profile")}>
          <Field label={t("fields.name")}>
            <input
              name="name"
              defaultValue={profile.name}
              required
              maxLength={120}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl focus:outline-none focus:border-primary font-headline font-bold"
            />
          </Field>
          <Field label={t("fields.slug")}>
            <div className="flex items-center bg-surface-container-low border border-outline-variant/50 rounded-xl focus-within:border-primary">
              <span className="px-3 text-on-surface/40 font-mono text-sm">
                /school/
              </span>
              <input
                name="slug"
                defaultValue={profile.slug}
                required
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                minLength={3}
                maxLength={60}
                className="flex-1 px-1 py-3 bg-transparent focus:outline-none font-mono text-sm"
              />
            </div>
            <p className="text-[0.65rem] text-on-surface/50 mt-1">
              {t("fields.slugHint")}
            </p>
          </Field>
          <Field label={t("fields.contactEmail")}>
            <input
              name="contactEmail"
              type="email"
              defaultValue={profile.contactEmail}
              required
              maxLength={200}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl focus:outline-none focus:border-primary"
            />
          </Field>
          <Field label={t("fields.city")}>
            <input
              name="city"
              defaultValue={profile.city ?? ""}
              maxLength={80}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl focus:outline-none focus:border-primary"
            />
          </Field>
        </Section>

        <Section icon="lock" title={t("sections.account")}>
          <Row label={t("fields.status")} value={profile.status} />
          <Row
            label={t("fields.commission")}
            value={`${(profile.commissionRateBps / 100).toFixed(2)}%`}
          />
          <Row
            label={t("fields.subscription")}
            value={profile.subscriptionTier}
          />
          {profile.subscriptionCommissionBps != null && (
            <Row
              label={t("fields.subscriptionCommission")}
              value={`${(profile.subscriptionCommissionBps / 100).toFixed(2)}%`}
            />
          )}
          <p className="text-xs text-on-surface/50 mt-3">
            {t("contactSupport")}
          </p>
        </Section>

        {state && "error" in state && (
          <div className="rounded-xl bg-error-container/40 px-3 py-2 text-sm text-on-error-container">
            {tErr(state.error)}
          </div>
        )}
        {state && "ok" in state && state.ok && (
          <div className="rounded-xl bg-tertiary-container/40 px-3 py-2 text-sm text-on-tertiary-container">
            {t("savedToast")}
          </div>
        )}

        <div className="flex justify-end gap-2 sticky bottom-0 bg-surface py-4 border-t border-on-surface/5">
          <SubmitButton label={tCommon("save")} />
        </div>
      </form>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-[#FAEEDA] p-5 space-y-4">
      <h3 className="font-headline font-bold text-lg flex items-center gap-2">
        <Icon name={icon} className="text-[20px] text-primary" />
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[0.6rem] font-bold uppercase tracking-[0.2em] text-on-surface/50 mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-on-surface/5 last:border-b-0">
      <span className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface/50">
        {label}
      </span>
      <span className="font-bold text-on-surface text-sm">{value}</span>
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-headline uppercase tracking-widest text-[0.7rem] font-bold hover:bg-tertiary disabled:opacity-50"
    >
      {label}
    </button>
  );
}
