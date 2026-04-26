"use client";

/**
 * 7 × 24 CSS-grid occupancy heatmap. Opacity maps linearly to the
 * average occupancy rate for that (weekday, hour) bucket. No
 * recharts — a pure grid is cheaper, accessible, and visually
 * simpler than recharts' Treemap for this shape.
 *
 * Empty buckets (no sessions in the last 60 days at that slot)
 * render as a near-transparent cell — visually distinct from a 0%
 * occupancy cell (which is primary @ very low opacity).
 */

type Cell = {
  weekday: number; // 0..6 (0 = Sunday, matching JS getDay())
  hour: number; // 0..23
  occupancy: number; // 0..1 average rate over the window
  sessions: number; // 0 = empty bucket, render transparent
};

type Props = {
  title: string;
  subtitle?: string;
  emptyLabel: string;
  weekdayLabels: string[]; // length 7, index 0 = Sunday
  cells: Cell[];
};

export default function OccupancyHeatmap({
  title,
  subtitle,
  emptyLabel,
  weekdayLabels,
  cells,
}: Props) {
  const hasData = cells.some((c) => c.sessions > 0);

  // index into a 7*24 flat array — O(1) lookup in render.
  const byKey = new Map<string, Cell>();
  for (const c of cells) {
    byKey.set(`${c.weekday}:${c.hour}`, c);
  }

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const weekdays = Array.from({ length: 7 }, (_, i) => i);

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
      <div className="px-6 pb-6 overflow-x-auto no-scrollbar">
        {!hasData ? (
          <p className="text-on-surface/40 text-sm py-6 text-center">
            {emptyLabel}
          </p>
        ) : (
          <div className="min-w-[640px]">
            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: "56px repeat(24, 1fr)" }}
            >
              <div />
              {hours.map((h) => (
                <div
                  key={`hcol-${h}`}
                  className="text-[0.55rem] font-bold uppercase tracking-widest text-on-surface/40 text-center"
                >
                  {h % 3 === 0 ? `${h.toString().padStart(2, "0")}` : ""}
                </div>
              ))}

              {weekdays.map((w) => (
                <div key={`row-${w}`} className="contents">
                  <div className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface/60 flex items-center">
                    {weekdayLabels[w]}
                  </div>
                  {hours.map((h) => {
                    const cell = byKey.get(`${w}:${h}`);
                    const sessions = cell?.sessions ?? 0;
                    const occ = cell?.occupancy ?? 0;
                    // clamp + floor to 0.08 so an occupied slot is
                    // always visible even at 0% fill.
                    const opacity =
                      sessions === 0 ? 0.05 : Math.max(0.12, Math.min(1, occ));
                    const title = cell
                      ? `${Math.round(occ * 100)}% · ${sessions} sessions`
                      : "no sessions";
                    return (
                      <div
                        key={`cell-${w}-${h}`}
                        title={title}
                        className="h-5 rounded-sm"
                        style={{
                          background:
                            sessions === 0
                              ? "rgba(253, 249, 240, 1)"
                              : `rgba(180, 15, 85, ${opacity})`,
                          outline:
                            sessions === 0
                              ? "1px solid rgba(107, 74, 58, 0.08)"
                              : "none",
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
