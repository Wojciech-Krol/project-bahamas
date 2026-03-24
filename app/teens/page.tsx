import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hakuna Teens | Unleash the Energy",
  description: "Dive into the neon pulse of the digital world. From high-tech hubs to global street dance, your ultimate teen adventure starts here.",
};

export default function TeensPage() {
  return (
    <div className="bg-[#f7f9ff] text-[#181c21] font-sans min-h-screen">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-[#f7f9ff]/70 backdrop-blur-md shadow-sm">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-[#181c21] tracking-tighter" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Hakuna</Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/discover" className="text-gray-600 hover:text-[#725DFF] transition-colors text-sm font-semibold tracking-tight hover:bg-gray-100/50 rounded-lg px-2 py-1">Explore</Link>
              <Link href="/kids" className="text-gray-600 hover:text-[#725DFF] transition-colors text-sm font-semibold tracking-tight hover:bg-gray-100/50 rounded-lg px-2 py-1">Kids</Link>
              <Link href="/teens" className="text-[#725DFF] border-b-2 border-[#725DFF] pb-1 text-sm font-semibold tracking-tight">Teens</Link>
              <Link href="/adults" className="text-gray-600 hover:text-[#725DFF] transition-colors text-sm font-semibold tracking-tight hover:bg-gray-100/50 rounded-lg px-2 py-1">Adults</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100/50 rounded-lg">
              <span className="material-symbols-outlined text-gray-600">account_circle</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero - Electric High-Contrast */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-[#181c21]">
        <div className="absolute inset-0 opacity-40">
          <img className="w-full h-full object-cover grayscale brightness-50 contrast-125" alt="Teens high-fiving on a neon-lit beach at night" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCeRg1cwPEuD5gX056FEjSfmxrOo5fuWgKkiKftz_lk5uL90Yj2qAjZTH6_qsssNBFbZse9u5Jtg3z2Y0AGbt-J61547rIZE4puCkr5MEi9RqNt8J7hqVKdnaSwH7WkrhiXSe24JqZ4XX_pH14phq_CA0_4mB3a1XGPlqf2A4n8gnlYF1NDHgT-wVgEd90_b_ItTePw7fFvsR5AllpiqipQOog1By3fJA4mstM-0q5RXygP7Rv6mS7KDuDQm9ZP-0Zqd0L68SvkP3Q" />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#553ce2]/60 via-transparent to-[#ba002e]/40" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-3xl">
            <span className="inline-block py-1 px-4 bg-[#e31c40] text-white font-bold rounded-full text-xs tracking-widest uppercase mb-6" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Teen Edition 2024</span>
            <h1 className="text-6xl md:text-8xl font-extrabold text-white leading-tight tracking-tighter mb-8" style={{ fontFamily: "var(--font-plus-jakarta)" }}>
              UNLEASH THE <span className="text-[#c7bfff] text-glow">ENERGY</span>
            </h1>
            <p className="text-xl text-[#dfe2e9] max-w-xl mb-10 leading-relaxed">
              Dive into the neon pulse of the digital world. From high-tech hubs to global street dance, your ultimate adventure starts here.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/discover" className="px-8 py-4 bg-gradient-to-r from-[#553ce2] to-[#6f59fc] text-white font-bold rounded-full hover:scale-105 active:scale-95 shadow-lg" style={{ fontFamily: "var(--font-plus-jakarta)" }}>
                Explore Experiences
              </Link>
              <button className="px-8 py-4 bg-[#dfe2e9]/20 backdrop-blur-md text-white border-2 border-white/30 font-bold rounded-full hover:bg-white hover:text-[#181c21] transition-all" style={{ fontFamily: "var(--font-plus-jakarta)" }}>
                Watch Trailer
              </button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-12 right-12 hidden lg:block bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
          <div className="flex gap-8">
            <div>
              <p className="text-[#ffb3b3] font-black text-3xl" style={{ fontFamily: "var(--font-plus-jakarta)" }}>50+</p>
              <p className="text-white/60 text-xs font-medium uppercase tracking-widest">Active Hubs</p>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <p className="text-[#c7bfff] font-black text-3xl" style={{ fontFamily: "var(--font-plus-jakarta)" }}>24/7</p>
              <p className="text-white/60 text-xs font-medium uppercase tracking-widest">Live Events</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Now Bento Grid */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight text-[#181c21]" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Trending Now</h2>
            <p className="text-[#4d616c] mt-2">The hottest scenes for the next generation.</p>
          </div>
          <Link href="/discover" className="hidden md:flex items-center gap-2 text-[#553ce2] font-bold" style={{ fontFamily: "var(--font-plus-jakarta)" }}>
            View All <span className="material-symbols-outlined">trending_flat</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 min-h-[700px]">
          {/* Tech & Coding */}
          <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-3xl bg-[#181c21]">
            <img className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" alt="Modern tech lab with neon lights" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDMrT--YqAuZdsKKo5jaP0MQ9IkQEL0752fElVbaqhYJmrxG_lP5R1o2gKAfKK7h5mzSbPUuBZ_acv6G8f1u5vWrwzGWVThof5qrvL3KHw6DzL49jMpYKXeeGs1aof6FzElxW3tXnlqqwMPbNIWJRiubRynlDX_B6IsTDPZUk3yd0bbZmg20DwcYtssfJcaXI0FNjpmfV6At_xgZ_Y4_juyIddsOi1VlMRByGqkMcZEzyMsqfiH60s7Wmj8mYCFRmoPyRf47PQ2As" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#181c21] via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <div className="flex gap-2 mb-4">
                <span className="px-3 py-1 bg-[#553ce2] text-white text-[10px] font-bold rounded-full uppercase">New Hub</span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold rounded-full uppercase">Coding</span>
              </div>
              <h3 className="text-3xl font-extrabold text-white mb-2" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Cyber Oasis Tech Hub</h3>
              <p className="text-white/70 mb-6 max-w-sm">Level up your dev skills with immersive views. Coding marathons, VR design, and pro e-sports leagues.</p>
              <button className="w-full py-3 bg-white text-[#181c21] font-bold rounded-xl hover:bg-[#c7bfff] transition-all" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Join the Hub</button>
            </div>
          </div>
          {/* Street Dance */}
          <div className="md:col-span-2 md:row-span-1 relative group overflow-hidden rounded-3xl bg-[#ba002e]">
            <img className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-700" alt="Young person performing street dance" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBspbwX070FHO6bKc7b4MzslmcczY3kT9OvG-dWYbp0gxzE7x2j26Dnn4n0taf-ZGfhSeYr1dYv3BCnXRoyuHsbi6GXm7zdeqP-WwYeZVoDbxf4F4kIU6lbCZfVUIDEcHt86TmR7TqJP3h6LD3AKbhYBS64suYYs4XZvlP9GXrNRN-wdTkUG0fwmw00Quk7lj9PCTS54W5g7kkiQvSSmh30cISLTHwt7cuUgONb3opMq7QMMy1hBs8Q74W7ANhtBNJR8UnolvmfZ14" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#ba002e] to-transparent opacity-60" />
            <div className="absolute inset-0 flex flex-col justify-end p-8">
              <h3 className="text-2xl font-extrabold text-white" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Urban Street Beats</h3>
              <p className="text-white/80 text-sm mt-1">Underground dance battles and global workshops.</p>
            </div>
          </div>
          {/* Sports */}
          <div className="relative group overflow-hidden rounded-3xl bg-[#4d616c]">
            <img className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" alt="Teen basketball player" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsDRAGBzoumxxR2Rb9hmpQiDpyaIhQakoVF9q6UzWeUPDrliU1iBYrT3F8jjV1sCRKudI37KQUPQD_7VaIGYvRpBCzJ0G6TGZXMy8hU51J-U-DNjBwhyLjMw7RIVPElriISP-BrjjF1D1x_ny4J_D1YD3EGWkz6S1Ip2_lGa26YrvsuZ62PPmTdG9_rSX6DKHPvpD0R50nAdeSEm06eu-zX82URAf1RD0yXMGSelBmzczv7SVNOWXGiKGwrgmnHCqLmZ8VpWe0cyY" />
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
              <h3 className="text-xl font-extrabold text-white" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Pro League Finals</h3>
              <p className="text-white/80 text-xs">High-stakes competitive tournaments.</p>
            </div>
          </div>
          {/* Social */}
          <div className="relative group overflow-hidden rounded-3xl bg-[#e5e8ef]">
            <div className="absolute inset-0 bg-[#553ce2]/10 flex items-center justify-center p-8 text-center">
              <div>
                <span className="material-symbols-outlined text-[#553ce2] text-5xl mb-4">videogame_asset</span>
                <h3 className="text-xl font-extrabold text-[#181c21]" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Global Socials</h3>
                <p className="text-[#474555] text-xs mt-2">Connect with travelers your age from around the globe.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Up-and-Coming Classes */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="text-4xl font-extrabold text-[#181c21]" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Up-and-Coming Classes</h2>
          <div className="w-24 h-2 bg-[#553ce2] mt-4 rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD25lhOgw71bTCY6t2r9G78952Ao1Bl3U4ePUoBLek4sao6cgCYVpusMczkp-931NjDt7dkP9GTAHLyhmNuwxN80l3hZqY9YJRTn9U2Mfg4NHEuR9jjvqJMjfPeIiPTr0DHum3J7gFmh3_fDIq8PdN-Z5BoZVXcMT7HEo_07M4uqyGNbNmptthMvufWdE96-ocjsdHSWwkvvXxSzBt6Q5OEh0RjaPCV-xeSB4VEpMRmjvF365-FEMbkrKmCafNxZa1XdbRQAMTRouU", badge: "LIMITED", badgeColor: "bg-[#e31c40]", cat: "Digital Arts", title: "Mastering the Lens", time: "Sat, 10:00 AM", spots: "2 spots left" },
            { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBvO1KpgyjM3uEhLRTfhOp6Beds0FzBUKftxPBRNpQuEifECIcGPV7IfKFjVQZMvJwsM89kIFxD7JHg7dvzXBPJMY9eYJyI_Wj8IgIBieUtJZ7tEoIAOx1mxFKcgH_6fCxoFP8SMUjwZMZnxK1NoO2nALg5qIuc7zl6woKffOYXL5qZQaU0uzhYVYtfy9N5Us5FwSebbcNJyK6lYjWgKbTLKtqisiUZXJUheFsTKhVsQhbv_P4RaXrRNdRYFI0ENEoZwtThnJxdv6U", badge: null, badgeColor: "", cat: "Competitive Sports", title: "Elite Performance Clinic", time: "Daily, 7:00 AM", spots: "Available" },
            { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBU70LCae6yg1-3vBswFdva-TzOJVyDGmXkTWSbYn9WAsiMCEIp8fIjNaD3ef9ZlRp5tw0-4CXhQKWWG4HzQqz0nlbCl3rTs6AJ_RwsJ7uD6K57pAIr2QbftPxYELBacWlUDhsd07Q8xjwXZsjhiCVOy-2GzGeiOLAlID012nr_cdpj1r2UbZJh2__Imlx34fYh9p-dF3ze8eGBrdhPOD5MuPVcb8f0xydP9VnfR0h6B3ZuODzlGON4jJllfsr2clQVFX8_YgdBVl0", badge: "POPULAR", badgeColor: "bg-[#553ce2]", cat: "Content Creation", title: "Global Content Creator Camp", time: "Mon-Fri, 2:00 PM", spots: "10 spots left" },
          ].map(({ img, badge, badgeColor, cat, title, time, spots }) => (
            <div key={title} className="flex flex-col gap-6">
              <div className="aspect-[4/5] overflow-hidden rounded-3xl bg-[#e5e8ef] relative group">
                <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={title} src={img} />
                {badge && <div className={`absolute top-4 right-4 ${badgeColor} text-white font-bold py-1 px-3 rounded-full text-[10px] uppercase`}>{badge}</div>}
              </div>
              <div>
                <span className="text-xs font-bold text-[#553ce2] tracking-widest uppercase" style={{ fontFamily: "var(--font-plus-jakarta)" }}>{cat}</span>
                <h3 className="text-2xl font-extrabold mt-2 mb-4" style={{ fontFamily: "var(--font-plus-jakarta)" }}>{title}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#4d616c] text-sm">schedule</span>
                    <span className="text-xs text-[#4d616c] font-medium">{time}</span>
                  </div>
                  <span className="text-xs font-black text-[#181c21]">{spots}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Floating Action Button */}
      <Link href="/discover" className="fixed bottom-8 right-8 z-40 bg-[#6f59fc] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95 group flex items-center gap-2">
        <span className="material-symbols-outlined">explore</span>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap font-bold" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Start Exploring</span>
      </Link>
    </div>
  );
}
