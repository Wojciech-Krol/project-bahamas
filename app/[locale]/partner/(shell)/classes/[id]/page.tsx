"use client";

import { use, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "../../../../../../src/i18n/navigation";
import { Icon } from "../../../../../components/Icon";
import {
  classById,
  instructorById,
  PARTNER_INSTRUCTORS,
  type Weekday,
  type PricingModel,
} from "../../../../../lib/partnerMockData";
import { notFound } from "next/navigation";

const WEEKDAY_KEYS: Weekday[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export default function PartnerClassEditorPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = use(params);
  const data = classById(id);
  if (!data) notFound();

  const t = useTranslations("Partner");
  const tEd = useTranslations("Partner.classEditor");
  const tFields = useTranslations("Partner.classEditor.fields");
  const tSections = useTranslations("Partner.classEditor.sections");
  const tPreview = useTranslations("Partner.classEditor.preview");
  const tClasses = useTranslations("Partner.mock.classes");
  const tInstructors = useTranslations("Partner.mock.instructors");
  const tCommon = useTranslations("Partner.common");
  const tPricing = useTranslations("Partner.classEditor.pricingModels");
  const tStatus = useTranslations("Partner.status");

  const router = useRouter();

  // form state (local-only; save is stubbed)
  const [title, setTitle] = useState(tClasses(`${data.copyKey}.title`));
  const [description, setDescription] = useState(
    tClasses(`${data.copyKey}.description`),
  );
  const [startTime, setStartTime] = useState(data.startTime);
  const [price, setPrice] = useState(String(data.price));
  const [recurringDays, setRecurringDays] = useState<Weekday[]>(data.recurringDays);
  const [capacity, setCapacity] = useState(data.capacity);

  const instructor = instructorById(data.primaryInstructorId);
  const backupInstructors = PARTNER_INSTRUCTORS.filter(
    (i) => i.id !== data.primaryInstructorId,
  ).slice(0, 2);

  const weekdayInitials = tEd.raw("weekdayInitials") as string[];

  const levelLabel = t(data.levelLabelKey.replace(/^Partner\./, ""));
  const room = tClasses(`${data.copyKey}.room`);
  const schedule = tClasses(`${data.copyKey}.schedule`);

  function toggleDay(day: Weekday) {
    setRecurringDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }

  function close() {
    router.push("/partner/classes");
  }

  return (
    <div className="relative min-h-screen">
      {/* dimmed list skeleton behind */}
      <div className="absolute inset-0 opacity-40 pointer-events-none p-8">
        <div className="h-16 bg-surface-container-lowest rounded-2xl mb-4" />
        <div className="space-y-3">
          <div className="h-24 bg-surface-container-lowest rounded-2xl" />
          <div className="h-24 bg-surface-container-lowest rounded-2xl" />
          <div className="h-24 bg-surface-container-lowest rounded-2xl" />
          <div className="h-24 bg-surface-container-lowest rounded-2xl" />
        </div>
      </div>
      <button
        type="button"
        onClick={close}
        className="absolute inset-0 bg-on-surface/20 cursor-default"
        aria-label={tCommon("close")}
      />

      {/* drawer */}
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
                {tEd("editing")}
              </div>
              <div className="font-headline font-bold text-lg truncate">{title}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[0.7rem] text-green-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-600" />
              {tCommon("savedJustNow")}
            </span>
            <button
              type="button"
              className="px-4 py-2 rounded-xl text-[0.7rem] font-bold uppercase tracking-widest text-on-surface/70 hover:bg-surface-container"
            >
              {tCommon("preview")}
            </button>
            <button
              type="button"
              className="bg-primary text-on-primary px-5 py-2 rounded-xl font-headline uppercase tracking-widest text-[0.7rem] font-bold hover:bg-tertiary"
            >
              {tCommon("publish")}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto grid grid-cols-1 md:grid-cols-[1.3fr_1fr]">
          {/* form */}
          <div className="p-8 space-y-8 md:border-r border-on-surface/5">
            {/* 01 Basics */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-primary font-bold text-[0.7rem] uppercase tracking-widest">
                  01
                </span>
                <h3 className="font-headline font-bold text-lg">{tSections("basics")}</h3>
              </div>
              <label className="block text-[0.6rem] font-bold uppercase tracking-[0.2em] text-on-surface/50 mb-2">
                {tFields("title")}
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/50 rounded-xl focus:outline-none focus:border-primary font-semibold mb-4"
              />

              <label className="block text-[0.6rem] font-bold uppercase tracking-[0.2em] text-on-surface/50 mb-2">
                {tFields("description")}
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/50 rounded-xl focus:outline-none focus:border-primary text-sm resize-none"
              />

              <div className="grid grid-cols-3 gap-3 mt-4">
                <div>
                  <label className="block text-[0.6rem] font-bold uppercase tracking-[0.2em] text-on-surface/50 mb-2">
                    {tFields("level")}
                  </label>
                  <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer">
                    <span className="text-sm font-semibold">{levelLabel}</span>
                    <Icon name="expand_more" className="text-[16px] text-on-surface/40" />
                  </div>
                </div>
                <div>
                  <label className="block text-[0.6rem] font-bold uppercase tracking-[0.2em] text-on-surface/50 mb-2">
                    {tFields("duration")}
                  </label>
                  <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer">
                    <span className="text-sm font-semibold">
                      {tCommon("minutes", { count: data.durationMinutes })}
                    </span>
                    <Icon name="expand_more" className="text-[16px] text-on-surface/40" />
                  </div>
                </div>
                <div>
                  <label className="block text-[0.6rem] font-bold uppercase tracking-[0.2em] text-on-surface/50 mb-2">
                    {tFields("capacity")}
                  </label>
                  <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 flex items-center justify-between">
                    <span className="text-sm font-semibold">{capacity}</span>
                    <div className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => setCapacity((c) => c + 1)}
                        className="w-5 h-3 flex items-center justify-center text-on-surface/40 hover:text-primary"
                      >
                        <Icon name="expand_less" className="text-[14px]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCapacity((c) => Math.max(1, c - 1))}
                        className="w-5 h-3 flex items-center justify-center text-on-surface/40 hover:text-primary"
                      >
                        <Icon name="expand_more" className="text-[14px]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="border-t border-dashed border-on-surface/10" />

            {/* 02 Schedule */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-primary font-bold text-[0.7rem] uppercase tracking-widest">
                  02
                </span>
                <h3 className="font-headline font-bold text-lg">
                  {tSections("schedule")}
                </h3>
              </div>
              <label className="block text-[0.6rem] font-bold uppercase tracking-[0.2em] text-on-surface/50 mb-2">
                {tFields("recurringDays")}
              </label>
              <div className="flex gap-1.5 mb-4">
                {WEEKDAY_KEYS.map((day, i) => {
                  const on = recurringDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`w-10 h-10 rounded-full text-[0.7rem] font-bold ${
                        on
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container-high text-on-surface/40"
                      }`}
                    >
                      {weekdayInitials[i]}
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[0.6rem] font-bold uppercase tracking-[0.2em] text-on-surface/50 mb-2">
                    {tFields("startTime")}
                  </label>
                  <input
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/50 rounded-xl focus:outline-none focus:border-primary font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[0.6rem] font-bold uppercase tracking-[0.2em] text-on-surface/50 mb-2">
                    {tFields("room")}
                  </label>
                  <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer">
                    <span className="text-sm font-semibold">{room}</span>
                    <Icon name="expand_more" className="text-[16px] text-on-surface/40" />
                  </div>
                </div>
              </div>
            </section>

            <div className="border-t border-dashed border-on-surface/10" />

            {/* 03 Instructor */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-primary font-bold text-[0.7rem] uppercase tracking-widest">
                  03
                </span>
                <h3 className="font-headline font-bold text-lg">
                  {tSections("instructor")}
                </h3>
              </div>
              <div className="bg-surface-container-lowest border border-[#FAEEDA] rounded-2xl p-4 flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${instructor?.avatarGradient ?? "from-surface-container-high to-surface-container-high"} text-on-primary flex items-center justify-center font-headline font-bold shrink-0 relative`}
                >
                  {instructor
                    ? tInstructors(`${instructor.copyKey}.initials`)
                    : "—"}
                  {instructor?.verified && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center border-2 border-surface-container-lowest">
                      <span
                        className="material-symbols-outlined text-[10px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        verified
                      </span>
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-headline font-bold">
                    {instructor
                      ? tInstructors(`${instructor.copyKey}.name`)
                      : tStatus("notAssigned")}
                  </div>
                  {instructor && (
                    <div className="text-[0.7rem] text-on-surface/60 truncate">
                      {tInstructors(`${instructor.copyKey}.role`)} ·{" "}
                      {tInstructors(`${instructor.copyKey}.credential`)}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="text-[0.7rem] font-bold uppercase tracking-widest text-primary hover:underline"
                >
                  {tCommon("swap")}
                </button>
              </div>

              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="text-[0.6rem] font-bold uppercase tracking-widest text-on-surface/40">
                  {tEd("alsoQualified")}
                </span>
                {backupInstructors.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="flex items-center gap-1.5 bg-surface-container-high hover:bg-primary-fixed text-on-surface/70 hover:text-primary pl-1 pr-3 py-1 rounded-full text-xs font-medium transition-colors"
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-gradient-to-br ${p.avatarGradient} flex items-center justify-center text-[0.55rem] font-bold text-on-primary`}
                    >
                      {tInstructors(`${p.copyKey}.initials`)}
                    </div>
                    {tInstructors(`${p.copyKey}.name`)}
                  </button>
                ))}
              </div>
            </section>

            <div className="border-t border-dashed border-on-surface/10" />

            {/* 04 Pricing */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-primary font-bold text-[0.7rem] uppercase tracking-widest">
                  04
                </span>
                <h3 className="font-headline font-bold text-lg">{tSections("pricing")}</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[0.6rem] font-bold uppercase tracking-[0.2em] text-on-surface/50 mb-2">
                    {tFields("price")}
                  </label>
                  <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 flex items-center gap-2">
                    <span className="text-on-surface/40 font-semibold">€</span>
                    <input
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="flex-1 bg-transparent focus:outline-none font-semibold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[0.6rem] font-bold uppercase tracking-[0.2em] text-on-surface/50 mb-2">
                    {tFields("pricingModel")}
                  </label>
                  <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer">
                    <span className="text-sm font-semibold">
                      {tPricing(data.pricingModel as PricingModel)}
                    </span>
                    <Icon name="expand_more" className="text-[16px] text-on-surface/40" />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* preview */}
          <div className="bg-surface-container-high p-8">
            <div className="sticky top-0">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="visibility" className="text-[18px] text-primary" />
                <div className="text-[0.6rem] font-bold uppercase tracking-widest text-on-surface/60">
                  {tPreview("eyebrow")}
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-[1.5rem] overflow-hidden border border-[#FAEEDA] editorial-shadow flex flex-col mb-4">
                <div
                  className={`relative h-40 bg-gradient-to-br ${data.iconGradient}`}
                >
                  <span className="absolute top-4 left-4 bg-primary text-on-primary px-3 py-1 rounded-full text-[0.6rem] font-bold uppercase tracking-widest">
                    {levelLabel}
                  </span>
                </div>
                <div className="p-5 flex flex-col gap-2">
                  <h3 className="font-headline font-bold text-lg">{title}</h3>
                  <p className="text-sm text-on-surface/60">
                    {schedule} · {room}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-primary">€{price}/class</span>
                    <span className="bg-primary-fixed text-primary px-4 py-2 rounded-full font-semibold text-sm">
                      {tPreview("book")}
                    </span>
                  </div>
                </div>
              </div>

              {instructor && (
                <div className="bg-surface-container-lowest rounded-2xl p-4 border border-[#FAEEDA]">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${instructor.avatarGradient} text-on-primary flex items-center justify-center font-headline font-bold text-sm shrink-0`}
                    >
                      {tInstructors(`${instructor.copyKey}.initials`)}
                    </div>
                    <div className="text-xs">
                      <div className="text-[0.6rem] font-bold uppercase tracking-widest text-primary">
                        {tPreview("leadInstructor")}
                      </div>
                      <div className="font-bold">
                        {tInstructors(`${instructor.copyKey}.name`)}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-on-surface/5">
                    <div>
                      <div className="text-[0.6rem] font-bold uppercase tracking-widest text-on-surface/50">
                        {tPreview("duration")}
                      </div>
                      <div className="font-bold text-xs">
                        {tCommon("minutes", { count: data.durationMinutes })}
                      </div>
                    </div>
                    <div>
                      <div className="text-[0.6rem] font-bold uppercase tracking-widest text-on-surface/50">
                        {tPreview("level")}
                      </div>
                      <div className="font-bold text-xs">{levelLabel}</div>
                    </div>
                    <div>
                      <div className="text-[0.6rem] font-bold uppercase tracking-widest text-on-surface/50">
                        {tPreview("capacity")}
                      </div>
                      <div className="font-bold text-xs">{capacity}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
