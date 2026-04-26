"use client";

/**
 * 30-day confirmed-bookings trend. recharts AreaChart in a single
 * color (brand primary pink) with a soft gradient fill — keeps the
 * viz inside the existing Tailwind token palette rather than
 * introducing a second color axis.
 *
 * SSR gotcha: recharts uses `ResponsiveContainer` which measures
 * the DOM on mount, so this module is a client component. The
 * parent server page renders an empty-state placeholder if the
 * series is empty — we never hand recharts a zero-width container.
 */

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type BookingsTrendPoint = {
  day: string; // ISO yyyy-mm-dd
  count: number;
};

type Props = {
  title: string;
  subtitle?: string;
  emptyLabel: string;
  tooltipLabel: string;
  data: BookingsTrendPoint[];
};

export default function BookingsTrendChart({
  title,
  subtitle,
  emptyLabel,
  tooltipLabel,
  data,
}: Props) {
  const hasData = data.some((d) => d.count > 0);

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-[#FAEEDA] editorial-shadow overflow-hidden">
      <div className="p-6 pb-2">
        <span className="text-[0.6rem] font-bold uppercase tracking-widest text-primary">
          {subtitle ?? title}
        </span>
        <h3 className="font-headline font-bold text-2xl tracking-tight">
          {title}
        </h3>
      </div>
      <div className="px-4 pb-6 pt-2" style={{ height: 260 }}>
        {!hasData ? (
          <div className="h-full w-full flex items-center justify-center text-on-surface/40 text-sm">
            {emptyLabel}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
              <defs>
                <linearGradient id="bookingsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#b40f55" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#b40f55" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#FAEEDA" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: "#6B4A3A", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "#FAEEDA" }}
                minTickGap={24}
                tickFormatter={(iso: string) => iso.slice(5)}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#6B4A3A", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "#FAEEDA" }}
                width={28}
              />
              <Tooltip
                contentStyle={{
                  background: "#fdf9f0",
                  border: "1px solid #FAEEDA",
                  borderRadius: 12,
                  fontFamily: "inherit",
                }}
                formatter={(value) => [value as number, tooltipLabel]}
                labelFormatter={(label) => String(label)}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#b40f55"
                strokeWidth={2}
                fill="url(#bookingsFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
