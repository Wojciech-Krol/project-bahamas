"use client";

/**
 * Trio of revenue stat cards (30d / 90d / YTD) for the partner
 * overview. Matches the existing `MetricCard` visual vocabulary —
 * surface-container-lowest surface, editorial-shadow, primary
 * pink eyebrow. Values are pre-formatted PLN strings from the
 * server component so this module stays locale-free.
 */

import { Icon } from "@/app/components/Icon";

type Range = {
  label: string;
  value: string;
  net: string;
};

type Props = {
  title: string;
  netLabel: string;
  thirtyDay: Range;
  ninetyDay: Range;
  ytd: Range;
};

function Card({ range, netLabel }: { range: Range; netLabel: string }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-5 border border-[#FAEEDA] editorial-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[0.6rem] font-bold uppercase tracking-widest text-on-surface/50">
          {range.label}
        </span>
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary-fixed text-primary">
          <Icon name="payments" className="text-[16px]" />
        </div>
      </div>
      <div className="font-headline font-extrabold text-3xl mb-1">
        {range.value}
      </div>
      <div className="text-sm text-on-surface/60">
        {netLabel}: <span className="font-bold text-on-surface/80">{range.net}</span>
      </div>
    </div>
  );
}

export default function RevenueCards({
  title,
  netLabel,
  thirtyDay,
  ninetyDay,
  ytd,
}: Props) {
  return (
    <section aria-label={title} className="space-y-3">
      <h2 className="font-headline font-bold text-xl tracking-tight">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card range={thirtyDay} netLabel={netLabel} />
        <Card range={ninetyDay} netLabel={netLabel} />
        <Card range={ytd} netLabel={netLabel} />
      </div>
    </section>
  );
}
