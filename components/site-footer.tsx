export function SiteFooter() {
  return (
    <footer className="mt-20 bg-[#fff4e6] text-slate-700">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:flex md:items-start md:justify-between lg:px-8">
        <div className="col-span-2 md:col-span-1">
          <h3 className="text-lg font-bold text-slate-900">Hakuna</h3>
          <p className="mt-2 max-w-xs text-xs text-slate-500">
            The premium marketplace for discovering classes across all ages in The Bahamas.
          </p>
        </div>
        <div className="flex gap-10 sm:gap-12">
          <div className="space-y-3">
            <a className="block text-xs text-slate-500 transition hover:text-[#725DFF]" href="#">
              About Us
            </a>
            <a className="block text-xs text-slate-500 transition hover:text-[#725DFF]" href="#">
              Safety
            </a>
            <a className="block text-xs text-slate-500 transition hover:text-[#725DFF]" href="#">
              Partners
            </a>
          </div>
          <div className="space-y-3">
            <a className="block text-xs text-slate-500 transition hover:text-[#725DFF]" href="#">
              Help Center
            </a>
            <a className="block text-xs text-slate-500 transition hover:text-[#725DFF]" href="#">
              Terms of Service
            </a>
            <a className="block text-xs text-slate-500 transition hover:text-[#725DFF]" href="#">
              Privacy Policy
            </a>
          </div>
        </div>
        <div className="col-span-2 flex gap-3 md:col-span-1 md:justify-end">
          {["public", "photo_camera"].map((icon) => (
            <div
              key={icon}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-slate-200 text-slate-600 transition hover:bg-[#725DFF] hover:text-white"
            >
              <span className="material-symbols-rounded text-sm">{icon}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-7xl border-t border-slate-200 px-4 py-6 text-center sm:px-6 lg:px-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
          © {new Date().getFullYear()} Hakuna. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
