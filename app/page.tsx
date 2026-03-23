import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

const ageCards = [
  {
    href: "/kids",
    title: "Kids",
    copy: "Safe, messy, and super-fun activities designed to spark curiosity in little minds.",
    icon: "child_care",
    border: "border-yellow-400",
    button: "bg-yellow-400 hover:bg-yellow-500",
  },
  {
    href: "/teens",
    title: "TEENS",
    copy: "Dynamic, high-energy classes for the next generation of athletes and digital creators.",
    icon: "sports_basketball",
    border: "border-[#553ce2]",
    button: "bg-[#553ce2] hover:bg-[#6f59fc]",
  },
  {
    href: "/adults",
    title: "ADULTS",
    copy: "Refined workshops for hands-on skills, creative mastery, and active lifestyles.",
    icon: "handyman",
    border: "border-blue-400",
    button: "bg-blue-500 hover:bg-blue-600",
  },
];

const classCards = [
  {
    title: "Artisanal Pottery Workshop",
    tag: "Adults",
    badge: "HOT",
    price: "$45",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuABy9vlsYImE_fn6C7UoMezaOhq83Ymif23-bEFc77ateQo24zKaY7ZMnTn9a8b2Km6WRL91n_52rgtmQXyrnvKTt0r62d7PYGtCakKkDMPEmVIEdQOr4_AmIgHkMW_cbGROBq47cRCZ9Ob8WPKVF0WHxc7MnkFRhni32gowTUJn3kc6k5_thm1iAQAouO8bPyNJnoSlMQ7Dpli0aYnYB2smq8eevI2AQ9YjoBh88u0EPpyGVGoDMluP_F6RmyCbq0UL23AUo_kU_s",
    href: "/classes/adults-cooking-1",
  },
  {
    title: "Junior Soccer League",
    tag: "Kids",
    badge: "POPULAR",
    price: "$25",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAWfBoYqcDiC-KGE98LpsSxnMmavlNky2h6f3n5qV2FncXVxMCODDMzxuH5ExrmACJL1032oF7yj6mKrp9ZDAWiahQXDt0Oet6zUl52Kg8vCzVgKZJnWKyXF24NdV3u1qTGzmWWk5MrFVfPz277NlvR-M_RQhDpIvZM_PeSCzUaciw-Ve5HxWk26AuAMTJYn27sejsbDJa6UQQy_vf4fUcHitZicKzwrHewV6ybMCaT0-x6RSKwrlLFQxLgmgH9iYtAKr_4BfDp8aY",
    href: "/classes/kids-swim-1",
  },
  {
    title: "Code Mastery Pro",
    tag: "Teens",
    badge: "LIMITED",
    price: "$80",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCst-VdvO0ohWS7HsepTANAOGFRAnPyaqQR1VR2MWJdM0YCxA2htdJ-sTxAObM0ioMaEqR_ylA-JiLHSmWazGuWSEfq6HN9w8IxR-Eux2ESZqud1fJFXnX-MAHQyu4SUxYjFehIMd5oXR6tMmK0XGk7dzR2hOXBgw7AC8OJAzdTFTMMUQmhZqqjN9ARj4Sok80b6Ycd6XwWoXtizlOBWtjq6xBOpx6LH4xhqo9C9BvmwsJVamyaxap3evdM1Jgp7mWnDhV3HVmUhPg",
    href: "/classes/teens-code-1",
  },
];

export default function HomePage() {
  return (
    <main className="bg-[#fff9f2]">
      <SiteHeader active="home" />
      <section className="relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 md:py-24 lg:py-28">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div className="space-y-7">
            <p className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-700">
              <span className="material-symbols-rounded text-sm">rocket_launch</span>
              New Spring Workshops Open
            </p>
            <h1 className="text-5xl font-extrabold leading-tight tracking-tighter text-slate-900 sm:text-6xl lg:text-7xl">
              Unlock your family&apos;s{" "}
              <span className="relative inline-block text-[#553ce2]">
                creativity.
                <span className="absolute bottom-1 left-0 -z-10 h-3 w-full rounded-full bg-yellow-200"></span>
              </span>
            </h1>
            <p className="max-w-xl text-lg font-medium leading-relaxed text-slate-600 md:text-xl">
              The ultimate destination for Bahamas classes. From splashy swimming lessons to messy arts and crafts,
              find the perfect workshop for every age.
            </p>
            <div className="flex max-w-2xl items-center rounded-2xl border-2 border-[#553ce2]/10 bg-white p-2 shadow-xl shadow-[#553ce2]/5">
              <div className="flex flex-1 items-center gap-3 px-3 sm:px-4">
                <span className="material-symbols-rounded text-[#553ce2]">search</span>
                <input
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="What do you want to learn?"
                  type="text"
                />
              </div>
              <Link
                href="/discover"
                className="rounded-xl bg-[#553ce2] px-5 py-3 text-sm font-bold text-white transition hover:scale-[1.02] hover:bg-[#6f59fc] sm:px-8 sm:py-4"
              >
                Browse Classes
              </Link>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
              <div className="flex -space-x-3">
                {["JD", "MK", "SR"].map((name, index) => (
                  <div
                    key={name}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold ${
                      index === 0 ? "bg-blue-100" : index === 1 ? "bg-green-100" : "bg-purple-100"
                    }`}
                  >
                    {name}
                  </div>
                ))}
              </div>
              <span>Join 500+ Bahamian families learning today</span>
            </div>
          </div>
          <div className="relative">
            <div className="playful-blob aspect-square rotate-3 overflow-hidden border-[12px] border-white shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfR9W_V4SA6BaLYGRa1bYYbdM4gSAuBdKc93HeI8KZCbLNqW8N8nCyoTGTnxY9TQUbi36KakGD3DZtSGzIvncoKZXsQv0UkRr5g25cb6MjkouskYFg-2RnYpcN710gKV2YRg0MsazvJQosE46mnO-6CfkEbzkbLG-BuOujE2W8Fff63BEBOeDNUB72IEcfflGZMZmYdKTkt8wD58fxKCCiIlSdBQWf672WhVoYCjttFeKHLLYcek8UFbXC73GNSqMRTkxjajIBrbA"
                alt="Kids painting during a workshop"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-3 flex -rotate-3 items-center gap-4 rounded-3xl border border-[#fcebd5] bg-white p-5 shadow-xl sm:-bottom-8 sm:-left-8 sm:p-6">
              <div className="rounded-full bg-yellow-400 p-3 text-white">
                <span className="material-symbols-rounded">palette</span>
              </div>
              <div>
                <p className="text-xl font-black">Top Rated</p>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Arts & Crafts</p>
              </div>
            </div>
          </div>
        </div>
        <div className="playful-blob absolute right-0 top-1/4 -z-10 h-80 w-80 bg-[#553ce2]/10 blur-[100px]"></div>
        <div className="playful-blob absolute bottom-0 left-1/4 -z-10 h-64 w-64 bg-yellow-200/40 blur-[80px]"></div>
      </section>

      <section className="bg-[#fff4e6] px-4 py-20 sm:px-6">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-12 text-center md:mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">Classes for Every Stage</h2>
            <p className="mt-4 text-lg font-medium text-slate-600">Fun, structured learning environments for all ages.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {ageCards.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`group rounded-3xl border-t-8 ${item.border} bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-2xl lg:p-10`}
              >
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 transition group-hover:scale-105">
                  <span className="material-symbols-rounded text-3xl text-slate-700">{item.icon}</span>
                </div>
                <h3 className="text-3xl font-black tracking-tight">{item.title}</h3>
                <p className="mt-4 text-sm font-medium text-slate-600">{item.copy}</p>
                <span
                  className={`mt-8 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-black tracking-tight text-white shadow-lg transition ${item.button}`}
                >
                  Explore {item.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">Popular Categories</h2>
              <p className="mt-2 font-medium text-slate-600">Curated Prism&apos;s top-rated learning tracks</p>
            </div>
            <Link className="hidden items-center gap-2 font-bold text-[#553ce2] hover:underline md:inline-flex" href="/discover">
              See All
              <span className="material-symbols-rounded">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            <div className="group relative col-span-2 row-span-2 overflow-hidden rounded-[2.2rem] aspect-square md:aspect-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWfBoYqcDiC-KGE98LpsSxnMmavlNky2h6f3n5qV2FncXVxMCODDMzxuH5ExrmACJL1032oF7yj6mKrp9ZDAWiahQXDt0Oet6zUl52Kg8vCzVgKZJnWKyXF24NdV3u1qTGzmWWk5MrFVfPz277NlvR-M_RQhDpIvZM_PeSCzUaciw-Ve5HxWk26AuAMTJYn27sejsbDJa6UQQy_vf4fUcHitZicKzwrHewV6ybMCaT0-x6RSKwrlLFQxLgmgH9iYtAKr_4BfDp8aY"
                alt="Swimming classes"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 sm:p-8">
                <h4 className="text-2xl font-bold text-white sm:text-3xl">Swimming & Aquatics</h4>
                <p className="font-medium text-white/80">45+ Classes available</p>
              </div>
            </div>
            {[
              { title: "Sports", color: "from-blue-600/80", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCUI4wUF-2NVUeIoc-zTJ1BwXoAvQWPjU7hvIhU0PTmZEGkzSdsaL7kC-2HRxq8fTt-1TdJiXPhvTIhHVMDlGqVdxeKZ0CvifyTEyIZpHaxcdD6Qx-OMg_0rLqWm-QCmjBzKxPwhytjHgsA6uVRgCbC_AYcRx1PALkAzFm-_ADpDFHIXuHXupozZq0pAYIOcczN5wgUROy-kg3kzFycL8VqHKUM1e1dCnTTbYJYAudM-Ntn_hNdQz9SySXT2aA4DfWkeCJRLhs6Dmo" },
              { title: "Workshops", color: "from-orange-600/80", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuABy9vlsYImE_fn6C7UoMezaOhq83Ymif23-bEFc77ateQo24zKaY7ZMnTn9a8b2Km6WRL91n_52rgtmQXyrnvKTt0r62d7PYGtCakKkDMPEmVIEdQOr4_AmIgHkMW_cbGROBq47cRCZ9Ob8WPKVF0WHxc7MnkFRhni32gowTUJn3kc6k5_thm1iAQAouO8bPyNJnoSlMQ7Dpli0aYnYB2smq8eevI2AQ9YjoBh88u0EPpyGVGoDMluP_F6RmyCbq0UL23AUo_kU_s" },
              { title: "Tech", color: "from-purple-600/80", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDE88gt_gfmcZX6Y0zlTP_nNR_o2cQsgOubCWytzbq5zrFg6xApi8nxGOm3uEb5rAXyTdAcaQ0TRL8KG8J0t4j0T0gHsnS5m04Fw-Cjjuh75_fu5cFGG1VN0REAuRGlxFLSCTlXZrzG3HyYY_2F5IQHajgox15oVqf9KmZ6A1C8LZER2vCdnh1f_ekNlXz5NGYdwgPJ6jptP-VBOccquud_EiGKFn6-etJ_YPMr_vzBPVOhjkJcSCFpCly4VejXiSMc_3ZC0nTaUOg" },
              { title: "Dance", color: "from-pink-600/80", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCWWHDgGey0MJhJ5Vnm1_Hzo-d_u9XvEW4TgyKNqOEYI61pcvM4cYF15ufKRMyXOnZ9aQ399c1u7dvgX5R23-Bh9q_xt4m6CiKoIvVfA8xexTkobbOLbkN1WzpTUCjig_ndzCRpfo03190iOp8zD3acjDJbMElc8CsF6Y3Mb-hWLVdk-81p12qbL-K6sNp_ZLln781-ENtSix9tuceh6ys-UWBdwWeaSTwimjjutbKTsl81vcAtiuffRxJBhaeLI_-ha6OxBQukCRw" },
            ].map((category) => (
              <div key={category.title} className="group relative overflow-hidden rounded-[2rem] aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={category.image}
                  alt={category.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />
                <div className={`absolute inset-0 flex flex-col justify-end bg-gradient-to-t ${category.color} via-transparent to-transparent p-6`}>
                  <h4 className="text-xl font-bold text-white">{category.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fff9f2] px-4 py-20 sm:px-6">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-14 text-center">
            <h2 className="text-4xl font-extrabold tracking-tight">Handpicked Experiences</h2>
            <p className="mt-2 font-medium text-slate-600">Top-rated workshops in the Curated Prism collection</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {classCards.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group overflow-hidden rounded-[2rem] border border-[#fcebd5] bg-white shadow-xl transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="relative h-64 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute left-4 top-4 rounded-full bg-white/90 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#553ce2]">
                    {item.tag}
                  </div>
                </div>
                <div className="p-7">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <h4 className="text-xl font-bold">{item.title}</h4>
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-600">{item.badge}</span>
                  </div>
                  <div className="mb-6 flex items-center gap-4 text-sm font-medium text-slate-600">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-rounded text-sm text-yellow-500">star</span>
                      4.9 (128)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-rounded text-sm">schedule</span>
                      2h 30m
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#fcebd5] pt-6">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Pricing from</p>
                      <p className="text-2xl font-black text-[#553ce2]">{item.price}</p>
                    </div>
                    <span className="rounded-2xl bg-[#553ce2] p-3 text-white shadow-lg shadow-[#553ce2]/20">
                      <span className="material-symbols-rounded">arrow_forward</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fff4e6] px-4 py-20 sm:px-6">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className="mb-8 text-4xl font-black tracking-tight md:text-5xl">
              Ready to learn? <br />
              <span className="italic text-[#553ce2]">It&apos;s easy-peasy.</span>
            </h2>
            <div className="space-y-10">
              {[
                { n: "1", title: "Pick Your Passion", copy: "Filter by age or activity to find the perfect swimming class or art workshop in the Bahamas.", color: "bg-yellow-400 rotate-3" },
                { n: "2", title: "Save Your Spot", copy: "Quick and secure booking through Curated Prism. Instant confirmation for you or your family.", color: "bg-blue-500 -rotate-3" },
                { n: "3", title: "Dive In!", copy: "Join the community, make new friends, and master awesome new skills in a fun environment.", color: "bg-[#553ce2] rotate-6" },
              ].map((step) => (
                <div key={step.n} className="flex gap-5">
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-xl font-black text-white ${step.color}`}>
                    {step.n}
                  </div>
                  <div>
                    <h4 className="mb-1 text-xl font-bold">{step.title}</h4>
                    <p className="font-medium text-slate-600">{step.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative rounded-[40px] border border-[#fcebd5] bg-white p-7 shadow-2xl">
            <div className="playful-blob aspect-video overflow-hidden rounded-3xl border-4 border-white shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAk_p-9BGAkcL8VyQylgIC7KECMYHj4ICFvce2GDsQ_5bMNsprsWWzW41A6o0GIKQvIANSkJl1Bz4y_vCzZ6-QkS0-l6CPRu52Uetkm_frxS5EoE9X2ex2oXIMr-yGyLf4nJztWyXvBYvCJTYyA-4TJnwTHVTauivv3pHIOJX4OJcY4NvPr8ciqzp3tLQpaX-MzVSZWUyn2lxU_b7mpf8_UH9266rgPy5THKBOOna9QjFZdgYnJlH3Egux5-1iVa_UBpLfyyj0YvkA"
                alt="Happy students learning"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -right-3 -top-7 flex h-28 w-28 rotate-12 items-center justify-center rounded-full bg-yellow-400 p-4 text-center text-xs font-black text-white shadow-lg sm:-right-10 sm:-top-10 sm:h-32 sm:w-32 sm:text-sm">
              JOIN 5,000+ FAMILIES
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
