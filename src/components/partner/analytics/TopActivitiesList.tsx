"use client";

/**
 * Top activities by confirmed revenue. Ranked list with inline
 * bars; no recharts — a single CSS gradient bar per row keeps
 * the render cost trivial and the visual consistent with
 * `MetricCard` + `FillBar` elsewhere in the partner shell.
 */

export type TopActivityRow = {
  activityId: string;
  title: string;
  amount: string; // pre-formatted currency
  bookings: number;
  shareOfMax: number; // 0..1 relative to the #1 row
};

type Props = {
  title: string;
  subtitle?: string;
  emptyLabel: string;
  bookingsLabel: string;
  rows: TopActivityRow[];
};

export default function TopActivitiesList({
  title,
  subtitle,
  emptyLabel,
  bookingsLabel,
  rows,
}: Props) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-[#FAEEDA] editorial-shadow overflow-hidden">
      <div className="p-6 pb-4">
        <span className="text-[0.6rem] font-bold uppercase tracking-widest text-primary">
          {subtitle ?? title}
        </span>
        <h3 className="font-headline font-bold text-2xl tracking-tight">
          {title}
        </h3>
      </div>
      <div className="px-6 pb-6 space-y-4">
        {rows.length === 0 ? (
          <p className="text-on-surface/40 text-sm py-6 text-center">
            {emptyLabel}
          </p>
        ) : (
          rows.map((row, idx) => (
            <div key={row.activityId} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-7 h-7 shrink-0 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-on-surface truncate">
                    {row.title}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-headline font-bold text-on-surface">
                    {row.amount}
                  </div>
                  <div className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface/50">
                    {bookingsLabel}: {row.bookings}
                  </div>
                </div>
              </div>
              <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{
                    width: `${Math.max(4, Math.round(row.shareOfMax * 100))}%`,
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
