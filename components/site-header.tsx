import Link from "next/link";
import { Audience } from "@/lib/types";

const audienceHref: Record<Audience, string> = {
  kids: "/kids",
  teens: "/teens",
  adults: "/adults",
};

export function SiteHeader({ active }: { active?: Audience | "home" }) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold tracking-tight text-violet-700">
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
        <Link
          href="/discover"
          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
        >
          Browse Classes
        </Link>
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
