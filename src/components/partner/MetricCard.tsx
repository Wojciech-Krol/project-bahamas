import type { ReactNode } from "react";
import { Icon } from "../Icon";

type Props = {
  eyebrow: string;
  icon: string;
  iconTone?: "primary" | "secondary";
  value: string;
  delta?: { text: string; positive?: boolean; muted?: boolean };
  children?: ReactNode;
};

export default function MetricCard({
  eyebrow,
  icon,
  iconTone = "primary",
  value,
  delta,
  children,
}: Props) {
  const iconCls =
    iconTone === "primary"
      ? "bg-primary-fixed text-primary"
      : "bg-secondary-container text-on-secondary-container";

  const deltaCls = delta?.muted
    ? "text-on-surface/40"
    : delta?.positive
      ? "text-green-700"
      : "text-error";

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-5 border border-[#FAEEDA] editorial-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[0.6rem] font-bold uppercase tracking-widest text-on-surface/50">
          {eyebrow}
        </span>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${iconCls}`}
        >
          <Icon name={icon} className="text-[16px]" />
        </div>
      </div>
      <div className="flex items-baseline gap-2 mb-3">
        <div className="font-headline font-extrabold text-3xl">{value}</div>
        {delta && <div className={`text-sm font-bold ${deltaCls}`}>{delta.text}</div>}
      </div>
      {children}
    </div>
  );
}
