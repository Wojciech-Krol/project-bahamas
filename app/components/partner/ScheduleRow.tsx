import { Icon } from "../Icon";
import { useTranslations } from "next-intl";

export type ScheduleRowProps = {
  time: string;
  durationMinutes: number;
  title: string;
  instructor: string;
  room: string;
  booked: number;
  capacity: number;
  waitlist?: number;
  accent: "primary" | "secondary";
};

export default function ScheduleRow({
  time,
  durationMinutes,
  title,
  instructor,
  room,
  booked,
  capacity,
  waitlist,
  accent,
}: ScheduleRowProps) {
  const t = useTranslations("Partner.common");
  const accentBar = accent === "primary" ? "bg-primary" : "bg-secondary";
  const timeColor = accent === "primary" ? "text-primary" : "text-secondary";
  const barColor = accent === "primary" ? "bg-primary" : "bg-secondary";
  const isFull = booked >= capacity;
  const pct = Math.min(100, Math.round((booked / capacity) * 100));

  return (
    <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-[1.25rem] hover:bg-primary-fixed/20 transition-colors cursor-pointer">
      <div className="flex flex-col items-center justify-center w-14 shrink-0">
        <div className={`text-[0.6rem] font-bold uppercase tracking-widest ${timeColor}`}>
          {time}
        </div>
        <div className="text-[0.55rem] text-on-surface/40">
          {t("minutes", { count: durationMinutes })}
        </div>
      </div>
      <div className={`w-1 h-10 rounded-full shrink-0 ${accentBar}`} />
      <div className="flex-1 min-w-0">
        <div className="font-headline font-bold truncate">{title}</div>
        <div className="text-[0.75rem] text-on-surface/60 flex items-center gap-2">
          <span className="flex items-center gap-1">
            <Icon name="person" className="text-[13px]" />
            {instructor}
          </span>
          <span className="text-on-surface/20">·</span>
          <span>{room}</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        {isFull ? (
          <>
            <div className="inline-flex items-center gap-1 bg-primary text-on-primary text-[0.6rem] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
              {t("full")}
            </div>
            <div className="text-[0.65rem] text-on-surface/50 mt-1">
              {waitlist
                ? t("waitlistCount", { booked, total: capacity, waitlist })
                : t("capacity", { booked, total: capacity })}
            </div>
          </>
        ) : (
          <>
            <div className="font-bold text-sm">
              {booked}
              <span className="text-on-surface/40">/{capacity}</span>
            </div>
            <div className="w-12 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
              <div className={`${barColor} h-full`} style={{ width: `${pct}%` }} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
