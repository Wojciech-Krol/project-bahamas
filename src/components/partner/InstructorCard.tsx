"use client";

import { useTranslations } from "next-intl";
import { Icon } from "../Icon";
import type { PartnerInstructorBase }  from "@/src/lib/partnerMockData";

export default function InstructorCard({ data }: { data: PartnerInstructorBase }) {
  const tInst = useTranslations("Partner.mock.instructors");
  const tStats = useTranslations("Partner.instructors.cardStats");
  const tCommon = useTranslations("Partner.common");

  const name = tInst(`${data.copyKey}.name`);
  const initials = tInst(`${data.copyKey}.initials`);
  const role = tInst(`${data.copyKey}.role`);
  const specialties = tInst.raw(`${data.copyKey}.specialties`) as string[];

  const paletteForSpecialty = (i: number) =>
    i === 0
      ? "bg-primary-fixed/60 text-primary"
      : "bg-primary-fixed/60 text-primary";

  const firstSpecialtyAccent =
    data.copyKey === "noa"
      ? "bg-secondary-container text-on-secondary-container"
      : "bg-primary-fixed/60 text-primary";

  return (
    <div className="bg-surface-container-lowest rounded-[1.5rem] p-6 border border-[#FAEEDA] editorial-shadow hover:scale-[1.02] transition-transform">
      <div className="relative w-20 h-20 mx-auto mb-4">
        <div
          className={`w-20 h-20 rounded-full bg-gradient-to-br ${data.avatarGradient} text-on-primary flex items-center justify-center font-headline font-extrabold text-2xl`}
        >
          {initials}
        </div>
        {data.verified && (
          <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center border-4 border-surface-container-lowest">
            <span
              className="material-symbols-outlined text-[14px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
          </span>
        )}
      </div>

      <h3 className="font-headline font-bold text-center">{name}</h3>
      <p className="text-[0.7rem] text-on-surface/60 text-center mb-4">{role}</p>

      <div className="flex flex-wrap gap-1.5 justify-center mb-4">
        {specialties.map((s, i) => (
          <span
            key={s}
            className={`px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase tracking-widest ${i === 0 ? firstSpecialtyAccent : paletteForSpecialty(i)}`}
          >
            {s}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-on-surface/5 mb-4 text-center">
        <div>
          <div className="font-headline font-bold text-sm">{data.classCount}</div>
          <div className="text-[0.55rem] text-on-surface/50 uppercase tracking-widest">
            {tStats("classes")}
          </div>
        </div>
        <div>
          <div className="font-headline font-bold text-sm">{data.rating.toFixed(1)}</div>
          <div className="text-[0.55rem] text-on-surface/50 uppercase tracking-widest">
            {tStats("rating")}
          </div>
        </div>
        <div>
          <div className="font-headline font-bold text-sm">{data.studentCount}</div>
          <div className="text-[0.55rem] text-on-surface/50 uppercase tracking-widest">
            {tStats("students")}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className="flex-1 bg-primary-fixed text-primary py-2 rounded-full text-[0.65rem] font-bold uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-colors"
        >
          {tCommon("edit")}
        </button>
        <button
          type="button"
          className="flex-1 bg-surface-container-low text-on-surface/70 py-2 rounded-full text-[0.65rem] font-bold uppercase tracking-widest hover:bg-surface-container transition-colors"
        >
          {tCommon("schedule")}
        </button>
      </div>
    </div>
  );
}

export function InstructorInviteCard({
  email,
  sentAgo,
}: {
  email: string;
  sentAgo: string;
}) {
  const t = useTranslations("Partner");
  const tCommon = useTranslations("Partner.common");
  const tInstructors = useTranslations("Partner.instructors");

  return (
    <div className="bg-surface-container-lowest rounded-[1.5rem] p-6 border border-dashed border-outline-variant relative">
      <div className="absolute top-4 right-4 bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full text-[0.55rem] font-bold uppercase tracking-widest">
        {t("status.invited")}
      </div>
      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-surface-container-high flex items-center justify-center">
        <Icon name="schedule_send" className="text-[36px] text-on-surface/30" />
      </div>
      <h3 className="font-headline font-bold text-center text-on-surface/70 truncate">
        {email}
      </h3>
      <p className="text-[0.7rem] text-on-surface/40 text-center mb-4">
        {tInstructors("inviteSentAgo", { age: sentAgo })}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          className="flex-1 bg-surface-container-low text-on-surface/70 py-2 rounded-full text-[0.65rem] font-bold uppercase tracking-widest"
        >
          {tCommon("resend")}
        </button>
        <button
          type="button"
          className="flex-1 text-on-surface/50 py-2 rounded-full text-[0.65rem] font-bold uppercase tracking-widest hover:text-error"
        >
          {tCommon("revoke")}
        </button>
      </div>
    </div>
  );
}

export function InstructorInviteEmpty() {
  const tInstructors = useTranslations("Partner.instructors");
  return (
    <button
      type="button"
      className="bg-surface-container-low rounded-[1.5rem] p-6 border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary-fixed/20 transition-colors flex flex-col items-center justify-center text-center cursor-pointer min-h-[380px] w-full"
    >
      <div className="w-16 h-16 rounded-full bg-primary-fixed text-primary flex items-center justify-center mb-4">
        <Icon name="person_add" className="text-[28px]" />
      </div>
      <h3 className="font-headline font-bold mb-1">
        {tInstructors("inviteCtaTitle")}
      </h3>
      <p className="text-[0.75rem] text-on-surface/60 max-w-[200px]">
        {tInstructors("inviteCtaSub")}
      </p>
    </button>
  );
}
