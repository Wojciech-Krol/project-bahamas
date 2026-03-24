import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Dashboard | Hakuna",
  description: "Manage your classes, schedule, and learning progress on Hakuna.",
};

export default function UserDashboardPage() {
  return (
    <div className="bg-[#f7f9ff] text-[#181c21] font-sans min-h-screen">
      {/* Sidebar */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-slate-50 flex flex-col p-4 space-y-2 z-40 hidden md:flex">
        <div className="mb-8 px-4">
          <h1 className="text-2xl font-extrabold text-[#725DFF]" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Hakuna</h1>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Class Marketplace</p>
        </div>
        <nav className="flex-1 space-y-1">
          {[
            { icon: "school", label: "My Classes", active: true },
            { icon: "calendar_month", label: "Calendar" },
            { icon: "person", label: "Profile" },
            { icon: "settings", label: "Settings" },
          ].map(({ icon, label, active }) => (
            <Link key={label} href="#" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold cursor-pointer transition-all hover:translate-x-1 ${active ? "text-[#725DFF] bg-[#725DFF]/10" : "text-slate-500 hover:text-slate-900"}`}>
              <span className="material-symbols-outlined">{icon}</span>
              <span style={{ fontFamily: "var(--font-plus-jakarta)" }} className="font-medium">{label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-4">
          <Link href="/discover" className="w-full bg-gradient-to-r from-[#553ce2] to-[#6f59fc] text-white py-3 rounded-full font-bold shadow-lg shadow-[#553ce2]/20 flex items-center justify-center gap-2 active:scale-95 transition-all text-sm" style={{ fontFamily: "var(--font-plus-jakarta)" }}>
            Explore Classes
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-500 transition-colors">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-medium" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 min-h-screen pb-20 md:pb-0">
        {/* Top App Bar */}
        <header className="fixed top-0 right-0 left-0 md:left-64 z-50 bg-white/70 backdrop-blur-xl flex justify-between items-center px-6 py-3 shadow-sm shadow-black/5">
          <div className="flex items-center gap-8">
            <div className="md:hidden text-xl font-bold tracking-tight text-[#725DFF]" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Hakuna</div>
            <div className="hidden lg:flex items-center gap-6">
              {["Explore", "Kids", "Teens", "Adults"].map((label, i) => (
                <Link key={label} href={i === 0 ? "/discover" : `/${label.toLowerCase()}`} className={`text-sm ${i === 0 ? "text-[#725DFF] font-semibold" : "text-slate-600 hover:text-[#725DFF]"}`} style={{ fontFamily: "var(--font-plus-jakarta)" }}>{label}</Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {["notifications", "chat_bubble", "help_outline"].map(icon => (
                <button key={icon} className="p-2 rounded-full hover:bg-slate-100/50 transition-colors text-slate-600">
                  <span className="material-symbols-outlined">{icon}</span>
                </button>
              ))}
            </div>
            <div className="w-10 h-10 rounded-full bg-[#553ce2]/20 border-2 border-[#553ce2]/20 flex items-center justify-center text-[#553ce2] font-bold text-sm">JD</div>
          </div>
        </header>

        {/* Page Content */}
        <div className="pt-24 px-6 md:px-10 max-w-7xl mx-auto space-y-12">
          {/* Welcome */}
          <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#181c21] tracking-tight" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Welcome back, Alex!</h2>
              <p className="text-[#4d616c] mt-1 font-medium">You have 3 classes today. Ready to learn?</p>
            </div>
            <div className="flex gap-2">
              <div className="bg-[#f1f4fb] px-4 py-2 rounded-xl flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#553ce2] animate-pulse" />
                <span className="text-sm font-bold text-[#181c21]">Next Class: Piano Theory (14:00)</span>
              </div>
            </div>
          </section>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Active Classes */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold" style={{ fontFamily: "var(--font-plus-jakarta)" }}>My Active Classes</h3>
                <Link href="#" className="text-[#553ce2] font-semibold text-sm hover:underline">View All</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDe6ebyCJEpr7j1qsbcX5aNSsxlWbwORdnhUMLZ0P0ARPxWh1_juNDQHDKovjvRmkEPhE1R50JViq0cE1I4iVgP8i3JL8DxO7J-pGO4IISk62JMy2EWf9Hp_87t1j1JXwXFHK0rkDf6RFIKQ21lX3QRIzTN3kJGyX_hdDIoY477LG-IWn167bOm6-FRw7GrenhYGYCZcLXht8Iv54_XWvnNipdEszjpcTEBWdmYum1h9Zn-qXdb7J35lOpt9AFAds8Px6-LM934Tns", level: "Advanced", title: "Piano Theory & Composition", instructor: "Sarah Jenkins", progress: 75, time: "Today, 14:00" },
                  { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2Y3SJ3AnlfY6BHRshlubFBVfNbTYvqbytUzVisdqGU1Z_1sbbK5wFxfflWrT3JAaduUYT36SZ8B3XY6Wphc4cRkns-Xqk5nC74vTo8U6ADkKx5mCSBmnwJgTbOYab_BhiB9Mah_Pfggy4dDXDPEcrQS-qkBXnNXYJPVSukzypfIFaYNS3pC4Eac1QSB8FvX1J7svXAbwDfqswJhPBMFvAQPYs6vadCVMcuKTlZKqxsRwUwRyXRGgkzfLgAGDaaMDOeJZh-3eiqNM", level: "Intermediate", title: "Intro to React Architecture", instructor: "Michael Chen", progress: 42, time: "Wed, 10:30" },
                ].map(({ img, level, title, instructor, progress, time }) => (
                  <div key={title} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="relative h-40 overflow-hidden">
                      <img alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src={img} />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-[#553ce2]">{level}</div>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <h4 className="text-lg font-bold" style={{ fontFamily: "var(--font-plus-jakarta)" }}>{title}</h4>
                        <p className="text-sm text-[#4d616c] font-medium">Instructor: {instructor}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-2 w-full bg-[#e5e8ef] rounded-full overflow-hidden">
                          <div className="h-full bg-[#553ce2] rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2 text-slate-600">
                          <span className="material-symbols-outlined text-lg">schedule</span>
                          <span className="text-sm font-medium">{time}</span>
                        </div>
                        <button className="text-[#553ce2] p-2 rounded-lg bg-[#553ce2]/5 hover:bg-[#553ce2]/10 transition-colors">
                          <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommended */}
              <div className="pt-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Recommended for You</h3>
                  <div className="flex gap-2">
                    {["chevron_left", "chevron_right"].map(icon => (
                      <button key={icon} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-[#553ce2] transition-colors">
                        <span className="material-symbols-outlined text-sm">{icon}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar">
                  {[
                    { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIrYRGbE1fmI6ZMC-gQc3omYW3VuZLP30VyYn3ItrA_eX4IqjATR0YWkMF3wfBl8rwlHLgM34z7I1wNxCorcTAAPcQxrW18q21cbRarWkc92YdamehJZESJta0zKkU_83QenkG1krWNuHRgVoNFCxDA59roC-ohLIb92azU9wlSkJKplysH4dUBhzYhnY09G2CltUpvR7qasdAQ1_-stTe3e3J-J1dieGr-AX1ijW9L_UvBD86m-tBjtcBJ9piPFpCu6h04jJs2Xs", title: "Mindful Vinyasa Flow", sub: "Ages 18+ • 60 mins" },
                    { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBvLrJRDfnTQryeJ0BlzYDs9x5oZF7gNxI8GxUCQRMVbMubYQWmvG8VL3zBNst-VbbhLYprTyAVA7rgOIglB5Y-x0xmly2Gs7nB-YlA_adPi981EllbEgERWvHfdDXioOXxg_g2AUlP2U8-eg8cQVMmbTgUABm4tAswLKy3AlFFc4bF01hugGh5on9PYMPg1vLnLlGh4ah9QJV3hMtlFmd2EMfQu3ZXK7PUZQmfpAKUdSfk_tLVdQh1-jCo4riLCOZJyZZn4BL4mYQ", title: "Mastering Public Speaking", sub: "Teens & Adults • 45 mins" },
                    { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBzJPT5J6Ry0nDsNvrBHNShKbobNn8oUxczQNWL7DXxTq9qagOeLK9nMK9dd7WJTh_YqX8fd_I5bXOPBEpPpOwNHn21PvWHkZwKmMGfsUK_Vura4d0gu84wA14NZ2ni6do0AdigmKegzwKYikhH520QAiMQjCJdT_kwzJpiNab996kJqy-b43tkjQTDEQaGS7B5fPoxVCqJlX9XjWYKnhGYc6iU6HJjrQwXZIhYUeZyXpVCW5dVAg3F_SuX1PrSeaAj_RkXb02cG18", title: "Contemporary Oil Painting", sub: "All Ages • 90 mins" },
                  ].map(({ img, title, sub }) => (
                    <div key={title} className="flex-none w-64 bg-[#f1f4fb] rounded-xl p-4 space-y-3">
                      <img alt={title} className="w-full h-32 object-cover rounded-lg" src={img} />
                      <div>
                        <h5 className="font-bold text-[#181c21] truncate" style={{ fontFamily: "var(--font-plus-jakarta)" }}>{title}</h5>
                        <p className="text-xs text-[#4d616c]">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Schedule Panel */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#f1f4fb] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-plus-jakarta)" }}>This Week&apos;s Schedule</h3>
                  <button className="p-2 bg-white rounded-lg shadow-sm">
                    <span className="material-symbols-outlined text-[#553ce2]">calendar_today</span>
                  </button>
                </div>
                <div className="space-y-6">
                  {(
                    [
                      { day: "Today, Oct 14", active: true, items: [{ time: "14:00 - 15:30", title: "Piano Theory" }, { time: "17:00 - 18:00", title: "Spanish Conversation", dimmed: true }] },
                      { day: "Wed, Oct 16", active: false, items: [{ time: "10:30 - 12:00", title: "React Architecture" }] },
                      { day: "Sat, Oct 19", active: false, items: [{ time: "09:00 - 11:00", title: "Workshop: Portrait Photography", special: true }] },
                    ] as Array<{ day: string; active: boolean; items: Array<{ time: string; title: string; dimmed?: boolean; special?: boolean }> }>
                  ).map(({ day, active, items }) => (
                    <div key={day} className={`relative pl-6 border-l-2 ${active ? "border-[#553ce2]/20" : "border-slate-200"}`}>
                      <div className={`absolute -left-[5px] top-0 w-2 h-2 rounded-full ${active ? "bg-[#553ce2]" : "bg-slate-300"}`} />
                      <span className={`text-xs font-bold uppercase mb-2 block ${active ? "text-[#553ce2]" : "text-slate-500"}`}>{day}</span>
                      <div className="space-y-2">
                        {items.map(({ time, title, dimmed, special }) => (
                          <div key={title} className={`${special ? "bg-[#e31c40]/10" : "bg-white"} p-3 rounded-xl ${dimmed ? "opacity-60" : ""}`}>
                            <p className={`text-xs font-semibold ${special ? "text-[#ba002e]" : "text-[#4d616c]"}`}>{time}</p>
                            <h5 className="text-sm font-bold text-[#181c21]">{title}</h5>
                            {special && <span className="text-[10px] bg-[#e31c40] text-white px-2 py-0.5 rounded-full mt-1 inline-block">Special Event</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-8 py-3 text-sm font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Full Calendar View</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Hours Learned", value: "24.5", change: "+2.1", changeColor: "text-[#553ce2]" },
                  { label: "Certificates", value: "4", change: "Total", changeColor: "text-[#4d616c]" },
                ].map(({ label, value, change, changeColor }) => (
                  <div key={label} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <span className="text-xs font-bold text-slate-500 uppercase">{label}</span>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-2xl font-black text-[#181c21]">{value}</span>
                      <span className={`text-xs font-bold ${changeColor}`}>{change}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg px-6 py-3 flex justify-between items-center z-50 border-t border-slate-100">
        {[
          { icon: "school", label: "Classes", active: true },
          { icon: "explore", label: "Explore" },
          { icon: "calendar_month", label: "Calendar" },
          { icon: "person", label: "Profile" },
        ].map(({ icon, label, active }) => (
          <Link key={label} href="#" className={`flex flex-col items-center gap-1 ${active ? "text-[#725DFF]" : "text-slate-400"}`}>
            <span className="material-symbols-outlined" style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>{icon}</span>
            <span className="text-[10px] font-bold">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
