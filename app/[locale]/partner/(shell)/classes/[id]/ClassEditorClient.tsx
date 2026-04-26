"use client";

import { useActionState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import { Icon } from "@/app/components/Icon";
import {
  createActivity,
  deleteActivity,
  updateActivity,
  type ClassActionResult,
} from "../actions";
import type {
  PartnerActivityRaw,
  PartnerVenue,
} from "@/src/lib/db/queries";

const initialState: ClassActionResult | null = null;

export default function ClassEditorClient({
  activity,
  venues,
}: {
  activity: PartnerActivityRaw | null;
  venues: PartnerVenue[];
}) {
  const t = useTranslations("Partner.classEditor");
  const tFields = useTranslations("Partner.classEditor.fields");
  const tCommon = useTranslations("Partner.common");
  const tErr = useTranslations("Partner.classEditor.error");
  const router = useRouter();

  const isNew = activity === null;
  const action = async (
    _prev: ClassActionResult | null,
    formData: FormData,
  ): Promise<ClassActionResult | null> => {
    const result = isNew
      ? await createActivity(formData)
      : await updateActivity(activity.id, formData);
    if ("ok" in result && result.ok) {
      if (isNew) {
        router.push(`/partner/classes/${result.id}`);
      }
    }
    return result;
  };

  const [state, formAction] = useActionState(action, initialState);
  const [isDeleting, startDelete] = useTransition();

  function onDelete() {
    if (!activity) return;
    if (!confirm(t("confirmDelete"))) return;
    startDelete(async () => {
      const r = await deleteActivity(activity.id);
      if ("ok" in r && r.ok) {
        router.push("/partner/classes");
      }
    });
  }

  function close() {
    router.push("/partner/classes");
  }

  const titlePl = activity?.titleI18n.pl ?? "";
  const titleEn = activity?.titleI18n.en ?? "";
  const descPl = activity?.descriptionI18n.pl ?? "";
  const descEn = activity?.descriptionI18n.en ?? "";

  return (
    <div className="relative min-h-screen">
      <button
        type="button"
        onClick={close}
        className="absolute inset-0 bg-on-surface/20 cursor-default"
        aria-label={tCommon("close")}
      />

      <aside className="absolute top-0 right-0 bottom-0 w-full max-w-[900px] bg-surface rounded-l-[2rem] overflow-hidden flex flex-col shadow-[-30px_0_80px_-20px_rgba(45,10,23,0.3)]">
        <header className="px-8 py-5 border-b border-on-surface/5 flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={close}
              className="w-9 h-9 rounded-full bg-surface-container-lowest hover:bg-primary-fixed text-on-surface/60 hover:text-primary flex items-center justify-center shrink-0"
              aria-label={tCommon("close")}
            >
              <Icon name="close" className="text-[20px]" />
            </button>
            <div className="min-w-0">
              <div className="text-[0.6rem] font-bold uppercase tracking-widest text-on-surface/50">
                {isNew ? t("newClass") : t("editing")}
              </div>
              <div className="font-headline font-bold text-lg truncate">
                {titlePl || titleEn || t("untitled")}
              </div>
            </div>
          </div>
          {!isNew && (
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="text-[0.7rem] font-bold uppercase tracking-widest text-on-surface/60 hover:text-error disabled:opacity-50 px-3 py-2"
            >
              {tCommon("delete")}
            </button>
          )}
        </header>

        <form action={formAction} className="flex-1 overflow-auto">
          <div className="p-8 space-y-8">
            <section>
              <h3 className="font-headline font-bold text-lg mb-4">
                {t("sections.basics")}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <Field label={`${tFields("title")} (PL)`}>
                  <input
                    name="titlePl"
                    defaultValue={titlePl}
                    required
                    maxLength={300}
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/50 rounded-xl focus:outline-none focus:border-primary font-semibold"
                  />
                </Field>
                <Field label={`${tFields("title")} (EN)`}>
                  <input
                    name="titleEn"
                    defaultValue={titleEn}
                    required
                    maxLength={300}
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/50 rounded-xl focus:outline-none focus:border-primary font-semibold"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <Field label={`${tFields("description")} (PL)`}>
                  <textarea
                    name="descriptionPl"
                    defaultValue={descPl}
                    rows={3}
                    maxLength={2000}
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/50 rounded-xl focus:outline-none focus:border-primary text-sm resize-none"
                  />
                </Field>
                <Field label={`${tFields("description")} (EN)`}>
                  <textarea
                    name="descriptionEn"
                    defaultValue={descEn}
                    rows={3}
                    maxLength={2000}
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/50 rounded-xl focus:outline-none focus:border-primary text-sm resize-none"
                  />
                </Field>
              </div>

              <Field label={t("fields.venue")}>
                <select
                  name="venueId"
                  defaultValue={activity?.venueId ?? venues[0]?.id ?? ""}
                  required
                  className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/50 rounded-xl focus:outline-none focus:border-primary font-semibold"
                >
                  {venues.length === 0 && (
                    <option value="">{t("fields.noVenues")}</option>
                  )}
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                      {v.city ? ` · ${v.city}` : ""}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="grid grid-cols-3 gap-3 mt-4">
                <Field label={tFields("level")}>
                  <input
                    name="level"
                    defaultValue={activity?.level ?? ""}
                    maxLength={60}
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/50 rounded-xl focus:outline-none focus:border-primary text-sm font-semibold"
                  />
                </Field>
                <Field label={t("fields.category")}>
                  <input
                    name="category"
                    defaultValue={activity?.category ?? ""}
                    maxLength={60}
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/50 rounded-xl focus:outline-none focus:border-primary text-sm font-semibold"
                  />
                </Field>
                <Field label={t("fields.ageGroup")}>
                  <input
                    name="ageGroup"
                    defaultValue={activity?.ageGroup ?? ""}
                    maxLength={60}
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/50 rounded-xl focus:outline-none focus:border-primary text-sm font-semibold"
                  />
                </Field>
              </div>
            </section>

            <div className="border-t border-dashed border-on-surface/10" />

            <section>
              <h3 className="font-headline font-bold text-lg mb-4">
                {t("sections.pricing")}
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <Field label={tFields("duration")}>
                  <input
                    name="durationMin"
                    type="number"
                    min={5}
                    max={720}
                    defaultValue={activity?.durationMin ?? 60}
                    required
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/50 rounded-xl focus:outline-none focus:border-primary font-semibold"
                  />
                </Field>
                <Field label={tFields("price")}>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    min={0}
                    defaultValue={(activity?.priceCents ?? 0) / 100}
                    required
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/50 rounded-xl focus:outline-none focus:border-primary font-semibold"
                  />
                </Field>
                <Field label={t("fields.currency")}>
                  <select
                    name="currency"
                    defaultValue={activity?.currency ?? "PLN"}
                    required
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/50 rounded-xl focus:outline-none focus:border-primary font-semibold"
                  >
                    <option value="PLN">PLN</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="USD">USD</option>
                  </select>
                </Field>
              </div>
            </section>

            <div className="border-t border-dashed border-on-surface/10" />

            <section>
              <h3 className="font-headline font-bold text-lg mb-4">
                {t("sections.media")}
              </h3>
              <Field label={t("fields.heroImage")}>
                <input
                  name="heroImage"
                  type="url"
                  placeholder="https://…"
                  defaultValue={activity?.heroImage ?? ""}
                  className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/50 rounded-xl focus:outline-none focus:border-primary font-semibold"
                />
              </Field>
            </section>

            <div className="border-t border-dashed border-on-surface/10" />

            <section>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isPublished"
                  defaultChecked={activity?.isPublished ?? false}
                  className="w-5 h-5 accent-primary"
                />
                <div>
                  <div className="font-bold text-sm">{t("fields.publish")}</div>
                  <div className="text-xs text-on-surface/60">
                    {t("fields.publishHint")}
                  </div>
                </div>
              </label>
            </section>

            {state && "error" in state && (
              <div className="rounded-xl bg-error-container/40 px-3 py-2 text-sm text-on-error-container">
                {tErr(state.error)}
              </div>
            )}
          </div>

          <footer className="sticky bottom-0 px-8 py-4 border-t border-on-surface/5 bg-surface flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={close}
              className="px-4 py-2 rounded-xl text-[0.7rem] font-bold uppercase tracking-widest text-on-surface/70 hover:bg-surface-container"
            >
              {tCommon("cancel")}
            </button>
            <SubmitButton labelSave={tCommon("save")} labelCreate={tCommon("create")} isNew={isNew} />
          </footer>
        </form>
      </aside>
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

function SubmitButton({
  labelSave,
  labelCreate,
  isNew,
}: {
  labelSave: string;
  labelCreate: string;
  isNew: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-headline uppercase tracking-widest text-[0.7rem] font-bold hover:bg-tertiary disabled:opacity-50"
    >
      {isNew ? labelCreate : labelSave}
    </button>
  );
}
