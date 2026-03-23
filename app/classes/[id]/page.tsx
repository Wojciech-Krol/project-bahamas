import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { classes } from "@/lib/mock-data";

export default async function ClassDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = classes.find((c) => c.id === id);
  if (!item) notFound();

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.25fr_0.75fr] lg:px-8">
        <div className="space-y-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.image} alt={item.title} className="h-72 w-full rounded-3xl object-cover shadow-xl" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-700">{item.audience}</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{item.title}</h1>
            <p className="mt-3 text-slate-700">{item.longDescription}</p>
          </div>
          <div className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:grid-cols-2">
            <Info label="Instructor" value={item.instructor} />
            <Info label="Schedule" value={item.schedule} />
            <Info label="Duration" value={item.duration} />
            <Info label="Location" value={item.location} />
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Enrollment Flow (Mock)</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700">
              <li>Pick preferred schedule slot.</li>
              <li>Confirm participant details.</li>
              <li>Submit enrollment and add to calendar.</li>
            </ol>
          </div>
        </div>
        <aside className="space-y-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-600">Price</p>
            <p className="mt-1 text-3xl font-extrabold text-violet-700">${item.price}</p>
            <button className="mt-4 w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">
              Enroll Now
            </button>
            <button className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Add to Google Calendar
            </button>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Instructor Bio</h3>
            <p className="mt-2 text-sm text-slate-700">
              {item.instructor} is a certified coach with strong local community experience and a learner-first teaching style.
            </p>
          </div>
          <Link href="/discover" className="block text-sm font-semibold text-violet-700 hover:underline">
            Back to discovery
          </Link>
        </aside>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}
