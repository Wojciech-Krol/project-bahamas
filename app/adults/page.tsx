import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hakuna Adults | Elevate Your Everyday",
  description: "Curated experiences for the modern adult. From meditative movement to gourmet mastery, redefine your routine in the Bahamas.",
};

export default function AdultsPage() {
  return (
    <div className="bg-[#f7f9ff] text-[#181c21] antialiased font-sans min-h-screen">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-sm">
        <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          <div className="text-2xl font-bold tracking-tight text-slate-900" style={{ fontFamily: "var(--font-plus-jakarta)" }}>
            <Link href="/">Hakuna</Link>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/discover" className="font-medium text-sm tracking-wide text-slate-600 hover:text-[#725DFF] transition-colors">Explore</Link>
            <Link href="/kids" className="font-medium text-sm tracking-wide text-slate-600 hover:text-[#725DFF] transition-colors">Kids</Link>
            <Link href="/teens" className="font-medium text-sm tracking-wide text-slate-600 hover:text-[#725DFF] transition-colors">Teens</Link>
            <Link href="/adults" className="font-bold text-sm tracking-wide text-[#725DFF] border-b-2 border-[#725DFF] pb-1">Adults</Link>
          </div>
          <div className="flex items-center gap-6">
            <button className="material-symbols-outlined text-[#474555] hover:text-[#553ce2] transition-colors">search</button>
            <Link href="/login" className="bg-gradient-to-r from-[#553ce2] to-[#6f59fc] text-white px-6 py-2.5 rounded-full font-semibold text-sm shadow-md hover:opacity-90 active:scale-95 transition-all" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Join Now</Link>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative h-[650px] flex items-center overflow-hidden px-8">
          <div className="absolute inset-0 z-0">
            <img className="w-full h-full object-cover" alt="Sophisticated yoga class in a bright airy studio" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDt_HQ1ekciFHiyW971iwMIsp0VyZLRc1SZNk-GBorP_2hvojz5Ixu2JhWnJyQ-nvFolVanRSXtjCVSwLcw0_9ArOYWYbyTcs-n5xhtFQrbyC4eXj3o_v9AzZiALOSJPiLvUxRzwKUvAE1Z3XNjLhwG4voXGeWg8VCpz6bPgY1e4xIkp8FE9ecwvaylCpiE6s2NoZGyh5tBHUS2QLyhfJ5g1x8TPL9TMHTmTOaeliJYV-2vrpMoK0UP5c1h-wKv4XSJCxLKoezGccM" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#f7f9ff] via-[#f7f9ff]/40 to-transparent" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto w-full">
            <div className="max-w-xl">
              <span className="font-label text-xs uppercase tracking-widest text-[#553ce2] font-semibold mb-4 block">Refined Discovery</span>
              <h1 className="text-6xl md:text-7xl font-extrabold text-[#181c21] leading-[1.1] mb-6 tracking-tight" style={{ fontFamily: "var(--font-plus-jakarta)" }}>
                Elevate Your <br /><span className="text-[#553ce2] italic font-medium">Everyday</span>
              </h1>
              <p className="text-[#474555] text-lg md:text-xl max-w-md mb-10 leading-relaxed">
                Curated experiences for the modern adult. From meditative movement to gourmet mastery, redefine your routine.
              </p>
              <div className="flex gap-4">
                <Link href="/discover" className="bg-[#553ce2] text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-[#553ce2]/20 hover:bg-[#6f59fc] transition-all" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Explore Classes</Link>
                <button className="bg-white text-[#181c21] px-8 py-4 rounded-full font-bold shadow-sm border border-[#c8c4d8]/30 hover:bg-[#f1f4fb] transition-all" style={{ fontFamily: "var(--font-plus-jakarta)" }}>View Schedule</button>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Categories Bento Grid */}
        <section className="py-24 max-w-7xl mx-auto px-8">
          <div className="mb-16 flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-bold text-[#181c21] mb-2" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Popular Categories</h2>
              <p className="text-[#474555]">Find your rhythm in our most sought-after disciplines.</p>
            </div>
            <Link href="/discover" className="text-[#553ce2] font-bold flex items-center gap-2 hover:underline" style={{ fontFamily: "var(--font-plus-jakarta)" }}>
              Browse All <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 h-[600px]">
            <div className="md:col-span-2 md:row-span-2 relative rounded-xl overflow-hidden group">
              <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Modern pilates studio with equipment" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAiJTAFUZrqgu1NJMPjBAp48nDuVTNUQ1tanJzOhkA4yEkRf96AaJbDOjqZQWqH7jMgFxbenfrtTnzNzwNKejD0USx0-pMs7k9BbaTvCimIYbKTVvIQpuoGGRH0GwssMK8ryLfjJrUDmov6HGZsRG6B78Ua1yAkco3f7TYj1I_7qNXF-aWPj80hvz_tO872yVaWUbz2Wj87i3DK5pr74MwImrjvNcXPtYkhzQ-ZBMeT6XJN4iPwOYET778TRYKWtoGrZgNXztW1ao0" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8">
                <h3 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Yoga &amp; Pilates</h3>
                <p className="text-white/80 text-sm">Mindful movement for balance and core strength.</p>
              </div>
            </div>
            {[
              { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDusFEI_FNtK-Sh27WX9FJTTrI4MCk3O77oC0vkKbKmmg43cz8gO0vO5sm4-nlRiGoc3VdepstR0tY3EFntI3niFnsEXzezAPRELLW67GnIJWu642UQ6cXxmBBjvLvzqUy4kyy-pAt6yOlDpNoxdRLt6IaLi8i5OBOazGEKYP2kkLOdo6qNS0FxqTGvSgCgsOARnt27zG-mxePqY71khPoBwV_FquWuNokLEkFVEOgr-vZJ4v3X7UCe3zG611uuvxMO0KjKObWTqh4", label: "Culinary Mastery", sub: "Gourmet & Pastry arts with certified chefs." },
              { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCxkmAORrJowfNItlk3m9KVM-eBlPoHawW_S5dEj_YnOj07kY_tnBDlEJTs0YzomzNx4RZ4IJMKwq8ezCVrVeEfgwBn59OZ-7ROyuzv6ukFv-fgGV-fi3kq-afPNnzdjnocdT4sJ9hYtt1VTH8hM4I_zc2lLvpZ87OIIXoJwSLw2yJUvRshoHch5WHHZSoigxGAtnvcl3NkszH5YnfpCWk_nhbb_6qWv3_Pm0WgrXd9zsFRwA8G22y2evKXuVNVz60bBQeaRcshQvI", label: "Contemporary Dance", sub: null },
              { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDVlZgWXpGclWMEczrJlBV3bhkQqYPV_HA2PojTxV6US3jx3A2aSuQ9X8No5_Qndzpbk9n3WJelZ3a5iIxFy19cJkpl9Cbs-RAgX387Ek0YGekXG3AEmsMVJyCv5vM6NIvcK1UVarGFUpzCcRmjUM3XH3xMhnVaUEzaNXWWtwIQEdgdR1_F0mwTkMHS12FaloAJ1JdEs4mDwHwbMiEFUiRXf6FE-Dxcm1PDMWcBBAgDpls9W59ZGp1lJlWAcDRY3jetlWU_BYK8c", label: "Tennis & Racquet", sub: null },
            ].map(({ img, label, sub }) => (
              <div key={label} className="relative rounded-xl overflow-hidden group">
                <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={label} src={img} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <h3 className="font-bold text-white mb-1" style={{ fontFamily: "var(--font-plus-jakarta)" }}>{label}</h3>
                  {sub && <p className="text-white/80 text-sm">{sub}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Workshops */}
        <section className="bg-[#f1f4fb] py-24">
          <div className="max-w-7xl mx-auto px-8">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-[#181c21] mb-2" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Upcoming Workshops</h2>
              <p className="text-[#474555]">Limited-edition sessions to deepen your practice.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXmbJJyB0EFBQUFvJJthQZxXGVcSo0B_csQ7j_s6DF__ONg1E_kY4gl-EFT7qokr1slv27Es9xfPrW0KJPifTzzOLnlZm52yA2BJwqMpTniPv77_hjSfL3l3UYofZ0vP6tdVLiEPDFgaHm-7Ivtkt9wF91eT6oUVQw_9ngsr7CRP3Z5trhzI7QKttg3MIStINxsb-xdtirvGh7h2jeEpLA_pAiRcNO7RgRhjF5wrtcfTtwN0bRK0PVjgtX750cHdjqnSOUYGahHms", limited: true, date: "Oct 12, 2024", title: "The Art of French Pastry", desc: "Learn the secrets of lamination and crème pâtissière from Executive Chef André.", price: "$120" },
                { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD9UQx5QMUmQNFg69iUGI0EpJ4rfzmiDAKjwOsUilfg0tFL5r__oYJY5LN06RYrl1hWLJPPqGtCQTUv_9jBY7cHydiCRgmOKLcXPo5Aqh6YiW_YhYd4ZDclEISZaECFtQTQA-Wo8_07-m4HxLhbVWhMcSfdHp5KExD2XmZoul3y83zARuR7YGbAs5HuC6tix1njqYxsd9GPsiU_y4sKMxFsyyoIHEdWxaPkYkQUcCUkNWCaUccPIGlSlhodXykfcbU11zJj8yDpERo", limited: false, date: "Oct 15, 2024", title: "Sunset Sound Bath", desc: "A transformative meditative experience using crystal singing bowls and breathwork.", price: "$45" },
                { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDiqqauWOkDXqOyVJqaI8Jn_TlKLtYou4oCaXI92kIgmZWH8fV938nmtfKSuFGeLADA8ozSce938rVFI-eolQYsQahAQRCIXkytJM7AwFGT7BdXEU-SOH3k7bQEzn64YMVxz8yHXP2j3GMS01wrj2AnktoFcmJp6u5djerHN6zTeS89lnq56Re1YfDuwL5aMU5tFuMPZdVlP-q8_hqmhFxJfkMckXDp_Kfnri_mNReoKdF1dd9apHSVkUh69z13I9XT8IbESGYON0s", limited: false, date: "Oct 18, 2024", title: "Modern Sommelier", desc: "Navigate the world of organic wines with guided tastings and pairing masterclass.", price: "$85" },
              ].map(({ img, limited, date, title, desc, price }) => (
                <div key={title} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-48 relative">
                    <img className="w-full h-full object-cover" alt={title} src={img} />
                    {limited && <div className="absolute top-4 left-4 bg-[#e31c40] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Limited Spots</div>}
                  </div>
                  <div className="p-8">
                    <div className="flex items-center gap-2 text-[#553ce2] font-bold text-xs mb-3">
                      <span className="material-symbols-outlined text-sm">calendar_today</span> {date}
                    </div>
                    <h4 className="text-xl font-bold mb-3 text-[#181c21]" style={{ fontFamily: "var(--font-plus-jakarta)" }}>{title}</h4>
                    <p className="text-[#474555] text-sm leading-relaxed mb-6">{desc}</p>
                    <div className="flex justify-between items-center border-t border-[#c8c4d8]/10 pt-6">
                      <span className="text-[#181c21] font-bold">{price} <span className="text-xs font-normal text-[#474555]">/ person</span></span>
                      <button className="text-[#553ce2] font-bold text-sm">Reserve Seat</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mb-24 px-8 max-w-7xl mx-auto">
          <div className="bg-[#553ce2] rounded-[2.5rem] py-16 px-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Stay Informed</h2>
            <p className="text-white/80 max-w-xl mx-auto mb-10 relative z-10">Join 5,000+ others receiving our weekly curation of upcoming classes, wellness tips, and chef recipes.</p>
            <div className="flex flex-col md:flex-row gap-4 max-w-md mx-auto relative z-10">
              <input className="flex-grow rounded-full border-none px-6 py-4 text-[#181c21] focus:ring-2 focus:ring-[#e4dfff]" placeholder="Email address" type="email" />
              <button className="bg-[#181c21] text-white px-8 py-4 rounded-full font-bold whitespace-nowrap hover:bg-slate-800 transition-colors" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Subscribe</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
