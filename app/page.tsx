import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hakuna | Discover Classes in The Bahamas",
  description:
    "The ultimate destination for Bahamas Classes. From swimming to arts & crafts, find the perfect workshop for every age — Kids, Teens, and Adults.",
};

export default function HomePage() {
  return (
    <div className="bg-[#fff9f2] text-[#181c21] antialiased font-sans min-h-screen">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-sm">
        <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          <div className="text-2xl font-bold tracking-tighter text-slate-900" style={{ fontFamily: "var(--font-plus-jakarta)" }}>
            Hakuna
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-[#725DFF] font-bold border-b-2 border-[#725DFF] pb-1 text-sm tracking-tight">Explore</Link>
            <Link href="/kids" className="text-slate-600 hover:text-[#725DFF] transition-colors text-sm font-medium tracking-tight">Kids</Link>
            <Link href="/teens" className="text-slate-600 hover:text-[#725DFF] transition-colors text-sm font-medium tracking-tight">Teens</Link>
            <Link href="/adults" className="text-slate-600 hover:text-[#725DFF] transition-colors text-sm font-medium tracking-tight">Adults</Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center bg-[#fff1e0] rounded-lg px-4 py-2">
              <span className="material-symbols-outlined text-[#787587] text-sm">search</span>
              <input className="bg-transparent border-none outline-none text-sm font-medium w-32 lg:w-48 placeholder:text-[#787587] ml-2" placeholder="Find a class..." type="text" />
            </div>
            <Link href="/login" className="text-[#725DFF] font-bold text-sm px-4 py-2 hover:bg-slate-100/50 rounded-lg transition-all active:scale-95 duration-150">Sign In</Link>
            <Link href="/login" className="bg-[#553ce2] text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-[#6f59fc] transition-all active:scale-95 duration-150">Get Started</Link>
          </div>
        </div>
      </nav>

      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative px-6 py-16 md:py-32 overflow-hidden">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase">
                <span className="material-symbols-outlined text-sm">rocket_launch</span>
                New Spring Workshops Open
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-[#181c21] leading-tight" style={{ fontFamily: "var(--font-plus-jakarta)" }}>
                Unlock your family&apos;s{" "}
                <span className="text-[#553ce2] relative inline-block">
                  creativity.
                  <span className="absolute bottom-0 left-0 w-full h-3 bg-yellow-200 -z-10 rounded-full" />
                </span>
              </h1>
              <p className="text-[#474555] text-lg md:text-xl max-w-lg font-medium leading-relaxed">
                The ultimate destination for Bahamas Classes. From splashy swimming lessons to messy arts &amp; crafts, find the perfect workshop for every age.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 bg-white rounded-2xl p-2 flex items-center shadow-xl shadow-[#553ce2]/5 border-2 border-[#553ce2]/10">
                  <div className="flex items-center gap-3 px-4 flex-1">
                    <span className="material-symbols-outlined text-[#553ce2]">search</span>
                    <input className="border-none outline-none text-sm font-semibold w-full bg-transparent" placeholder="What do you want to learn?" type="text" />
                  </div>
                  <Link href="/discover" className="bg-[#553ce2] text-white px-8 py-4 rounded-xl font-bold transition-all hover:scale-105 active:scale-95">
                    Browse Classes
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm font-medium text-[#474555]">
                <div className="flex -space-x-3">
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[10px] font-bold">JD</div>
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-green-100 flex items-center justify-center text-[10px] font-bold">MK</div>
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-purple-100 flex items-center justify-center text-[10px] font-bold">SR</div>
                </div>
                <span>Join 500+ Bahamian families learning today</span>
              </div>
            </div>
            <div className="relative">
              <div className="relative playful-blob overflow-hidden aspect-square shadow-2xl rotate-3 border-[12px] border-white">
                <img
                  alt="Kids painting during a workshop"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfR9W_V4SA6BaLYGRa1bYYbdM4gSAuBdKc93HeI8KZCbLNqW8N8nCyoTGTnxY9TQUbi36KakGD3DZtSGzIvncoKZXsQv0UkRr5g25cb6MjkouskYFg-2RnYpcN710gKV2YRg0MsazvJQosE46mnO-6CfkEbzkbLG-BuOujE2W8Fff63BEBOeDNUB72IEcfflGZMZmYdKTkt8wD58fxKCCiIlSdBQWf672WhVoYCjttFeKHLLYcek8UFbXC73GNSqMRTkxjajIBrbA"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-3xl shadow-xl flex items-center gap-4 -rotate-3 border border-[#f5ece6]">
                <div className="bg-yellow-400 p-3 rounded-full text-white">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>palette</span>
                </div>
                <div>
                  <p className="font-black text-xl">Top Rated</p>
                  <p className="text-xs text-[#787587] font-bold uppercase tracking-widest">Arts &amp; Crafts</p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute top-1/4 right-0 -z-10 w-96 h-96 bg-[#553ce2]/10 blur-[100px] playful-blob" />
          <div className="absolute bottom-0 left-1/4 -z-10 w-64 h-64 bg-yellow-200/40 blur-[80px] playful-blob" />
        </section>

        {/* Age-Based Entry Points */}
        <section className="px-6 py-20 bg-[#fff4e6]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Classes for Every Stage</h2>
              <p className="text-[#474555] mt-4 font-medium text-lg">Fun, structured learning environments for all ages in Bahamas Classes</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Kids Card */}
              <div className="bg-white p-10 rounded-3xl shadow-sm hover:shadow-2xl transition-all group border-t-8 border-yellow-400">
                <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mb-8 rotate-3 group-hover:rotate-0 transition-transform">
                  <span className="material-symbols-outlined text-yellow-600 text-3xl">child_care</span>
                </div>
                <h3 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Kids</h3>
                <p className="text-[#474555] mb-8 font-medium">Safe, messy, and super-fun activities designed to spark curiosity in little minds.</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm font-semibold"><span className="material-symbols-outlined text-yellow-500 text-lg">check_circle</span> Swimming Lessons</li>
                  <li className="flex items-center gap-2 text-sm font-semibold"><span className="material-symbols-outlined text-yellow-500 text-lg">check_circle</span> Tiny Painters</li>
                  <li className="flex items-center gap-2 text-sm font-semibold"><span className="material-symbols-outlined text-yellow-500 text-lg">check_circle</span> Movement &amp; Music</li>
                </ul>
                <Link href="/kids" className="block w-full py-4 rounded-xl bg-yellow-400 text-white font-black tracking-tight hover:bg-yellow-500 transition-colors shadow-lg shadow-yellow-200 text-center">EXPLORE KIDS</Link>
              </div>
              {/* Teens Card */}
              <div className="bg-white p-10 rounded-3xl shadow-sm hover:shadow-2xl transition-all group border-t-8 border-[#553ce2]">
                <div className="w-16 h-16 bg-[#553ce2]/10 rounded-2xl flex items-center justify-center mb-8 -rotate-3 group-hover:rotate-0 transition-transform">
                  <span className="material-symbols-outlined text-[#553ce2] text-3xl">sports_basketball</span>
                </div>
                <h3 className="text-3xl font-black mb-4 italic tracking-tighter" style={{ fontFamily: "var(--font-plus-jakarta)" }}>TEENS</h3>
                <p className="text-[#474555] mb-8 font-medium">Dynamic, high-energy classes for the next generation of athletes and digital creators.</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm font-semibold"><span className="material-symbols-outlined text-[#553ce2] text-lg">bolt</span> Competitive Sports</li>
                  <li className="flex items-center gap-2 text-sm font-semibold"><span className="material-symbols-outlined text-[#553ce2] text-lg">bolt</span> Digital Illustration</li>
                  <li className="flex items-center gap-2 text-sm font-semibold"><span className="material-symbols-outlined text-[#553ce2] text-lg">bolt</span> Tech &amp; Coding</li>
                </ul>
                <Link href="/teens" className="block w-full py-4 rounded-xl bg-[#553ce2] text-white font-black tracking-tight hover:bg-[#6f59fc] transition-colors shadow-lg shadow-[#553ce2]/20 text-center">JOIN THE VIBE</Link>
              </div>
              {/* Adults Card */}
              <div className="bg-white p-10 rounded-3xl shadow-sm hover:shadow-2xl transition-all group border-t-8 border-blue-400">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 rotate-6 group-hover:rotate-0 transition-transform">
                  <span className="material-symbols-outlined text-blue-600 text-3xl">handyman</span>
                </div>
                <h3 className="text-3xl font-bold mb-4 tracking-tight" style={{ fontFamily: "var(--font-plus-jakarta)" }}>ADULTS</h3>
                <p className="text-[#474555] mb-8 font-medium">Refined workshops for hands-on skills, creative mastery, and active lifestyles.</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm font-semibold"><span className="material-symbols-outlined text-blue-500 text-lg">verified</span> Pottery &amp; Ceramics</li>
                  <li className="flex items-center gap-2 text-sm font-semibold"><span className="material-symbols-outlined text-blue-500 text-lg">verified</span> Gourmet Cooking</li>
                  <li className="flex items-center gap-2 text-sm font-semibold"><span className="material-symbols-outlined text-blue-500 text-lg">verified</span> Fitness Bootcamp</li>
                </ul>
                <Link href="/adults" className="block w-full py-4 rounded-xl bg-blue-500 text-white font-black tracking-tight hover:bg-blue-600 transition-colors shadow-lg shadow-blue-200 text-center">VIEW WORKSHOPS</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Categories */}
        <section className="px-6 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl font-extrabold tracking-tight text-slate-900" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Popular Categories</h2>
                <p className="text-[#474555] mt-2 font-medium">Hakuna&apos;s top-rated learning tracks</p>
              </div>
              <Link href="/discover" className="text-[#553ce2] font-bold flex items-center gap-2 group hover:underline">
                See All <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="col-span-2 row-span-2 relative group overflow-hidden rounded-[2.5rem] aspect-square md:aspect-auto">
                <img alt="Swimming classes" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWfBoYqcDiC-KGE98LpsSxnMmavlNky2h6f3n5qV2FncXVxMCODDMzxuH5ExrmACJL1032oF7yj6mKrp9ZDAWiahQXDt0Oet6zUl52Kg8vCzVgKZJnWKyXF24NdV3u1qTGzmWWk5MrFVfPz277NlvR-M_RQhDpIvZM_PeSCzUaciw-Ve5HxWk26AuAMTJYn27sejsbDJa6UQQy_vf4fUcHitZicKzwrHewV6ybMCaT0-x6RSKwrlLFQxLgmgH9iYtAKr_4BfDp8aY" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                  <h4 className="text-white text-3xl font-bold" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Swimming &amp; Aquatics</h4>
                  <p className="text-white/80 font-medium">45+ Classes available</p>
                </div>
              </div>
              {[
                { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCUI4wUF-2NVUeIoc-zTJ1BwXoAvQWPjU7hvIhU0PTmZEGkzSdsaL7kC-2HRxq8fTt-1TdJiXPhvTIhHVMDlGqVdxeKZ0CvifyTEyIZpHaxcdD6Qx-OMg_0rLqWm-QCmjBzKxPwhytjHgsA6uVRgCbC_AYcRx1PALkAzFm-_ADpDFHIXuHXupozZq0pAYIOcczN5wgUROy-kg3kzFycL8VqHKUM1e1dCnTTbYJYAudM-Ntn_hNdQz9SySXT2aA4DfWkeCJRLhs6Dmo", label: "Sports", gradient: "from-blue-600/80" },
                { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuABy9vlsYImE_fn6C7UoMezaOhq83Ymif23-bEFc77ateQo24zKaY7ZMnTn9a8b2Km6WRL91n_52rgtmQXyrnvKTt0r62d7PYGtCakKkDMPEmVIEdQOr4_AmIgHkMW_cbGROBq47cRCZ9Ob8WPKVF0WHxc7MnkFRhni32gowTUJn3kc6k5_thm1iAQAouO8bPyNJnoSlMQ7Dpli0aYnYB2smq8eevI2AQ9YjoBh88u0EPpyGVGoDMluP_F6RmyCbq0UL23AUo_kU_s", label: "Workshops", gradient: "from-orange-600/80" },
                { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDE88gt_gfmcZX6Y0zlTP_nNR_o2cQsgOubCWytzbq5zrFg6xApi8nxGOm3uEb5rAXyTdAcaQ0TRL8KG8J0t4j0T0gHsnS5m04Fw-Cjjuh75_fu5cFGG1VN0REAuRGlxFLSCTlXZrzG3HyYY_2F5IQHajgox15oVqf9KmZ6A1C8LZER2vCdnh1f_ekNlXz5NGYdwgPJ6jptP-VBOccquud_EiGKFn6-etJ_YPMr_vzBPVOhjkJcSCFpCly4VejXiSMc_3ZC0nTaUOg", label: "Tech", gradient: "from-purple-600/80" },
                { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCWWHDgGey0MJhJ5Vnm1_Hzo-d_u9XvEW4TgyKNqOEYI61pcvM4cYF15ufKRMyXOnZ9aQ399c1u7dvgX5R23-Bh9q_xt4m6CiKoIvVfA8xexTkobbOLbkN1WzpTUCjig_ndzCRpfo03190iOp8zD3acjDJbMElc8CsF6Y3Mb-hWLVdk-81p12qbL-K6sNp_ZLln781-ENtSix9tuceh6ys-UWBdwWeaSTwimjjutbKTsl81vcAtiuffRxJBhaeLI_-ha6OxBQukCRw", label: "Dance", gradient: "from-pink-600/80" },
              ].map(({ img, label, gradient }) => (
                <div key={label} className="relative group overflow-hidden rounded-[2rem] aspect-square">
                  <img alt={label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={img} />
                  <div className={`absolute inset-0 bg-gradient-to-t ${gradient} via-transparent to-transparent flex flex-col justify-end p-6`}>
                    <h4 className="text-white text-xl font-bold" style={{ fontFamily: "var(--font-plus-jakarta)" }}>{label}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Classes */}
        <section className="px-6 py-20 bg-[#fff9f2]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold tracking-tight" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Handpicked Experiences</h2>
              <p className="text-[#474555] mt-2 font-medium">Top-rated workshops in the Hakuna collection</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuABy9vlsYImE_fn6C7UoMezaOhq83Ymif23-bEFc77ateQo24zKaY7ZMnTn9a8b2Km6WRL91n_52rgtmQXyrnvKTt0r62d7PYGtCakKkDMPEmVIEdQOr4_AmIgHkMW_cbGROBq47cRCZ9Ob8WPKVF0WHxc7MnkFRhni32gowTUJn3kc6k5_thm1iAQAouO8bPyNJnoSlMQ7Dpli0aYnYB2smq8eevI2AQ9YjoBh88u0EPpyGVGoDMluP_F6RmyCbq0UL23AUo_kU_s", category: "Adults", title: "Artisanal Pottery Workshop", badge: "HOT", badgeColor: "bg-orange-100 text-orange-600", rating: "4.9", reviews: "128", duration: "2h 30m", price: "$45" },
                { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAWfBoYqcDiC-KGE98LpsSxnMmavlNky2h6f3n5qV2FncXVxMCODDMzxuH5ExrmACJL1032oF7yj6mKrp9ZDAWiahQXDt0Oet6zUl52Kg8vCzVgKZJnWKyXF24NdV3u1qTGzmWWk5MrFVfPz277NlvR-M_RQhDpIvZM_PeSCzUaciw-Ve5HxWk26AuAMTJYn27sejsbDJa6UQQy_vf4fUcHitZicKzwrHewV6ybMCaT0-x6RSKwrlLFQxLgmgH9iYtAKr_4BfDp8aY", category: "Kids", title: "Junior Soccer League", badge: "POPULAR", badgeColor: "bg-blue-100 text-blue-600", rating: "4.7", reviews: "84", duration: "1h 00m", price: "$25" },
                { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCst-VdvO0ohWS7HsepTANAOGFRAnPyaqQR1VR2MWJdM0YCxA2htdJ-sTxAObM0ioMaEqR_ylA-JiLHSmWazGuWSEfq6HN9w8IxR-Eux2ESZqud1fJFXnX-MAHQyu4SUxYjFehIMd5oXR6tMmK0XGk7dzR2hOXBgw7AC8OJAzdTFTMMUQmhZqqjN9ARj4Sok80b6Ycd6XwWoXtizlOBWtjq6xBOpx6LH4xhqo9C9BvmwsJVamyaxap3evdM1Jgp7mWnDhV3HVmUhPg", category: "Teens", title: "Code Mastery Pro", badge: "LIMITED", badgeColor: "bg-red-100 text-red-600", rating: "5.0", reviews: "52", duration: "3h 00m", price: "$80" },
              ].map(({ img, category, title, badge, badgeColor, rating, reviews, duration, price }) => (
                <div key={title} className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all group border border-[#e5e8ef]">
                  <div className="relative h-64 overflow-hidden">
                    <img alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={img} />
                    <div className="absolute top-4 left-4 bg-white/90 glass-effect px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-[#553ce2]">{category}</div>
                  </div>
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-xl" style={{ fontFamily: "var(--font-plus-jakarta)" }}>{title}</h4>
                      <span className={`${badgeColor} px-3 py-1 rounded-full text-xs font-black`}>{badge}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[#474555] mb-6 font-medium">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm text-yellow-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> {rating} ({reviews})</span>
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span> {duration}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-[#e5e8ef] pt-6">
                      <div>
                        <p className="text-xs text-[#787587] font-bold uppercase tracking-widest">Pricing from</p>
                        <p className="text-2xl font-black text-[#553ce2]">{price}</p>
                      </div>
                      <Link href="/classes/1" className="bg-[#553ce2] text-white p-4 rounded-2xl hover:bg-[#6f59fc] transition-colors shadow-lg shadow-[#553ce2]/20">
                        <span className="material-symbols-outlined">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="px-6 py-20 bg-[#fff4e6]">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-8" style={{ fontFamily: "var(--font-plus-jakarta)" }}>
                  Ready to learn? <br /><span className="text-[#553ce2] italic">It&apos;s easy-peasy.</span>
                </h2>
                <div className="space-y-12">
                  {[
                    { num: "1", color: "bg-yellow-400", title: "Pick Your Passion", desc: "Filter by age or activity to find the perfect swimming class or art workshop in the Bahamas." },
                    { num: "2", color: "bg-blue-500", title: "Save Your Spot", desc: "Quick and secure booking through Hakuna. Instant confirmation for you or your family." },
                    { num: "3", color: "bg-[#553ce2]", title: "Dive In!", desc: "Join the community, make new friends, and master awesome new skills in a fun environment." },
                  ].map(({ num, color, title, desc }, i) => (
                    <div key={i} className="flex gap-6">
                      <div className={`flex-shrink-0 w-12 h-12 ${color} text-white rounded-2xl flex items-center justify-center font-black text-xl rotate-3`}>{num}</div>
                      <div>
                        <h4 className="font-bold text-xl mb-2" style={{ fontFamily: "var(--font-plus-jakarta)" }}>{title}</h4>
                        <p className="text-[#474555] font-medium">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-8 rounded-[40px] shadow-2xl relative border border-[#e5e8ef]">
                <div className="aspect-video rounded-3xl overflow-hidden playful-blob border-4 border-white shadow-inner">
                  <img alt="Happy students learning" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAk_p-9BGAkcL8VyQylgIC7KECMYHj4ICFvce2GDsQ_5bMNsprsWWzW41A6o0GIKQvIANSkJl1Bz4y_vCzZ6-QkS0-l6CPRu52Uetkm_frxS5EoE9X2ex2oXIMr-yGyLf4nJztWyXvBYvCJTYyA-4TJnwTHKBOOna9QjFZdgYnJlH3Egux5-1iVa_UBpLfyyj0YvkA" />
                </div>
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center text-white text-center p-4 font-black text-sm rotate-12 shadow-lg">
                  JOIN 5,000+ FAMILIES
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#fff4e6] border-t-0 mt-20">
        <div className="grid grid-cols-2 md:flex md:justify-between items-center px-8 py-12 max-w-7xl mx-auto">
          <div className="col-span-2 md:col-span-1 mb-8 md:mb-0">
            <div className="text-lg font-bold text-slate-900 mb-2" style={{ fontFamily: "var(--font-plus-jakarta)" }}>Hakuna</div>
            <p className="text-xs font-normal text-slate-500 max-w-xs">The premium marketplace for discovering Bahamas Classes across all ages.</p>
          </div>
          <div className="flex flex-wrap gap-8 md:gap-12">
            <div className="flex flex-col gap-4">
              {["About Us", "Safety", "Partners"].map(link => <Link key={link} href="#" className="text-xs font-normal text-slate-500 hover:text-[#725DFF] transition-all duration-200">{link}</Link>)}
            </div>
            <div className="flex flex-col gap-4">
              {["Help Center", "Terms of Service", "Privacy Policy"].map(link => <Link key={link} href="#" className="text-xs font-normal text-slate-500 hover:text-[#725DFF] transition-all duration-200">{link}</Link>)}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 py-6 border-t border-slate-200 text-center">
          <p className="text-[10px] uppercase tracking-widest text-slate-400">© 2024 Hakuna Marketplace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
