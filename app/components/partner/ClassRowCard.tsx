"use client";

import { useTranslations } from "next-intl";
import { Link } from "../../../src/i18n/navigation";
import { Icon } from "../Icon";
import type { PartnerClassBase }  from "@/src/lib/partnerMockData";
import { instructorById }  from "@/src/lib/partnerMockData";

type Props = {
  data: PartnerClassBase;
};

function formatPrice(price: number, currency: string): string {
  if (currency === "EUR") return `€${price}`;
  if (currency === "GBP") return `£${price}`;
  if (currency === "PLN") return `${price} zł`;
  return `${price}`;
}

export default function ClassRowCard({ data }: Props) {
  const t = useTranslations("Partner");
  const tClasses = useTranslations("Partner.classes.row");
  const tMockClasses = useTranslations("Partner.mock.classes");
  const tMockInstructors = useTranslations("Partner.mock.instructors");
  const tCommon = useTranslations("Partner.common");

  const title = tMockClasses(`${data.copyKey}.title`);
  const schedule = tMockClasses(`${data.copyKey}.schedule`);
  const room = tMockClasses(`${data.copyKey}.room`);
  const instructor = instructorById(data.primaryInstructorId);
  const instructorName = instructor
    ? tMockInstructors(`${instructor.copyKey}.name`)
    : t("status.notAssigned");

  const levelLabel = (() => {
    // accept "Partner.status.levelAll" OR "Partner.mock.classes.kidsLab.ageLabel"
    const key = data.levelLabelKey.replace(/^Partner\./, "");
    return t(key);
  })();

  const border = data.needsInstructor ? "border-2 border-primary/30" : "border border-[#FAEEDA]";
  const isFull = data.booked >= data.capacity;

  return (
    <div
      className={`bg-surface-container-lowest rounded-[1.5rem] ${border} editorial-shadow p-4 flex items-center gap-5 hover:scale-[1.005] transition-transform relative`}
    >
      {data.needsInstructor && (
        <div className="absolute -top-2 left-6 bg-primary text-on-primary px-3 py-0.5 rounded-full text-[0.6rem] font-bold uppercase tracking-widest flex items-center gap-1">
          <Icon name="priority_high" className="text-[12px]" />
          {t("status.needsInstructor")}
        </div>
      )}

      <div
        className={`w-20 h-20 rounded-2xl overflow-hidden shrink-0 relative bg-gradient-to-br ${data.iconGradient}`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon name={data.icon} className={`text-[28px] ${data.iconColor}`} />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h3 className="font-headline font-bold text-lg truncate">{title}</h3>
          <span className="text-[0.6rem] font-bold uppercase tracking-widest bg-primary-fixed text-primary px-2 py-0.5 rounded-full shrink-0">
            {levelLabel}
          </span>
          {data.tag && (
            <span className="text-[0.6rem] font-bold uppercase tracking-widest bg-primary text-on-primary px-2 py-0.5 rounded-full shrink-0">
              {t(`status.tag${data.tag.charAt(0).toUpperCase() + data.tag.slice(1)}`)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-[0.75rem] text-on-surface/60 flex-wrap">
          <span className="flex items-center gap-1">
            <Icon name="schedule" className="text-[14px]" />
            {schedule}
          </span>
          <span className="flex items-center gap-1">
            <Icon name="place" className="text-[14px]" />
            {room}
          </span>
          <span
            className={`flex items-center gap-1 ${data.needsInstructor ? "text-primary font-semibold" : ""}`}
          >
            <Icon
              name={data.needsInstructor ? "person_off" : "person"}
              className="text-[14px]"
            />
            {instructorName}
          </span>
          <span className="flex items-center gap-1">
            <Icon name="timer" className="text-[14px]" />
            {tCommon("minutes", { count: data.durationMinutes })}
          </span>
        </div>
      </div>

      <div className="text-right shrink-0">
        <div className="font-headline font-bold">
          {formatPrice(data.price, data.currency)}
        </div>
        <div className="text-[0.65rem] text-on-surface/50 uppercase tracking-widest">
          {tClasses("perClass")}
        </div>
      </div>

      <div className="text-right shrink-0 w-24">
        <div className="text-[0.65rem] text-on-surface/50 uppercase tracking-widest mb-1">
          {tClasses("nextSession")}
        </div>
        <div className={`font-bold text-sm ${isFull ? "text-primary" : ""}`}>
          {data.booked}/{data.capacity}
          {data.waitlist ? (
            <span className="text-[0.65rem] font-normal text-on-surface/40">
              {" "}
              (+{data.waitlist})
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex gap-1 shrink-0">
        {data.needsInstructor ? (
          <Link
            href={`/partner/classes/${data.id}`}
            className="bg-primary text-on-primary px-4 py-2 rounded-full text-[0.65rem] font-bold uppercase tracking-widest whitespace-nowrap"
          >
            {tCommon("assign")}
          </Link>
        ) : (
          <>
            <button
              type="button"
              title={tCommon("duplicate")}
              className="w-9 h-9 rounded-full bg-surface-container-low hover:bg-primary-fixed text-on-surface/60 hover:text-primary flex items-center justify-center transition-colors"
            >
              <Icon name="content_copy" className="text-[18px]" />
            </button>
            <Link
              href={`/partner/classes/${data.id}`}
              title={tCommon("edit")}
              className="w-9 h-9 rounded-full bg-surface-container-low hover:bg-primary-fixed text-on-surface/60 hover:text-primary flex items-center justify-center transition-colors"
            >
              <Icon name="edit" className="text-[18px]" />
            </Link>
            <button
              type="button"
              title={tCommon("more")}
              className="w-9 h-9 rounded-full bg-surface-container-low hover:bg-primary-fixed text-on-surface/60 hover:text-primary flex items-center justify-center transition-colors"
            >
              <Icon name="more_horiz" className="text-[18px]" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
