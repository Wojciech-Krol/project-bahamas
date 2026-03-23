import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function HomePage() {
  return (
    <main>
      <SiteHeader active="home" />
      <section className="bg-gradient-to-br from-violet-100 via-white to-orange-50">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <p className="inline-flex rounded-full bg-violet-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-violet-800">
              Curated Prism
            </p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Discover and enroll in classes for every stage of life.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-slate-600">
              Hakuna is a discovery-first marketplace for Sports, Arts, Tech, and Wellness. Browse by audience,
              compare options, and move from discovery to enrollment in minutes.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700" href="/discover">
                Open Discovery Map
              </Link>
              <Link className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50" href="/dashboard">
                View User Dashboard
              </Link>
            </div>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Platform Structure</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li>Phase 1: Landing hubs for Kids, Teens, Adults</li>
              <li>Phase 2: Discovery + Map and Class Details conversion flow</li>
              <li>Phase 3: User dashboard and Partner management dashboard</li>
            </ul>
          </div>
        </div>
      </section>
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { href: "/kids", title: "Hakuna Kids", copy: "Warm and playful classes curated for parent-led discovery." },
            { href: "/teens", title: "Hakuna Teens", copy: "High-energy experiences for ambitious, tech-savvy learners." },
            { href: "/adults", title: "Hakuna Adults", copy: "Refined workshops for wellness, mastery, and growth." },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.copy}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
