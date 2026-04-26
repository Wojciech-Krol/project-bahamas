import { Icon } from "../Icon";

type Props = {
  icon: string;
  tone: "primary" | "secondary" | "muted";
  title: string;
  sub: string;
};

const TONES: Record<Props["tone"], string> = {
  primary: "bg-primary-fixed text-primary",
  secondary: "bg-secondary-container text-on-secondary-container",
  muted: "bg-surface-container-high text-on-surface/60",
};

export default function ActionQueueItem({ icon, tone, title, sub }: Props) {
  return (
    <div className="flex gap-3 p-3 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer">
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${TONES[tone]}`}
      >
        <Icon name={icon} className="text-[18px]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-[0.7rem] text-on-surface/50">{sub}</div>
      </div>
      <Icon name="arrow_forward_ios" className="text-[18px] text-on-surface/30" />
    </div>
  );
}
