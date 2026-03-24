import Link from "next/link";
import { Audience } from "@/lib/types";

const tone: Record<Audience, { bg: string; accent: string; chip: string }> = {
  kids: { bg: "from-orange-100 to-amber-50", accent: "text-orange-700", chip: "bg-orange-200 text-orange-800" },
  teens: { bg: "from-slate-900 to-purple-900", accent: "text-cyan-300", chip: "bg-cyan-500/20 text-cyan-300" },
  adults: { bg: "from-emerald-50 to-white", accent: "text-emerald-700", chip: "bg-emerald-200 text-emerald-800" },
};

export function SegmentHero({
  audience,
  title,
  subtitle,
}: {
  audience: Audience;
  title: string;
  subtitle: string;
}) {
  const t = tone[audience];
  const dark = audience === "teens";
  return (
    <section className={`bg-gradient-to-br ${t.bg}`}>
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <div>
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${t.chip}`}>
            Hakuna {audience}
          </span>
          <h1 className={`mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl ${dark ? "text-white" : "text-slate-900"}`}>
            {title}
          </h1>
          <p className={`mt-4 max-w-xl text-lg ${dark ? "text-slate-200" : "text-slate-600"}`}>{subtitle}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white" href={`/discover?audience=${audience}`}>
              Explore Classes
            </Link>
            <Link className={`rounded-xl border px-5 py-2.5 text-sm font-semibold ${dark ? "border-white/30 text-white" : "border-slate-300 text-slate-700"}`} href="/discover">
              Open Map View
            </Link>
          </div>
        </div>
        <div className="relative hidden overflow-hidden rounded-3xl shadow-xl lg:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              audience === "kids"
                ? "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1400&q=80"
                : audience === "teens"
                ? "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1400&q=80"
                : "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1400&q=80"
            }
            alt={`${audience} hero`}
            className="h-[360px] w-full object-cover"
          />
          <div className="absolute bottom-4 left-4 rounded-xl bg-white/85 px-3 py-2 text-sm font-semibold text-slate-800">
            Hakuna standard
          </div>
        </div>
      </div>
    </section>
  );
}
