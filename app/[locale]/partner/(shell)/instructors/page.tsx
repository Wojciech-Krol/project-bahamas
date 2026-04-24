"use client";

import { useTranslations } from "next-intl";
import { Icon } from "../../../../components/Icon";
import InstructorCard, {
  InstructorInviteCard,
  InstructorInviteEmpty,
} from "../../../../components/partner/InstructorCard";
import {
  PARTNER_INSTRUCTORS,
  PARTNER_INVITED_INSTRUCTORS,
} from "../../../../lib/partnerMockData";

export default function PartnerInstructorsPage() {
  const t = useTranslations("Partner");
  const tIn = useTranslations("Partner.instructors");
  const tInvited = useTranslations("Partner.mock.instructors");

  return (
    <div className="p-8">
      <div className="flex items-end justify-between gap-6 mb-8 flex-wrap">
        <div>
          <span className="inline-block bg-primary-fixed/60 px-3 py-1 rounded-full text-[0.6rem] font-bold uppercase tracking-widest text-primary mb-3">
            {tIn("countBadge", { count: PARTNER_INSTRUCTORS.length })}
          </span>
          <h1 className="font-headline font-extrabold text-4xl tracking-tight">
            {tIn("title")} <span className="italic text-primary">{tIn("titleEmph")}</span>
          </h1>
        </div>
        <button
          type="button"
          className="bg-primary text-on-primary px-6 py-3 rounded-2xl font-headline uppercase tracking-widest text-[0.7rem] font-bold hover:bg-tertiary flex items-center gap-2 shrink-0"
        >
          <Icon name="person_add" className="text-[18px]" />
          {t("common.inviteInstructor")}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {PARTNER_INSTRUCTORS.map((i) => (
          <InstructorCard key={i.id} data={i} />
        ))}
        {PARTNER_INVITED_INSTRUCTORS.map((inv) => (
          <InstructorInviteCard
            key={inv.id}
            email={tInvited(`${inv.copyKey}.email`)}
            sentAgo={tInvited(`${inv.copyKey}.sentAgo`)}
          />
        ))}
        <InstructorInviteEmpty />
      </div>
    </div>
  );
}
