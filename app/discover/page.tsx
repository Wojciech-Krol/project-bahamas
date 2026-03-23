"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { classes } from "@/lib/mock-data";
import { Audience } from "@/lib/types";

export default function DiscoverPage() {
  const [audience, setAudience] = useState<Audience | "all">("all");
  const filtered = useMemo(
    () => classes.filter((c) => (audience === "all" ? true : c.audience === audience)),
    [audience]
  );

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto flex w-full max-w-[1400px] flex-col px-4 py-6 sm:px-6 lg:h-[calc(100vh-64px)] lg:flex-row lg:gap-4 lg:px-8">
        <div className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 lg:w-1/2">
          <div className="border-b border-slate-200 p-4">
            <h1 className="text-xl font-bold text-slate-900">Discovery & Map View</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["all", "kids", "teens", "adults"] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setAudience(a)}
                  className={
                    a === audience
                      ? "rounded-full bg-violet-600 px-4 py-1.5 text-sm font-semibold text-white"
                      : "rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                  }
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {filtered.map((item) => (
                <Link
                  key={item.id}
                  href={`/classes/${item.id}`}
                  className="block rounded-xl border border-slate-200 p-3 transition hover:border-violet-300 hover:bg-violet-50/40"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-violet-700">{item.category}</p>
                      <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                      <p className="text-xs text-slate-600">{item.location}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-700">${item.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 h-[420px] overflow-hidden rounded-2xl bg-slate-900 lg:mt-0 lg:h-full lg:w-1/2">
          <div className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,#7c3aed_0%,#111827_45%,#030712_100%)] p-4">
            <p className="text-sm font-semibold text-white">Interactive Map (Mock)</p>
            <p className="mt-1 text-xs text-slate-300">Price markers positioned from mock lat/lng values.</p>
            <div className="relative mt-4 h-[90%] rounded-xl border border-white/10 bg-white/5">
              {filtered.map((item, idx) => (
                <div
                  key={item.id}
                  className="absolute rounded-lg bg-violet-500 px-2 py-1 text-xs font-semibold text-white shadow-lg"
                  style={{
                    left: `${20 + ((idx * 13) % 62)}%`,
                    top: `${15 + ((idx * 17) % 68)}%`,
                  }}
                  title={item.title}
                >
                  ${item.price}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
