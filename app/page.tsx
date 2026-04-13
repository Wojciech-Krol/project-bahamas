"use client";

import { useEffect, useRef, useState } from "react";

/* ─── Icon helper ─── */
function Icon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   COMPACT SEARCH BAR (lives inside the navbar when scrolled)
   ════════════════════════════════════════════════════════════════════════════ */
function CompactSearchBar({ visible }: { visible: boolean }) {
  return (
    <div
      className={`hidden md:flex flex-1 max-w-2xl mx-12 transition-all duration-500 ease-[cubic-bezier(.4,0,.2,1)] ${
        visible
          ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
          : "opacity-0 -translate-y-3 scale-95 pointer-events-none"
      }`}
    >
      <div className="w-full flex items-center bg-white/50 rounded-full py-1.5 px-2 border-2 border-[#E8407A] shadow-sm hover:shadow-md transition-shadow duration-300">
        {/* Activities */}
        <div className="flex-1 flex flex-col px-4 border-r border-on-surface/5">
          <span className="text-[0.55rem] font-bold uppercase tracking-wider text-on-surface/40 leading-none mb-0.5">
            Looking for?
          </span>
          <span className="text-[0.75rem] font-semibold text-on-surface truncate">
            Activities
          </span>
        </div>
        {/* Neighborhood */}
        <div className="flex-1 flex flex-col px-4 border-r border-on-surface/5">
          <span className="text-[0.55rem] font-bold uppercase tracking-wider text-on-surface/40 leading-none mb-0.5">
            Neighborhood
          </span>
          <span className="text-[0.75rem] font-semibold text-on-surface truncate">
            Mitte, Berlin
          </span>
        </div>
        {/* When */}
        <div className="flex-1 flex flex-col px-4 border-r border-on-surface/5">
          <span className="text-[0.55rem] font-bold uppercase tracking-wider text-on-surface/40 leading-none mb-0.5">
            When?
          </span>
          <span className="text-[0.75rem] font-semibold text-on-surface truncate">
            Today
          </span>
        </div>
        {/* Age */}
        <div className="flex-1 flex flex-col px-4">
          <span className="text-[0.55rem] font-bold uppercase tracking-wider text-on-surface/40 leading-none mb-0.5">
            Age
          </span>
          <span className="text-[0.75rem] font-semibold text-on-surface truncate">
            Adult
          </span>
        </div>
        {/* Search Button */}
        <button className="bg-primary text-on-primary w-8 h-8 rounded-full flex items-center justify-center shrink-0 ml-1 hover:bg-tertiary transition-colors duration-200 active:scale-90">
          <Icon name="search" className="text-[16px]" />
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   ACTIVITY CARD
   ════════════════════════════════════════════════════════════════════════════ */
interface ActivityCardProps {
  title: string;
  time: string;
  location: string;
  price: string;
  imageUrl: string;
  imageAlt: string;
  offsetClass?: string;
}

function ActivityCard({
  title,
  time,
  location,
  price,
  imageUrl,
  imageAlt,
  offsetClass = "",
}: ActivityCardProps) {
  return (
    <div
      className={`bg-surface-container-lowest p-5 rounded-[2rem] flex gap-6 items-center border border-[#FAEEDA] editorial-shadow hover:scale-[1.02] transition-transform duration-300 ${offsetClass}`}
    >
      <div className="w-32 h-32 rounded-2xl overflow-hidden shrink-0">
        <img
          alt={imageAlt}
          className="w-full h-full object-cover"
          src={imageUrl}
        />
      </div>
      <div className="flex-grow">
        <h3 className="text-2xl font-bold text-on-surface mb-1">{title}</h3>
        <p className="text-primary font-semibold uppercase tracking-widest text-xs mb-3">
          {time}
        </p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-on-surface/40 text-sm">
            <Icon name="location_on" className="text-[18px]" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-on-surface/40 text-sm">
            <Icon name="payments" className="text-[18px]" />
            <span className="font-bold text-on-surface/80">{price}</span>
          </div>
        </div>
      </div>
      <button className="mr-2 text-on-surface/20 hover:text-primary transition-colors">
        <Icon name="arrow_forward_ios" className="text-3xl" />
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   COMMUNITY CARD
   ════════════════════════════════════════════════════════════════════════════ */
function CommunityCard({
  label,
  title,
  imageUrl,
  imageAlt,
  tall = false,
}: {
  label: string;
  title: string;
  imageUrl: string;
  imageAlt: string;
  tall?: boolean;
}) {
  return (
    <div
      className={`relative group overflow-hidden rounded-[3rem] ${
        tall ? "h-[500px] -mt-8" : "h-[450px]"
      }`}
    >
      <img
        alt={imageAlt}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        src={imageUrl}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c17] via-transparent to-transparent opacity-80" />
      <div className="absolute bottom-8 left-8 right-8 text-white">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-fixed mb-2">
          {label}
        </p>
        <h4 className="text-2xl font-bold">{title}</h4>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════════════════════ */
export default function Home() {
  const heroSearchRef = useRef<HTMLDivElement>(null);
  const [showCompactSearch, setShowCompactSearch] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the hero search bar leaves the viewport, show compact version
        setShowCompactSearch(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0.1,
        rootMargin: "-80px 0px 0px 0px", // account for fixed nav height
      }
    );

    const el = heroSearchRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, []);

  return (
    <>
      {/* ─── TopNavBar ─── */}
      <nav className="fixed top-0 w-full z-50 bg-[#fdf9f0]/80 backdrop-blur-xl shadow-[0px_20px_40px_rgba(45,10,23,0.06)] transition-all duration-300">
        <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          {/* Left */}
          <div className="flex items-center gap-12">
            <a
              href="#"
              className="text-2xl font-bold tracking-tighter text-primary font-headline"
            >
              HAKUNA
            </a>
            <div className="hidden md:flex gap-8">
              <a
                href="#"
                className="font-headline uppercase tracking-widest text-[0.75rem] font-semibold text-on-surface hover:text-primary hover:-translate-y-0.5 transition-all duration-300"
              >
                For venues
              </a>
            </div>
          </div>

          {/* Compact Search (shown on scroll) */}
          <CompactSearchBar visible={showCompactSearch} />

          {/* Right */}
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-widest hover:text-primary transition-colors">
              <Icon name="language" className="text-[18px]" />
              <span>EN</span>
            </button>
            <div className="hidden md:flex items-center gap-4">
              <button className="font-headline uppercase tracking-widest text-[0.75rem] font-semibold text-on-surface hover:text-primary transition-all">
                Log in
              </button>
              <button className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-headline uppercase tracking-widest text-[0.75rem] font-bold hover:bg-tertiary scale-95 hover:scale-100 duration-200 transition-all">
                Create account
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24">
        {/* ─── Hero Section ─── */}
        <section className="relative px-6 py-20 md:py-32 overflow-hidden">
          <div className="max-w-7xl mx-auto text-center flex flex-col items-center">
            <h1 className="font-headline font-extrabold text-5xl md:text-[6rem] leading-[1.05] tracking-tight text-on-surface mb-12">
              Start something <br />
              <span className="text-primary italic">new</span> today.
            </h1>

            {/* ── Hero Search Bar ── */}
            <div
              ref={heroSearchRef}
              className="search-container w-full max-w-5xl mb-12 group transition-all duration-500 ease-out hover:scale-[1.015]"
            >
              <div
                className="search-glass search-border inner-glow rounded-full p-2.5 shadow-[0_10px_40px_-10px_rgba(232,64,122,0.12)] group-hover:shadow-[0_20px_60px_-15px_rgba(232,64,122,0.25)] flex flex-col md:flex-row items-center gap-1 md:gap-0 transition-all duration-500"
                style={{ border: "2px solid #AD1F53" }}
              >
                {/* Activities */}
                <div className="flex-1 w-full flex items-center px-6 py-3 border-r border-on-surface/5 group/field">
                  <Icon
                    name="search"
                    className="text-primary/40 group-hover/field:text-primary transition-colors mr-4 text-[20px]"
                  />
                  <div className="text-left flex-1">
                    <label className="block text-[0.6rem] font-bold uppercase tracking-[0.2em] text-on-surface/40 mb-0.5">
                      Activities
                    </label>
                    <input
                      className="bg-transparent border-none p-0 w-full focus:ring-0 focus:outline-none placeholder:text-on-surface/30 text-[0.9rem] font-semibold text-on-surface"
                      placeholder="Tennis, pottery, yoga..."
                      type="text"
                    />
                  </div>
                </div>
                {/* Neighborhood */}
                <div className="flex-1 w-full flex items-center px-6 py-3 border-r border-on-surface/5 group/field">
                  <Icon
                    name="near_me"
                    className="text-primary/40 group-hover/field:text-primary transition-colors mr-4 text-[20px]"
                  />
                  <div className="text-left flex-1">
                    <label className="block text-[0.6rem] font-bold uppercase tracking-[0.2em] text-on-surface/40 mb-0.5">
                      Neighborhood
                    </label>
                    <input
                      className="bg-transparent border-none p-0 w-full focus:ring-0 focus:outline-none placeholder:text-on-surface/30 text-[0.9rem] font-semibold text-on-surface"
                      placeholder="Mitte, Berlin"
                      type="text"
                    />
                  </div>
                </div>
                {/* When */}
                <div className="flex-1 w-full flex items-center px-6 py-3 border-r border-on-surface/5 group/field">
                  <Icon
                    name="calendar_today"
                    className="text-primary/40 group-hover/field:text-primary transition-colors mr-4 text-[20px]"
                  />
                  <div className="text-left flex-1">
                    <label className="block text-[0.6rem] font-bold uppercase tracking-[0.2em] text-on-surface/40 mb-0.5">
                      When
                    </label>
                    <input
                      className="bg-transparent border-none p-0 w-full focus:ring-0 focus:outline-none placeholder:text-on-surface/30 text-[0.9rem] font-semibold text-on-surface"
                      placeholder="Today"
                      type="text"
                    />
                  </div>
                </div>
                {/* Age */}
                <div className="flex-1 w-full flex items-center px-6 py-3 md:border-none group/field">
                  <Icon
                    name="person"
                    className="text-primary/40 group-hover/field:text-primary transition-colors mr-4 text-[20px]"
                  />
                  <div className="text-left flex-1">
                    <label className="block text-[0.6rem] font-bold uppercase tracking-[0.2em] text-on-surface/40 mb-0.5">
                      Age
                    </label>
                    <input
                      className="bg-transparent border-none p-0 w-full focus:ring-0 focus:outline-none placeholder:text-on-surface/30 text-[0.9rem] font-semibold text-on-surface"
                      placeholder="Adult"
                      type="text"
                    />
                  </div>
                </div>
                {/* Submit */}
                <div className="p-1 pl-4">
                  <button className="bg-primary text-on-primary w-14 h-14 rounded-full flex items-center justify-center hover:scale-105 transition-all duration-300 shadow-[0_8px_20px_rgba(180,15,85,0.3)] active:scale-95">
                    <Icon name="arrow_forward" className="text-[24px]" />
                  </button>
                </div>
              </div>
            </div>

            <p className="text-on-surface/60 font-medium text-lg md:text-xl max-w-2xl">
              Hundreds of activities starting near you in the next 2 hours.
            </p>
          </div>

          {/* Floating Decorative Blurs */}
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-secondary-fixed/30 rounded-full blur-[100px] -z-10" />
          <div className="absolute bottom-0 -left-20 w-80 h-80 bg-primary-fixed/20 rounded-full blur-[80px] -z-10" />
        </section>

        {/* ─── Closest to You Section ─── */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-20 items-start">
            {/* Left Column */}
            <div className="space-y-8 sticky top-32">
              <div className="space-y-4">
                <span className="inline-block bg-secondary-container px-4 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-widest text-on-secondary-container">
                  Starting Soon
                </span>
                <h2 className="text-5xl md:text-7xl font-headline font-bold leading-none tracking-tighter">
                  Closest <br />
                  to You
                </h2>
                <p className="text-xl text-on-surface/60 max-w-md">
                  Activities starting in the next 2 hours. Don&apos;t wait. The
                  best things happen now.
                </p>
              </div>
              <button className="bg-primary text-on-primary px-10 py-5 rounded-xl font-headline font-extrabold uppercase tracking-[0.2em] text-sm hover:translate-y-[-4px] transition-all hover:shadow-2xl hover:bg-tertiary">
                BOOK IN 30 SECONDS
              </button>
              <div className="pt-8 grid grid-cols-2 gap-8 border-t border-on-surface/5">
                <div>
                  <div className="text-3xl font-bold text-primary">450+</div>
                  <div className="text-[0.7rem] uppercase font-bold tracking-widest opacity-40">
                    Local Hosts
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">12min</div>
                  <div className="text-[0.7rem] uppercase font-bold tracking-widest opacity-40">
                    Avg. Arrival
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (Cards) */}
            <div className="flex flex-col gap-6">
              <ActivityCard
                title="Sunrise Vinyasa Flow"
                time="Starts in 15 min"
                location="Prenzlauer Berg"
                price="€12.00"
                imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuDlqXn4n09xN2f9DAElfX4x81ij126SXbfpWo_xwleYNJR_1Mx7BjMA4B-FuFUmveCxVwk6V5_FZSTpsn-yWBwpc0xhKNO_vZ86rLf4REABK42B_80W4eMf6UM-FgquPFZ7HpSP8Le1cz9gLLZSz05TMKE6evFUt-pEIf87vCsCK3TPfWYdpz4vWobsTcZ-1ibRgHNTQsRYdRXAmPCt-n9sFrXGGfZ3GzRK2vuH7JfZTuOGRrvOxdiL9_83-njE5S85PNrDkmv_BW_O"
                imageAlt="Yoga session in a sun-drenched studio"
              />
              <ActivityCard
                title="Intro to Wheel Throwing"
                time="Starts in 42 min"
                location="Mitte District"
                price="€35.00"
                imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuBA_wFMjctlcwp-Pr0Qqxd9pmSGX4u9o9qb6l7WvTcCAUiPxdv9TcYveTEME1A9pymNOt44HkPuXlUDSKa7rrbRbtFn4AdhNYnqT8kvfkeYroUgwLx33sDPLTrsHolmK2Kl94Gij5ltB0dIVWzt9VTHbtpjeQpz58PbTRdsTRSPkGvuX6wwgdRugMWZJ3Ei52-fbUOsKLfxgHcgoPk96bhUwulzEitWBTbbEI-2kby28MID_insstTHfKZzZzWouZs0IDWv3jUoKR7V"
                imageAlt="Artisanal pottery studio workshop"
                offsetClass="translate-x-4 lg:translate-x-8"
              />
              <ActivityCard
                title="Open Padel Session"
                time="Starts in 1h 05 min"
                location="Friedrichshain"
                price="€8.00"
                imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuA5I5nT9bIUDrn_ubXjy1Pp-XX5_X_tFmAGq1K3c7XQm2-76HnGeLQrEhIQADtIHi9KmoxSRPBbCuovFFY5EKM5PXdDM9ZAO9elA8j2pgTVHSfZJbBl5oouZNhgryMPaKUOpV_nn_14-XY-9W5NJfjWkXXmUDiCJFfURcICDcxfJSWn69GuWJugYKhyvu_WJkNZEDf0kPjpJHShlsPT95MKxXYaIeCIEUkB-6BD26o4KNx5or1onED_0BuqYOD9YBGB7fH0jCA8yYWI"
                imageAlt="Modern outdoor padel court at sunset"
                offsetClass="translate-x-2"
              />
            </div>
          </div>
        </section>

        {/* ─── Community Section ─── */}
        <section className="bg-secondary-fixed/20 py-24 mt-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-headline font-bold mb-6 tracking-tight">
                The Hakuna Way
              </h2>
              <p className="text-lg text-on-surface/70 max-w-2xl mx-auto">
                Discover the magic of spontaneous city life. No planning
                required, just pure discovery of your local neighborhood&apos;s
                hidden gems.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <CommunityCard
                label="Community"
                title="Meet Local Souls"
                imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuDzfvOLNh5iMtRP73C0f8agdkHifQgMgfdL3BzKQyIjZcEqHJ5wlF-n6CE0b_uAucK-wu5ODI3QYAY1N3Vv88YmB2TNbdT65wwY7T-f2ZbeXCB9BvJaLIB3x-UE6XDex9R3RN9O7CnXmoTC0hqrI3cebXigL59rQy9sXUCmACGTCNKih-kOLgCC2N4ISUBSWrFhJBKC-ZChIDq7AIWk3iTm5jddi0Ilj16I2nCcZpBomozdkmF9eMoRKhVXH-YTCwbz2wLdkQZz8zGm"
                imageAlt="Group of diverse friends at an outdoor garden cafe"
              />
              <CommunityCard
                label="Discovery"
                title="Uncover Secret Spots"
                imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuBfRlg8iaj2MNMoV7mamt5dzTNOnAPNFsYwoEEEkJVr-ZtRTwSGOIpu3p47QGo1G2BPn0uKEnx3uwU2HhlDSLypCRFa8sIwjS4yT2wEd4g0aMq1Q5xykV4aJmiazFcCsPGkznZJtakEBeHzaKg-XfZ3u38IzTfzMVZtgKAUDcQ2HnjWUQqY0nxY0vclGwFTk3qJ6yNDDgzJQsmfqI_T09XHz9Z3CT1GTx_4HllUdp0h0MjUN3nBUpCUar_z2h0ROBu3b6AFMyN-SFU8"
                imageAlt="Intimate acoustic concert in a small library"
                tall
              />
              <CommunityCard
                label="Experience"
                title="Learn Something New"
                imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuDd5zc-bopDGFw_qwLSQ-frCeESAtMcpoa6-rodGtZlcu-g--ln0xkQzKOnsSA7amnrEpICSVJiNxPzbxE6DqChHbSO4vc7Xtf_g3GpLGmnsN6MuZxHhAs8Z0uMS7uxW2_zEXbnyIlKyaNW0tcgTsDaXwAroMakXOJ0ZpLjtOxvZVIpO4sqQnLjNU-tiqVmjHzv_8b-hI6zLC-loWrb5k-7uSACRUlmElZVzbVWx_MhxC3Al9eYZJnEnOPtMoO4XoZNwjwaK77rEmXB"
                imageAlt="Group engaged in a creative watercolor painting class"
              />
            </div>
          </div>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="w-full rounded-t-[3rem] mt-20 bg-surface-container-low">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 py-16 gap-8 max-w-7xl mx-auto">
          <div className="space-y-4 text-center md:text-left">
            <a href="#" className="text-xl font-bold text-on-surface">
              HAKUNA
            </a>
            <p className="font-body text-sm leading-relaxed text-on-surface/60">
              © 2024 HAKUNA. The Golden Curator.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            {["Privacy Policy", "Terms of Service", "Contact Us", "Instagram", "LinkedIn"].map(
              (link) => (
                <a
                  key={link}
                  href="#"
                  className="font-body text-sm leading-relaxed text-on-surface/60 hover:text-primary transition-colors"
                >
                  {link}
                </a>
              )
            )}
          </div>
          <div className="flex gap-4">
            {["share", "favorite"].map((icon) => (
              <div
                key={icon}
                className="w-10 h-10 rounded-full bg-on-surface/5 flex items-center justify-center hover:bg-primary/10 transition-colors cursor-pointer"
              >
                <Icon name={icon} className="text-[20px]" />
              </div>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
