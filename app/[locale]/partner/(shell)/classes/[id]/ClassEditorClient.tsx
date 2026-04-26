"use client";

import { useActionState, useState, useTransition } from "react";
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
  CurriculumItemRaw,
  InstructorEntryRaw,
  PartnerActivityRaw,
  PartnerVenue,
} from "@/src/lib/db/queries";

const initialState: ClassActionResult | null = null;

type CurriculumDraft = {
  titlePl: string;
  titleEn: string;
  descriptionPl: string;
  descriptionEn: string;
  imageUrl: string;
};

type CredentialDraft = { icon: string; labelPl: string; labelEn: string };

type InstructorDraft = {
  name: string;
  rolePl: string;
  roleEn: string;
  bioPl: string;
  bioEn: string;
  avatarUrl: string;
  credentials: CredentialDraft[];
};

const EMPTY_CURRICULUM: CurriculumDraft = {
  titlePl: "",
  titleEn: "",
  descriptionPl: "",
  descriptionEn: "",
  imageUrl: "",
};

const EMPTY_INSTRUCTOR: InstructorDraft = {
  name: "",
  rolePl: "",
  roleEn: "",
  bioPl: "",
  bioEn: "",
  avatarUrl: "",
  credentials: [],
};

const EMPTY_CREDENTIAL: CredentialDraft = {
  icon: "verified",
  labelPl: "",
  labelEn: "",
};

export default function ClassEditorClient({
  activity,
  venues,
  initialCurriculum,
  initialInstructors,
}: {
  activity: PartnerActivityRaw | null;
  venues: PartnerVenue[];
  initialCurriculum: CurriculumItemRaw[];
  initialInstructors: InstructorEntryRaw[];
}) {
  const t = useTranslations("Partner.classEditor");
  const tFields = useTranslations("Partner.classEditor.fields");
  const tCommon = useTranslations("Partner.common");
  const tErr = useTranslations("Partner.classEditor.error");
  const router = useRouter();

  const [curriculum, setCurriculum] = useState<CurriculumDraft[]>(() =>
    initialCurriculum.map((c) => ({
      titlePl: c.titlePl,
      titleEn: c.titleEn,
      descriptionPl: c.descriptionPl,
      descriptionEn: c.descriptionEn,
      imageUrl: c.imageUrl ?? "",
    })),
  );
  const [instructors, setInstructors] = useState<InstructorDraft[]>(() =>
    initialInstructors.map((i) => ({
      name: i.name,
      rolePl: i.rolePl,
      roleEn: i.roleEn,
      bioPl: i.bioPl,
      bioEn: i.bioEn,
      avatarUrl: i.avatarUrl ?? "",
      credentials: i.credentials.map((c) => ({
        icon: c.icon,
        labelPl: c.labelPl,
        labelEn: c.labelEn,
      })),
    })),
  );

  function updateCurriculum(idx: number, patch: Partial<CurriculumDraft>) {
    setCurriculum((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, ...patch } : row)),
    );
  }
  function addCurriculum() {
    setCurriculum((prev) => [...prev, { ...EMPTY_CURRICULUM }]);
  }
  function removeCurriculum(idx: number) {
    setCurriculum((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateInstructor(idx: number, patch: Partial<InstructorDraft>) {
    setInstructors((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, ...patch } : row)),
    );
  }
  function addInstructor() {
    setInstructors((prev) => [...prev, { ...EMPTY_INSTRUCTOR, credentials: [] }]);
  }
  function removeInstructor(idx: number) {
    setInstructors((prev) => prev.filter((_, i) => i !== idx));
  }
  function updateCredential(
    instIdx: number,
    credIdx: number,
    patch: Partial<CredentialDraft>,
  ) {
    setInstructors((prev) =>
      prev.map((row, i) =>
        i === instIdx
          ? {
              ...row,
              credentials: row.credentials.map((c, j) =>
                j === credIdx ? { ...c, ...patch } : c,
              ),
            }
          : row,
      ),
    );
  }
  function addCredential(instIdx: number) {
    setInstructors((prev) =>
      prev.map((row, i) =>
        i === instIdx
          ? { ...row, credentials: [...row.credentials, { ...EMPTY_CREDENTIAL }] }
          : row,
      ),
    );
  }
  function removeCredential(instIdx: number, credIdx: number) {
    setInstructors((prev) =>
      prev.map((row, i) =>
        i === instIdx
          ? {
              ...row,
              credentials: row.credentials.filter((_, j) => j !== credIdx),
            }
          : row,
      ),
    );
  }

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
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline font-bold text-lg">
                  {t("sections.curriculum")}
                </h3>
                <button
                  type="button"
                  onClick={addCurriculum}
                  className="text-[0.7rem] font-bold uppercase tracking-widest text-primary hover:underline"
                >
                  + {t("addCurriculumItem")}
                </button>
              </div>
              {curriculum.length === 0 ? (
                <p className="text-sm text-on-surface/50">
                  {t("emptyCurriculum")}
                </p>
              ) : (
                <div className="space-y-4">
                  {curriculum.map((row, idx) => (
                    <div
                      key={idx}
                      className="bg-surface-container-low rounded-2xl p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface/50">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeCurriculum(idx)}
                          className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface/60 hover:text-error"
                        >
                          {tCommon("delete")}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <input
                          value={row.titlePl}
                          onChange={(e) =>
                            updateCurriculum(idx, { titlePl: e.target.value })
                          }
                          placeholder={`${tFields("title")} (PL)`}
                          className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/50 rounded-lg focus:outline-none focus:border-primary text-sm font-semibold"
                        />
                        <input
                          value={row.titleEn}
                          onChange={(e) =>
                            updateCurriculum(idx, { titleEn: e.target.value })
                          }
                          placeholder={`${tFields("title")} (EN)`}
                          className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/50 rounded-lg focus:outline-none focus:border-primary text-sm font-semibold"
                        />
                        <textarea
                          value={row.descriptionPl}
                          onChange={(e) =>
                            updateCurriculum(idx, {
                              descriptionPl: e.target.value,
                            })
                          }
                          rows={2}
                          placeholder={`${tFields("description")} (PL)`}
                          className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/50 rounded-lg focus:outline-none focus:border-primary text-sm resize-none"
                        />
                        <textarea
                          value={row.descriptionEn}
                          onChange={(e) =>
                            updateCurriculum(idx, {
                              descriptionEn: e.target.value,
                            })
                          }
                          rows={2}
                          placeholder={`${tFields("description")} (EN)`}
                          className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/50 rounded-lg focus:outline-none focus:border-primary text-sm resize-none"
                        />
                      </div>
                      <input
                        value={row.imageUrl}
                        onChange={(e) =>
                          updateCurriculum(idx, { imageUrl: e.target.value })
                        }
                        type="url"
                        placeholder={t("fields.imageUrl")}
                        className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/50 rounded-lg focus:outline-none focus:border-primary text-xs"
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="border-t border-dashed border-on-surface/10" />

            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline font-bold text-lg">
                  {t("sections.instructors")}
                </h3>
                <button
                  type="button"
                  onClick={addInstructor}
                  className="text-[0.7rem] font-bold uppercase tracking-widest text-primary hover:underline"
                >
                  + {t("addInstructor")}
                </button>
              </div>
              {instructors.length === 0 ? (
                <p className="text-sm text-on-surface/50">
                  {t("emptyInstructors")}
                </p>
              ) : (
                <div className="space-y-4">
                  {instructors.map((inst, idx) => (
                    <div
                      key={idx}
                      className="bg-surface-container-low rounded-2xl p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <input
                          value={inst.name}
                          onChange={(e) =>
                            updateInstructor(idx, { name: e.target.value })
                          }
                          required
                          placeholder={t("fields.instructorName")}
                          className="flex-1 px-3 py-2 bg-surface-container-lowest border border-outline-variant/50 rounded-lg focus:outline-none focus:border-primary font-headline font-bold mr-2"
                        />
                        <button
                          type="button"
                          onClick={() => removeInstructor(idx)}
                          className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface/60 hover:text-error"
                        >
                          {tCommon("delete")}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <input
                          value={inst.rolePl}
                          onChange={(e) =>
                            updateInstructor(idx, { rolePl: e.target.value })
                          }
                          placeholder={`${t("fields.role")} (PL)`}
                          className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/50 rounded-lg focus:outline-none focus:border-primary text-sm"
                        />
                        <input
                          value={inst.roleEn}
                          onChange={(e) =>
                            updateInstructor(idx, { roleEn: e.target.value })
                          }
                          placeholder={`${t("fields.role")} (EN)`}
                          className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/50 rounded-lg focus:outline-none focus:border-primary text-sm"
                        />
                        <textarea
                          value={inst.bioPl}
                          onChange={(e) =>
                            updateInstructor(idx, { bioPl: e.target.value })
                          }
                          rows={2}
                          placeholder={`${t("fields.bio")} (PL)`}
                          className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/50 rounded-lg focus:outline-none focus:border-primary text-sm resize-none"
                        />
                        <textarea
                          value={inst.bioEn}
                          onChange={(e) =>
                            updateInstructor(idx, { bioEn: e.target.value })
                          }
                          rows={2}
                          placeholder={`${t("fields.bio")} (EN)`}
                          className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/50 rounded-lg focus:outline-none focus:border-primary text-sm resize-none"
                        />
                      </div>
                      <input
                        value={inst.avatarUrl}
                        onChange={(e) =>
                          updateInstructor(idx, { avatarUrl: e.target.value })
                        }
                        type="url"
                        placeholder={t("fields.avatarUrl")}
                        className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/50 rounded-lg focus:outline-none focus:border-primary text-xs"
                      />

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-on-surface/50">
                            {t("fields.credentials")}
                          </span>
                          <button
                            type="button"
                            onClick={() => addCredential(idx)}
                            className="text-[0.65rem] font-bold uppercase tracking-widest text-primary hover:underline"
                          >
                            + {t("addCredential")}
                          </button>
                        </div>
                        {inst.credentials.map((cred, ci) => (
                          <div key={ci} className="grid grid-cols-[120px_1fr_1fr_auto] gap-2">
                            <input
                              value={cred.icon}
                              onChange={(e) =>
                                updateCredential(idx, ci, {
                                  icon: e.target.value,
                                })
                              }
                              placeholder="icon"
                              className="px-2 py-1.5 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-xs font-mono"
                            />
                            <input
                              value={cred.labelPl}
                              onChange={(e) =>
                                updateCredential(idx, ci, {
                                  labelPl: e.target.value,
                                })
                              }
                              placeholder="PL"
                              className="px-2 py-1.5 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-xs"
                            />
                            <input
                              value={cred.labelEn}
                              onChange={(e) =>
                                updateCredential(idx, ci, {
                                  labelEn: e.target.value,
                                })
                              }
                              placeholder="EN"
                              className="px-2 py-1.5 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => removeCredential(idx, ci)}
                              className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface/60 hover:text-error px-2"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <input
              type="hidden"
              name="curriculum"
              value={JSON.stringify(curriculum)}
            />
            <input
              type="hidden"
              name="instructors"
              value={JSON.stringify(instructors)}
            />

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
