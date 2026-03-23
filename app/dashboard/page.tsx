import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { classes, userEnrollments } from "@/lib/mock-data";

export default function UserDashboardPage() {
  const enrolled = userEnrollments.map((e) => ({
    ...e,
    classItem: classes.find((c) => c.id === e.classId),
  }));

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">User Dashboard</h1>
        <p className="mt-2 text-slate-600">Manage active classes, schedules, and recommendations.</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Active Enrollments</h2>
            <div className="mt-4 space-y-3">
              {enrolled.map((entry) => (
                <div key={entry.id} className="rounded-xl border border-slate-200 p-3">
                  <p className="text-sm font-semibold text-slate-900">{entry.classItem?.title}</p>
                  <p className="text-xs text-slate-600">{entry.studentName} • {entry.nextSession}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Recommended Next</h2>
            <div className="mt-4 space-y-2">
              {classes.slice(0, 3).map((c) => (
                <Link key={c.id} href={`/classes/${c.id}`} className="block rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                  {c.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
