import Link from "next/link";
import { Audience } from "@/lib/types";

const audienceHref: Record<Audience, string> = {
  kids: "/kids",
  teens: "/teens",
  adults: "/adults",
};

export function SiteHeader({ active }: { active?: Audience | "home" }) {
  return (
    <header className="fixed top-0 z-50 w-full bg-[#fff9f2]/70 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-slate-900">
          Hakuna
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link className={navCls(active === "home")} href="/">
            Explore
          </Link>
          {(["kids", "teens", "adults"] as Audience[]).map((a) => (
            <Link key={a} className={navCls(active === a)} href={audienceHref[a]}>
              {capitalize(a)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <label className="hidden items-center gap-2 rounded-lg bg-[#fff4e6] px-3 py-2 sm:flex">
            <span className="material-symbols-rounded text-sm text-slate-500">search</span>
            <input
              className="w-28 bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 lg:w-40"
              placeholder="Find a class..."
              type="text"
            />
          </label>
          <button className="rounded-lg px-3 py-2 text-sm font-bold text-[#725DFF] transition hover:bg-slate-100/60">
            Sign In
          </button>
          <Link
            href="/discover"
            className="rounded-lg bg-[#553ce2] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#6f59fc]"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

function navCls(active: boolean) {
  return active
    ? "border-b-2 border-violet-600 pb-1 text-sm font-semibold text-violet-700"
    : "text-sm font-medium text-slate-600 hover:text-slate-900";
}

function capitalize(v: string) {
  return v.charAt(0).toUpperCase() + v.slice(1);
}
