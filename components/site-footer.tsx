export function SiteFooter() {
  return (
    <footer className="mt-16 bg-slate-900 text-slate-300">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <h3 className="text-lg font-bold text-white">Hakuna</h3>
          <p className="mt-2 text-sm text-slate-400">
            Discovery-first marketplace for extracurricular growth.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-100">Platform</h4>
          <p className="mt-2 text-sm">Landing hubs, discovery map, enrollment, and dashboards.</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-100">Status</h4>
          <p className="mt-2 text-sm">Mock-data MVP, no database, App Router architecture.</p>
        </div>
      </div>
    </footer>
  );
}
