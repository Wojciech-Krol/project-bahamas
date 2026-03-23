import { SiteHeader } from "@/components/site-header";
import { classes, userEnrollments } from "@/lib/mock-data";

export default function PartnerDashboardPage() {
  return (
    <main>
      <SiteHeader />
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Partner / School Dashboard</h1>
        <p className="mt-2 text-slate-600">Track enrollments, class performance, and schedule operations.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Active Classes" value={String(classes.length)} />
          <Stat label="Total Enrollments" value={String(userEnrollments.length)} />
          <Stat label="Monthly Revenue (Mock)" value="$4,820" />
          <Stat label="Avg Rating" value="4.8" />
        </div>

        <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Class Operations</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="pb-2">Class</th>
                  <th className="pb-2">Audience</th>
                  <th className="pb-2">Instructor</th>
                  <th className="pb-2">Schedule</th>
                  <th className="pb-2">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classes.map((c) => (
                  <tr key={c.id}>
                    <td className="py-3 font-medium text-slate-900">{c.title}</td>
                    <td className="py-3 text-slate-700">{c.audience}</td>
                    <td className="py-3 text-slate-700">{c.instructor}</td>
                    <td className="py-3 text-slate-700">{c.schedule}</td>
                    <td className="py-3 text-slate-700">${c.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-violet-700">{value}</p>
    </div>
  );
}
