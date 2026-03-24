import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modern Contemporary Fusion | Hakuna Class Details",
  description: "Experience the fluid intersection of emotional expression and technical precision with Elena Rodriguez. Book your session today.",
};

export default function ClassDetailsPage() {
  return (
    <div className="bg-[#f7f9ff] text-[#181c21] font-sans min-h-screen">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-sm">
        <div className="flex justify-between items-center px-6 py-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold tracking-tight text-slate-900" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Hakuna</Link>
            <div className="hidden md:flex gap-6 items-center">
              <Link href="/discover" className="font-medium text-sm text-[#725DFF] border-b-2 border-[#725DFF] pb-1" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Browse</Link>
              <Link href="#" className="font-medium text-sm text-slate-600 hover:text-[#725DFF] transition-opacity" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Instructors</Link>
              <Link href="#" className="font-medium text-sm text-slate-600 hover:text-[#725DFF] transition-opacity" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Memberships</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-slate-600 font-medium text-sm px-4 py-2 hover:opacity-80 transition-opacity">Login</Link>
            <Link href="/login" className="bg-[#553ce2] text-white px-6 py-2 rounded-full font-medium text-sm hover:opacity-90 active:scale-95 duration-200 transition-all">Sign Up</Link>
          </div>
        </div>
      </nav>

      <main className="pt-20 pb-24 max-w-7xl mx-auto px-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-[#536772] mb-8">
          <Link href="/discover" className="hover:text-[#553ce2]">Browse Classes</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="hover:text-[#553ce2] cursor-pointer">Dance</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-[#181c21] font-medium">Modern Contemporary Fusion</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            {/* Hero Image */}
            <section className="relative group">
              <div className="relative h-[480px] w-full rounded-xl overflow-hidden shadow-sm">
                <img alt="Modern dance session" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhhea6RiWzj6WSLmo2SvA3k0QcQZZQ77HcYOa-gmoyBjqCBwVcqJpQ4HGaOtpM1nisMmrIPlRHMfSQ2G93KVKiD3LqdMwI1APUFmhNwJv3JcEct7dk-7mD7ePS-mj-YUj6ftE1cZ3-0WLbc4obkkc6ArBfrtVe6pebpXCXhhU76Stixq1v4ZbtLOzHeWZWv2d0Bx_X-Dk6J10UHwiBRqW7zkRxqJUVgb39oNddit0IjXjSIccId0y10aYNXALDMOiG7qZOCn37AMM" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 text-white">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-[#e31c40] text-white text-xs font-bold px-3 py-1 rounded-full tracking-wide uppercase">Teen Elite</span>
                    <span className="bg-white/20 backdrop-blur-md text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      4.8 (124 reviews)
                    </span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Modern Contemporary Fusion</h1>
                  <p className="text-lg text-white/90 flex items-center gap-2">
                    <span className="material-symbols-outlined">person</span>
                    with Elena Rodriguez
                  </p>
                </div>
              </div>
            </section>

            {/* Quick Stats */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: "schedule", label: "Duration", value: "90 Minutes" },
                { icon: "groups", label: "Age Group", value: "13-17 years" },
                { icon: "trending_up", label: "Level", value: "Intermediate" },
                { icon: "payments", label: "Price", value: "$45/class" },
              ].map(({ icon, label, value }) => (
                <div key={label} className="bg-[#f1f4fb] p-5 rounded-xl flex flex-col items-center text-center">
                  <span className="material-symbols-outlined text-[#553ce2] mb-2">{icon}</span>
                  <span className="text-xs text-[#536772] uppercase font-bold tracking-wider">{label}</span>
                  <span className="text-[#181c21] font-semibold">{value}</span>
                </div>
              ))}
            </section>

            {/* About */}
            <section className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-[#181c21]" style={{ fontFamily: "var(--font-plus-jakarta)" }}>About this Class</h2>
                <p className="text-[#474555] leading-relaxed">
                  Experience the fluid intersection of emotional expression and technical precision. This course is specifically curated for teenagers who want to push their boundaries. We focus on floorwork, momentum-based movements, and storytelling through choreography. Elena&apos;s unique approach blends classical contemporary foundations with modern urban influences.
                </p>
              </div>
              <div className="bg-[#f1f4fb] p-8 rounded-xl space-y-6">
                <h3 className="text-xl font-bold text-[#181c21]" style={{ fontFamily: "var(--font-plus-jakarta)" }}>What you&apos;ll learn</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {["Advanced floor-to-standing transitions", "Rhythmic complexity and syncopation", "Emotional projection and stage presence", "Improvisation techniques for solo work"].map(item => (
                    <div key={item} className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#553ce2]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <span className="text-[#474555]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Instructor */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-[#181c21]" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Meet your Instructor</h2>
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start p-8 bg-white rounded-xl shadow-sm border border-[#c8c4d8]/10">
                <img alt="Elena Rodriguez" className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-md" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjQ6blcKcBwpVNegq2lhjRLcGe-4PstvNDxpxGNq11hTkfpxz4DKQxOSq2i9xjX-gyM8T__TwAE3CIPSLWz-eZvEmKuVub5EC6_MzbNtbm0kRcon_NKlt9X-6NiTg9TYD1tjKbLTPZLmZYcuio9EMQkET92EtbzpHT6ocYAtSi9nB_gIjLlyusmmPVuCzWtbiNb5Qg-zpT_TeiiGr96J9ohxHVGs512WsnRn_gN8NYDPS6aQdAPDvV1kZRxBOx1H6ATk_CW2nr2Ec" />
                <div className="space-y-4 flex-1">
                  <div>
                    <h3 className="text-xl font-bold text-[#181c21]" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Elena Rodriguez</h3>
                    <p className="text-[#553ce2] font-medium">Professional Choreographer &amp; BFA in Dance</p>
                  </div>
                  <p className="text-[#474555] italic">&ldquo;Dance is the hidden language of the soul. My mission is to help every student find their unique voice through movement.&rdquo;</p>
                  <div className="flex gap-4">
                    {[{ value: "12+", label: "Years Exp." }, { value: "500+", label: "Students" }, { value: "4.9", label: "Rating" }].map(({ value, label }, i) => (
                      <div key={label} className="flex items-center gap-4">
                        {i > 0 && <div className="w-px h-10 bg-[#c8c4d8]/30 self-center" />}
                        <div className="text-center">
                          <div className="text-lg font-bold">{value}</div>
                          <div className="text-xs text-[#536772] uppercase">{label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Reviews */}
            <section className="space-y-8">
              <div className="flex justify-between items-end">
                <h2 className="text-2xl font-bold text-[#181c21]" style={{ fontFamily: "var(--font-plus-jakarta)" }}>What students &amp; parents say</h2>
                <button className="text-[#553ce2] font-bold text-sm hover:underline">View all reviews</button>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { initials: "SM", name: "Sarah Miller", role: "Parent of 15yr old", quote: "Elena has a magical way of teaching. My daughter was shy before joining, but now she's auditioning for solos. Truly transformative!" },
                  { initials: "JT", name: "Jason T.", role: "Student (16)", quote: "The fusion of styles is exactly what I was looking for. Challenging but so much fun. Elena's feedback is always constructive." },
                ].map(({ initials, name, role, quote }) => (
                  <div key={name} className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#d0e6f3] flex items-center justify-center text-[#553ce2] font-bold">{initials}</div>
                      <div>
                        <div className="font-bold text-sm">{name}</div>
                        <div className="text-xs text-[#536772]">{role}</div>
                      </div>
                    </div>
                    <div className="flex text-[#ba002e]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      ))}
                    </div>
                    <p className="text-sm text-[#474555]">&ldquo;{quote}&rdquo;</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sticky Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white p-8 rounded-2xl shadow-xl border border-[#553ce2]/5">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-2xl font-extrabold text-[#181c21]">$45<span className="text-sm font-normal text-[#536772]"> /session</span></span>
                  <span className="bg-[#d0e6f3] text-[#536772] text-xs font-bold px-2 py-1 rounded">Hurry! 3 spots left</span>
                </div>
                <div className="space-y-4 mb-8">
                  <label className="text-sm font-bold text-[#181c21] block uppercase tracking-wider">Select Session</label>
                  <div className="space-y-2">
                    {[
                      { date: "Sat, Nov 23", time: "10:30 AM — 12:00 PM", selected: true },
                      { date: "Sat, Nov 30", time: "10:30 AM — 12:00 PM", selected: false },
                      { date: "Sat, Dec 7", time: "10:30 AM — 12:00 PM", selected: false },
                    ].map(({ date, time, selected }) => (
                      <button key={date} className={`w-full text-left p-4 rounded-xl border-2 flex justify-between items-center group transition-all ${selected ? "border-[#553ce2] bg-[#553ce2]/5" : "border-transparent hover:border-[#c8c4d8] bg-[#f1f4fb]"}`}>
                        <div>
                          <div className="text-sm font-bold text-[#181c21]">{date}</div>
                          <div className="text-xs text-[#536772]">{time}</div>
                        </div>
                        <span className="material-symbols-outlined text-[#553ce2]" style={{ fontVariationSettings: selected ? "'FILL' 1" : "'FILL' 0" }}>
                          {selected ? "radio_button_checked" : "radio_button_unchecked"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <button className="w-full bg-gradient-to-r from-[#553ce2] to-[#6f59fc] text-white py-4 rounded-full font-bold text-lg shadow-lg shadow-[#553ce2]/25 hover:opacity-90 active:scale-95 transition-all mb-4" style={{ fontFamily: "var(--font-plus-jakarta)" }}>
                  Enroll Now
                </button>
                <p className="text-center text-xs text-[#536772] px-4 leading-relaxed">
                  No commitment. Cancel up to 24 hours before the session for a full refund.
                </p>
              </div>
              <div className="bg-[#f1f4fb] p-6 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[#553ce2]">verified_user</span>
                </div>
                <div>
                  <div className="font-bold text-sm">Hakuna Guarantee</div>
                  <div className="text-xs text-[#536772]">Verified instructors &amp; safe spaces.</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
