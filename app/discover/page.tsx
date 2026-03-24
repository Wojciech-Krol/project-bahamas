import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hakuna | Discover & Map View",
  description: "Explore and discover classes near you with our interactive map view. Filter by age, category, and price.",
};

const classes = [
  { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_SJG0k43A64nUIfIn4kMjtyqUGzizOQDYrOSNovG0vdn7XiC42YpPwdZ8eLTFenvJu-qPOgMEdWYwlXWehi3dTo5UiwOhIKweW9vs26DyLl9YTC2DYO8IotfrjHvmrDae__qDEpNsdI602WL0p8s4GUlxDnvTKvBsny8Mn-iJdrE-M3Lhp2daeLufN1h6uBogWseYYiiNuBRsl8NZndxTJfQAaqUmL5Ypfup1zNQj8Z_w5ir9HRINQespS7fay3i0diIUWRjUa0c", cat: "Dance", title: "Modern Contemporary Dance", location: "Downtown Arts District", rating: "4.9", price: "$25" },
  { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBxl4bd3wm-ZvxI-fGmnibPkJrTgOaVf0-oALNPcZFszwcVqfNO-sYWAJXyr1huLRtmOANIA9PjDU6hH1e0wUX-rhJgQyaq5cKBWlOiXlakPCQa3veQGQeY2XDKK3DxuP-C7DDtpnKq5VANGZADmfMqhUxI5pPR81Z0kkFK17oM3Qkz8gy6-_KtQb_Xl3qayYT_smaOrR2mntkDQBY4F_OxbZy-Hwp1OaQWsj9_GsbVKtL2TSjWHDf_LSYAI2oAhFpK4OdfIhswH9s", cat: "Yoga", title: "Beach Yoga Flow", location: "Seaside Pavilion", rating: "4.8", price: "$18" },
  { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCwRB9MSK7yAnvcgDf0vkWLqN8DDU4MKN5tl6h0Fs6my0BEWyo_pDr-B5rAZQVWI3P2wApkHYEf_Oh88IP8LkvkqbXhOHA8BA5VGrGaZ7lDl6tVhr5jKxP5-kcgt1SWV6svQT4ebgxMzDlreSjTeZrw9Q1q08cRfJOIjYUzSPoZuLWjZg0Sh-fO_0O-my81HlhxqkzTZHvPI268chxX0tNmHcmBY77lJyPIksDcQK8Cns3Yl_1LzgfU_toz4RBgthuVSyMpRZSKcvw", cat: "Tech", title: "Introduction to Python", location: "Central Learning Hub", rating: "5.0", price: "$45" },
  { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDzL8L7nYYdMVE5u2yeM26rI_XZu46PZn0agLnhIIuWSyO0gCxvX7ywP83vVuOldc_17AjnHEFgTM8bfgT6v9i9OXFyeiyfYyjNndUV4GB4NzMCslmBZOVo8vAMltZV1KuxHZgQ-Ii-LhzomKluvqzNgmAOC3V2K1llZX_cJ11HM4fDBqMECIvyTiUDu6HwGGtcTk4UGVG3KQxdILkbt9suiFYNoeHHphq4ILa2CKr-Zoq-QJ_CaDTr_iMKWkH6Rmnvev8ysZY0Adc", cat: "Sports", title: "Junior Basketball League", location: "Northside Sports Complex", rating: "4.7", price: "$15" },
];

export default function DiscoverPage() {
  return (
    <div className="bg-[#f7f9ff] text-[#181c21] font-sans min-h-screen">
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-[0_12px_32px_rgba(24,28,33,0.06)] flex justify-between items-center px-8 h-20">
        <div className="flex items-center gap-12">
          <Link href="/" className="text-2xl font-black text-[#725DFF] tracking-tighter" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Hakuna</Link>
          <nav className="hidden md:flex items-center gap-8 font-medium tracking-tight" style={{ fontFamily: "var(--font-plus-jakarta)" }}>
            <Link href="/discover" className="text-[#725DFF] border-b-2 border-[#725DFF] pb-1 font-bold">Explore</Link>
            <Link href="/kids" className="text-slate-600 hover:text-[#725DFF] transition-all">Kids</Link>
            <Link href="/teens" className="text-slate-600 hover:text-[#725DFF] transition-all">Teens</Link>
            <Link href="/adults" className="text-slate-600 hover:text-[#725DFF] transition-all">Adults</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-slate-100 transition-all">
            <span className="material-symbols-outlined text-[#474555]">notifications</span>
          </button>
          <button className="p-2 rounded-full hover:bg-slate-100 transition-all">
            <span className="material-symbols-outlined text-[#474555]">favorite</span>
          </button>
          <div className="h-10 w-10 rounded-full bg-[#e5e8ef] overflow-hidden border-2 border-[#553ce2]/10">
            <div className="w-full h-full bg-[#553ce2]/20 flex items-center justify-center text-[#553ce2] font-bold text-sm">JD</div>
          </div>
        </div>
      </header>

      <main className="pt-20 h-screen flex flex-col md:flex-row overflow-hidden">
        {/* Left: Discovery & Filters */}
        <section className="w-full md:w-1/2 flex flex-col h-full bg-[#f7f9ff]">
          {/* Filter Bar */}
          <div className="px-6 py-4 bg-[#f1f4fb]/50 backdrop-blur-md sticky top-0 z-30">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#787587] px-2">Age:</span>
                {["All Ages", "Kids", "Teens", "Adults"].map((label, i) => (
                  <button key={label} className={`whitespace-nowrap px-5 py-2 rounded-full font-medium text-sm ${i === 0 ? "bg-[#6f59fc] text-white" : "bg-[#e5e8ef] text-[#474555] hover:bg-[#dfe2e9] transition-colors"}`}>{label}</button>
                ))}
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
                  {[{ icon: "category", label: "Category" }, { icon: "payments", label: "Price" }, { icon: "distance", label: "Distance" }].map(({ icon, label }) => (
                    <button key={label} className="flex items-center gap-2 px-4 py-2 bg-white border border-[#c8c4d8]/30 rounded-lg text-sm font-medium">
                      <span className="material-symbols-outlined text-sm">{icon}</span>
                      {label}
                      <span className="material-symbols-outlined text-sm">expand_more</span>
                    </button>
                  ))}
                </div>
                <button className="flex items-center gap-2 text-[#553ce2] font-semibold text-sm hover:underline">
                  <span className="material-symbols-outlined text-sm">tune</span>
                  More Filters
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable Class List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 hide-scrollbar">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-extrabold tracking-tight text-[#181c21]" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Available Classes</h1>
              <p className="text-sm text-[#474555] font-medium">124 results found</p>
            </div>
            <div className="grid grid-cols-1 gap-6 pb-24">
              {classes.map(({ img, cat, title, location, rating, price }) => (
                <Link href="/classes/1" key={title} className="group flex flex-col sm:flex-row bg-white rounded-2xl overflow-hidden shadow-[0_12px_32px_rgba(24,28,33,0.06)] hover:shadow-[0_20px_48px_rgba(24,28,33,0.12)] transition-all duration-300 cursor-pointer">
                  <div className="w-full sm:w-48 h-48 relative overflow-hidden">
                    <img alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={img} />
                    <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-widest text-[#553ce2]">{cat}</div>
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-xl text-[#181c21]" style={{ fontFamily: "var(--font-plus-jakarta)" }}>{title}</h3>
                        <div className="flex items-center gap-1 bg-[#f1f4fb] px-2 py-1 rounded-lg">
                          <span className="material-symbols-outlined text-[#ba002e] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          <span className="text-xs font-bold">{rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[#474555] text-sm mb-3 font-medium">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        {location}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <span className="text-2xl font-black text-[#181c21]">{price}</span>
                        <span className="text-[#474555] text-xs font-medium">/ session</span>
                      </div>
                      <button className="px-6 py-2.5 bg-[#553ce2] text-white rounded-full font-bold text-sm hover:bg-[#6f59fc] transition-colors shadow-lg shadow-[#553ce2]/20">
                        Book Now
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Right: Map View */}
        <section className="hidden md:block w-1/2 h-full relative bg-[#ebeef5]">
          <div className="absolute inset-0">
            <div className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none">
              <img alt="Map Texture" className="w-full h-full object-cover grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDA5bZIbE9svVk4TgWAHMTlPjjjngJMJgftE37E0NLaw6GzuzOGx1Xup16Rfo-2roq43Xcg4KU-vWng5f-t62SL3_Pmv1I-qeW2sdk8GIIXSJMquZHfdGg5hbcKJZQReVESCjmmTBZyLN5LKvsQxKexNyfdhT65T1ghjEAc58UWe-FRAMAgyVNDkLx5BRtL_84Q1qmLJHF-nU0NlvzOfH4F_FqVKDo7mHaKKKTVacN4qrPzXufULbFj2SRDG6Kb07yKFfT25rdEiTM" />
            </div>
            {/* Map Pins */}
            {[
              { top: "25%", left: "33%", icon: "fitbit_dance", price: "$25" },
              { top: "50%", left: "66%", icon: "self_improvement", price: "$18" },
              { top: "66%", left: "25%", icon: "terminal", price: "$45" },
            ].map(({ top, left, icon, price }) => (
              <div key={price + icon} className="absolute group cursor-pointer" style={{ top, left }}>
                <div className="relative flex flex-col items-center">
                  <div className="bg-[#553ce2] text-white p-2 rounded-xl shadow-xl flex items-center gap-2 group-hover:scale-110 transition-transform duration-200">
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                    <span className="font-bold text-sm">{price}</span>
                  </div>
                  <div className="w-2 h-2 bg-[#553ce2] rotate-45 -mt-1 shadow-lg" />
                </div>
              </div>
            ))}
            {/* Map Controls */}
            <div className="absolute bottom-10 right-10 flex flex-col gap-2">
              {["add", "remove"].map(icon => (
                <button key={icon} className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center text-[#474555] hover:text-[#553ce2] transition-colors">
                  <span className="material-symbols-outlined">{icon}</span>
                </button>
              ))}
              <button className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center text-[#474555] hover:text-[#553ce2] transition-colors mt-4">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>my_location</span>
              </button>
            </div>
            {/* Floating Preview */}
            <div className="absolute bottom-10 left-10 right-28 sm:right-auto sm:w-80 bg-white p-4 rounded-2xl shadow-2xl flex gap-4 items-center">
              <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                <img alt="Dance Class" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3hWYi5w96iprdED71V8y7NJz8GtgyqR8eEF5bqgCSwXDePohB55lZ-bCSagdD6AmFw5wW1DsA0E9q1xG8C3cGfPGnlESzVlWXIx45GvLMVKJ-S1Xvomnh_HOdUDJp8D3AKr79zDwEpTPuqWHZVo4bzhMRA8oC-xzceBRTUbf54iVAyNG3kladdh2eXT9vkuqOwAzgPmoor8Hvp1EH8WcVm7ty25xbTeZammSxSnmQSbW79gzmLuT5F7_5_eqDFICcr6_PhYXUSq0" />
              </div>
              <div>
                <h4 className="font-bold text-sm line-clamp-1">Modern Contemporary Dance</h4>
                <div className="flex items-center gap-1 text-xs text-[#474555] mt-1">
                  <span className="material-symbols-outlined text-xs">location_on</span>
                  Downtown Arts District
                </div>
                <div className="mt-2 text-[#553ce2] font-black">$25.00</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-3 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-2xl z-50 md:hidden">
        {[
          { icon: "explore", label: "Explore", active: true },
          { icon: "map", label: "Map" },
          { icon: "favorite", label: "Saved" },
          { icon: "person", label: "Profile" },
        ].map(({ icon, label, active }) => (
          <div key={label} className={`flex flex-col items-center justify-center rounded-xl px-4 py-1 text-[11px] font-semibold ${active ? "bg-[#725DFF]/10 text-[#725DFF]" : "text-slate-400"}`}>
            <span className="material-symbols-outlined">{icon}</span>
            <span>{label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
}
