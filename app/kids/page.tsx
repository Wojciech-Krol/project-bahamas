import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hakuna Kids | Splash into Learning!",
  description: "A world where every discovery is a game and every moment is a chance for little explorers to shine. Safe, fun activities for ages 4-12.",
};

export default function KidsPage() {
  return (
    <div className="bg-[#fdf8f4] text-[#181c21] font-sans min-h-screen">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-[#fdf8f4]/70 backdrop-blur-xl shadow-sm">
        <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          <Link href="/" className="text-2xl font-bold tracking-tighter text-slate-900" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Hakuna</Link>
          <div className="hidden md:flex items-center gap-8">
            {[{ href: "/discover", label: "Explore" }, { href: "/kids", label: "Kids", active: true }, { href: "/teens", label: "Teens" }, { href: "/adults", label: "Adults" }].map(({ href, label, active }) => (
              <Link key={label} href={href} className={`text-sm font-medium tracking-tight transition-colors ${active ? "font-bold text-[#725DFF] border-b-2 border-[#725DFF] pb-1" : "text-slate-600 hover:text-[#725DFF]"}`}>{label}</Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="px-4 py-2 text-slate-600 font-medium text-sm hover:bg-slate-100/50 rounded-lg transition-all">Sign In</Link>
            <Link href="/login" className="px-5 py-2.5 bg-[#725DFF] text-white rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all">Get Started</Link>
          </div>
        </div>
      </nav>

      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative px-6 py-12 md:py-24 max-w-7xl mx-auto overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="z-10">
              <span className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 font-bold text-sm mb-6 uppercase tracking-widest" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Hakuna Kids</span>
              <h1 className="text-5xl md:text-7xl font-extrabold text-[#181c21] leading-[1.1] mb-6" style={{ fontFamily: "var(--font-plus-jakarta)" }}>
                Splash into <span className="text-[#553ce2] italic">Learning!</span>
              </h1>
              <p className="text-lg md:text-xl text-[#474555] mb-10 max-w-lg leading-relaxed">
                A world where every discovery is a game and every moment is a chance for little explorers to shine.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/discover" className="px-8 py-4 bg-gradient-to-r from-[#553ce2] to-[#6f59fc] text-white rounded-full font-bold text-lg shadow-lg hover:shadow-[#553ce2]/20 transition-all active:scale-95" style={{ fontFamily: "var(--font-plus-jakarta)" }}>
                  Pick a Class
                </Link>
                <button className="px-8 py-4 bg-[#ffe8d6] text-[#a0522d] rounded-full font-bold text-lg transition-all active:scale-95" style={{ fontFamily: "var(--font-plus-jakarta)" }}>
                  See the Fun
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#ba002e]/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-[#553ce2]/10 rounded-full blur-3xl" />
              <div className="relative rounded-[3rem] overflow-hidden rotate-2 shadow-2xl aspect-[4/5] border-8 border-white">
                <img alt="Happy kids running on a tropical beach" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnoywTS_IC53tg_pf7hl_RnK2rvj6bCqb7qBzw1XuDL1UpPHFOSf0eOCLWA9q_cgOVotreL6lQEFUpmKI1QUQwNHn5jPWpdSxPcfIVcOEXFxokXWzINNUPQ7aq_K3eHVdCVEv6bEbafQ_fwUbGU1jPZFzl4LAw0FCZJooRBweSM8_w2PfvrmrXchjS1euk44_DhWU9yc0ctlu6LCHoOjYoPyKM9rV0WaFV1EVjfk2SYSgh2E-zA5S37asMAYIZjEfbPNDMBgKKDuc" />
              </div>
              <div className="absolute -bottom-6 -right-6 md:right-12 bg-white p-6 rounded-2xl shadow-xl max-w-[200px] -rotate-3 border-t-4 border-orange-400">
                <p className="font-bold text-[#181c21] text-sm" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Next Junior Session starts in 2 hours!</p>
              </div>
            </div>
          </div>
        </section>

        {/* Discover Classes Bento */}
        <section className="px-6 py-20 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-[#181c21] mb-4" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Discover Your Superpower</h2>
            <p className="text-[#474555] max-w-2xl mx-auto">From messy masterpieces to underwater quests, find the class that makes your heart dance.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-auto md:h-[600px]">
            <div className="md:row-span-2 group relative overflow-hidden rounded-3xl bg-[#ffe8d6] cursor-pointer">
              <img alt="Child painting on a colorful canvas outdoors" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPvLcsvlqDQSV_oHSNRnbXOj-1Zvuo3dGCxWpA_L7ugKIgTm6G_8H-9JRAU8otEvDSPoEMbVYqC6e9GwWJNDdAYU7AmOLAVZdI5RssLu2z00oyU1vXvMd9-y51ClJ2Vse4W5rhWB7denRQU0f1BCfwxlTZLS39BalFBDjD1kVWe32fa__YBbF1F4Sq2X5-L9F0WEyvPyCskx02RNvlxjyvsdyZx605WWifRFoRb2o7trfVKTmjkYyXoM6MgZTJAUPLz-WxKaLBS5U" />
              <div className="absolute inset-0 bg-gradient-to-t from-orange-900/60 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8">
                <span className="material-symbols-outlined text-white text-4xl mb-2">palette</span>
                <h3 className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Arts &amp; Crafts</h3>
                <p className="text-white/80 text-sm">Messy painting &amp; clay fun</p>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-3xl bg-[#e4dfff] cursor-pointer">
              <img alt="Kid wearing swimming goggles in turquoise water" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAg9TRQHdn7J3P-ID6gdaVKkX1DORBj2ro2eRE2qLNah8nnjHtcw-OSZyNlczJk_suXjjAkCZoTQFlfyFFzJqNavCqLT7BKrn2b_ZR1xJejD2fl6F87dMtb78bhzoRQOCWMSJ9-TVwSf52p86EhNLgfXLkM_VjPivvvpoPDOUQI1A0XD95DInKvBfMeKUtPGmNYI6iGm02MjC0wYU44sqyXTL6tFP2KDaRn9AwmN8byX-_h6ktFWx_i0BaRyilCJqBHSbUM8GabPhU" />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <h3 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Splash Swimming</h3>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-3xl bg-[#ffdad9] cursor-pointer">
              <img alt="Children listening to stories" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDd7pagty22YkHvtcmYe9JPrIUWsizujeWfBPPawsfyZ_HmLOC6VL4GBwE4gf0wVrG_gnLU9JVgwXyGM9g35N64iMh8IcCb-ldDYBk-Ei2lUxqRhahzuMBXG5RUsbSEIQ6YJe--9dQw841HUIvy_7KIsNMQvHbnzbtovruGEM7P62Uk88KsIGeVx7IRQQZqZ32hiBneV_nSHOYciP2aPhur67ToXr_zmlIiZfViyltVmqz0jy1GJQMXhfHlXwWRXpU1bQwH-bU99Dk" />
              <div className="absolute inset-0 bg-gradient-to-t from-red-900/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <h3 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Magic Stories</h3>
              </div>
            </div>
            <div className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-[#f5ece6] cursor-pointer h-64 md:h-full">
              <img alt="Group of kids exploring nature trails" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBP1DL-2tpSDnNQI3Tt4WnDq7rO894_iFCL2LXEzfD8q8FE022nqMFIi9cl4jbi_BE6xbb45IuFxNkvQC3y6qJPsBieAkYggON6dp5i6tC6hZWqZk568sMeuSWkG4SFrfBitH0GSPrWFkX61iOY9YXuKhI96FPVTnI3yZAfTiU6Fodbjym51PzOeO76Gx-OdryRAvdk05Cii_MxegI0funtPCHd9-SbRZInbbOryYPzKNSMepAVq6MimlVGuVTlRXcJGuDhvPRFK2U" />
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8">
                <h3 className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Junior Sports &amp; Games</h3>
                <p className="text-white/80 text-lg">Team fun, races, and hidden treasures</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Classes */}
        <section className="bg-[#fff4ec] py-24 rounded-[4rem] mx-4 md:mx-6">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="max-w-xl">
                <h2 className="text-4xl font-extrabold text-[#181c21] mb-4" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Summer Play Sessions</h2>
                <p className="text-[#474555]">Our playful classes help children learn new skills through laughter and friendship.</p>
              </div>
              <Link href="/discover" className="text-[#553ce2] font-bold flex items-center gap-2 group" style={{ fontFamily: "var(--font-plus-jakarta)" }}>
                View All Sessions <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCCaWDYVrPkppgcrkzI7Fc_v-PhktU4-AJBKm574tpkUE-i8cMjiMniOD5nIywfnxUYsnCqTSncPu7VftUpY7nbJFsP0LlejUmWvr4ap_Xz6tvO7y8rZPlMn0rNalQM5dfoeSfl8TkbPSv0TFR1BhcikZU1hXwlZ1-usPe2SjRqXDv3v6cKwNcpooyxJoYnepthiJ15MzxCnTcTlILIxUUMh3hF1WJ4JIXByzsuDzsnW35i_HKR14CX85mm4ejexzCWEE1wRh48FNU", badge: "POPULAR", title: "Beach Ball Pro", price: "$45", duration: "90 min", ages: "Ages 6-12", ctaColor: "bg-[#553ce2] text-white", ctaText: "Book Now" },
                { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAHAsQRshO14acZrl1I58uhb4q1SL28-HRnnZZnVyuSobxPK5CBJ5r8JRS4ezZnBEBMT1FoU7CXU-N5-6RV7rbxCr8BmBaMWAO1E2s8HJIsH4LOzkGWHtcFWz7i9gEVJe6IoG20JvXR8wJyqZA1k5awQUbsYb0HC0lPs7-FyYMNYWvMwB5QIAHd4fXIIBi0eUJ7FZbj8Wh7izxjOTd9INQS9yNA0wm9Pjmzh0IrgHz3-Rv8_dujblty6Q1pC1i8OG-DISzb9uknDAs", badge: null, title: "Clay Creations", price: "$38", duration: "120 min", ages: "All Ages", ctaColor: "bg-[#ffe8d6] text-[#a0522d]", ctaText: "Enroll Today" },
                { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAu4xVzddoO-dMph52-wAb7BFroeAjO2f_qAC-JmWv6CA38bNhGzYW_y_1XrzO0-mmTkeBJxUoOZd46p3LMCjJgJ47gm96Btb_TYRPpBlWoY5JyM79FKLG3P1Nr7vlLjps2fozLBA3vHGd-lcygSJ-cw9l2mXiypqIs7nZim6eW_3cK8Xc8yspbPhu0Oa3T_SkkA4kjnZxHRNetFXvyp5WuZ3-2QHBfwcIG-l0B0kCM7mb1RcPXZnuhXfzONMjkLsx2xvNK19CVsx8", badge: null, title: "Little Fish Snorkel", price: "$55", duration: "60 min", ages: "Ages 8+", ctaColor: "bg-[#ffe8d6] text-[#a0522d]", ctaText: "Join the Fun" },
              ].map(({ img, badge, title, price, duration, ages, ctaColor, ctaText }) => (
                <div key={title} className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-orange-50">
                  <div className="relative h-64 rounded-2xl overflow-hidden mb-6">
                    <img alt={title} className="w-full h-full object-cover" src={img} />
                    {badge && <div className="absolute top-4 left-4 px-3 py-1 bg-orange-400 text-white text-xs font-bold rounded-full">{badge}</div>}
                  </div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-[#181c21]" style={{ fontFamily: "var(--font-plus-jakarta)" }}>{title}</h3>
                    <div className="flex flex-col items-end">
                      <span className="text-[#553ce2] font-bold">{price}</span>
                      <span className="text-xs text-[#474555]">per session</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-1 text-[#474555] text-sm">
                      <span className="material-symbols-outlined text-sm">schedule</span> {duration}
                    </div>
                    <div className="flex items-center gap-1 text-[#474555] text-sm">
                      <span className="material-symbols-outlined text-sm">groups</span> {ages}
                    </div>
                  </div>
                  <button className={`w-full py-4 ${ctaColor} font-bold rounded-2xl active:scale-95 transition-all`} style={{ fontFamily: "var(--font-plus-jakarta)" }}>{ctaText}</button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-6 mb-24 mt-24">
          <div className="bg-gradient-to-br from-[#725DFF] to-[#8E7DFF] rounded-[3rem] p-12 text-center text-white relative overflow-hidden">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 relative z-10" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Ready for a Playdate?</h2>
            <p className="text-lg md:text-xl text-[#e4dfff] mb-10 max-w-2xl mx-auto relative z-10">Sign up for our newsletter and get 15% off your first class booking.</p>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center relative z-10">
              <input className="w-full md:w-96 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none" placeholder="Your email address" type="email" />
              <button className="px-10 py-4 bg-white text-[#553ce2] font-extrabold rounded-full hover:bg-opacity-90 transition-all shadow-xl active:scale-95" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Sign Me Up!</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
