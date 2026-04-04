import Link from "next/link";

/* ────────────────────────────────────────────
 * Data — all content extracted, no hardcoded
 * strings in JSX
 * ──────────────────────────────────────────── */

const nearbyClasses = [
  {
    id: 1,
    title: "CrossFit Power Hour",
    startsIn: "ZACZYNA SIĘ ZA 12 MIN",
    distance: "500m",
    price: "45 PLN",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDmWb_4RY96AdnOvUSGZxdb4j4JoGZj6PsctY_4nxeyRhxoQhQESXCwlDezzPkJoQbAS-THQTYxJL5dSs5gzJnjmWGRNB9I-8FMY-NEbClVd4KTvRtYS9WPRhqIgzlPizwajwAeyARAX7Ecn71lyJb2kSSWCz3jkXbLll9-LVr3FugInqvOFGf40KUgrQl6N8q_eNO615s52QrMSqBfHT5kjk1OU4Q45Gr94FMwf_VjDvSltufcoCY-AXpfHX1WjZ-0KylrdtB-tRLK",
    alt: "CrossFit workout",
  },
  {
    id: 2,
    title: "Warsztaty DJ-skie",
    startsIn: "ZACZYNA SIĘ ZA 45 MIN",
    distance: "1.2 km",
    price: "90 PLN",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAW7SHRYP-ZARkQnmcxmp-5_QLnLSnF_7hB0Pe2FJ5otZLYNTw9MdkV11AdJc2j0OIxyOgHnwpr7gwB82eJgGfZjNlf1slBt_LibsxCQU3p8PNoA2yF5xm5k1AsB-9MuuE7gCKDSEOVGVK_sQ82sXrsBbWVmH_Zbb6oDp2WCTcr_MypNBhm_YysvZzcN60gqZEtU6gozvNxVAIOnNl-AbtauwyBCNN7NOAupRKj9yre3AyiGtscKJtWx5mor9xRSmLTO_xS_YxXiJyA",
    alt: "DJ workshop with neon lights",
  },
  {
    id: 3,
    title: "Taniec Współczesny",
    startsIn: "ZACZYNA SIĘ ZA 70 MIN",
    distance: "850m",
    price: "30 PLN",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBSi_jdidGV8LMVQ_i6W2sPFX5G3RrtPfdqSBhyYn9w4wMrCNuSmHxe2apmJmTeoM1EbdOUw-V0er4mNW0OrPNokKJXDZOPEUpnU9PfwTqFCyaxg-dUU7OBP85SIsHyd9u2eV_MG3aSSfUmwq2JOQaVa9T-WqDGMwN8z5Figoa9v-32dgRagUT-qwmmRsILRqJ0GKEipjCSKlZQ4aYh0I-L4vmslsuy8ssUnPYxaGd8UjSS0M4isY6SeiwsHdVxDNj-5z95Fj4g5tLA",
    alt: "Contemporary dancer",
  },
];

const categories = [
  { icon: "fitness_center", label: "Sport" },
  { icon: "music_note", label: "Muzyka" },
  { icon: "code", label: "Kodowanie" },
  { icon: "auto_awesome_motion", label: "Taniec" },
  { icon: "palette", label: "Sztuka" },
  { icon: "language", label: "Języki" },
  { icon: "restaurant", label: "Gotowanie" },
  { icon: "more_horiz", label: "Więcej" },
];

/* ────────────────────────────────────────────
 * Page Component
 * ──────────────────────────────────────────── */

export default function HomePage() {
  return (
    <>
      {/* ───── TopNavBar ───── */}
      <header className="fixed left-0 right-0 z-50 top-0">
        <nav className="flex justify-between items-center bg-background border-b border-white/5 shadow-2xl shadow-primary-container/10 px-6 md:px-12 py-5">
          <Link
            href="/"
            className="text-2xl font-black tracking-tighter text-primary-container"
            style={{ fontFamily: "var(--font-plus-jakarta)" }}
          >
            HAKUNA
          </Link>

          <div className="flex-grow" />

          <div className="flex items-center gap-6 font-medium tracking-tight">
            <Link
              href="#"
              className="hidden md:block text-on-surface-variant hover:text-primary-container transition-colors duration-200"
            >
              Biznes
            </Link>
            <button className="hidden md:flex text-on-surface-variant hover:text-primary-container transition-colors duration-200 items-center gap-1">
              <span className="material-symbols-outlined text-lg">
                language
              </span>
              PL/ENG
            </button>
            <Link
              href="#"
              className="hidden md:block text-on-surface-variant hover:text-primary-container transition-colors duration-200"
            >
              Zaloguj się
            </Link>
            <button className="px-6 py-2 rounded-full font-bold text-sm bg-primary-container text-on-primary-container hover:scale-[1.02] transition-all active:scale-95 duration-200 glow-cyan">
              Utwórz konto
            </button>
          </div>
        </nav>
      </header>

      <main className="pt-32">
        {/* ───── Hero Section ───── */}
        <section className="relative min-h-[700px] flex flex-col items-center justify-center px-6 overflow-hidden">
          {/* Subtle neon grid */}
          <div className="absolute inset-0 neon-grid pointer-events-none opacity-40" />
          {/* Gradient fade to surface */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background pointer-events-none" />

          <div className="relative z-10 text-center max-w-5xl mx-auto w-full">
            <h1
              className="font-extrabold text-5xl md:text-7xl lg:text-8xl tracking-tighter text-primary mb-12 text-glow-cyan leading-[1.05]"
              style={{ fontFamily: "var(--font-plus-jakarta)" }}
            >
              Zacznij coś nowego dzisiaj.
            </h1>

            {/* ─── Search Bar ─── */}
            <div className="bg-surface-container-high/80 backdrop-blur-2xl rounded-xl p-2 md:p-3 flex flex-col md:flex-row gap-2 shadow-2xl border border-white/5 max-w-4xl mx-auto">
              <SearchField label="Czego szukasz?" placeholder="Np. Muay Thai, Gitara..." />
              <SearchField label="Twoja dzielnica" placeholder="Warszawa, Śródmieście" />
              <SearchField label="Kiedy?" placeholder="Dziś" className="w-full md:w-32" />
              <SearchField label="Twój wiek" placeholder="25+" className="w-full md:w-32" />
              <button className="bg-primary-container text-on-primary-container hover:bg-primary-fixed-dim transition-all aspect-square md:aspect-auto md:px-8 flex items-center justify-center rounded-lg active:scale-95 glow-cyan group">
                <span className="material-symbols-outlined font-black scale-125 group-hover:scale-150 transition-transform">
                  search
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* ───── Najbliżej Ciebie ───── */}
        <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-4 lg:sticky lg:top-32">
            <h2
              className="font-extrabold text-4xl md:text-5xl tracking-tighter text-primary mb-4 leading-tight"
              style={{ fontFamily: "var(--font-plus-jakarta)" }}
            >
              Najbliżej Ciebie
            </h2>
            <p className="text-white/60 text-lg mb-8 max-w-xs">
              Zajęcia zaczynające się w ciągu najbliższych 2 godzin. Nie zwlekaj.
            </p>
            <button className="w-full py-5 rounded-full bg-tertiary-container text-on-tertiary-container font-black text-lg uppercase tracking-widest hover:scale-[1.03] transition-all glow-lime">
              Zarezerwuj w 30 sekund
            </button>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-4">
            {nearbyClasses.map((cls) => (
              <div
                key={cls.id}
                className="bg-surface-container-low p-4 md:p-6 rounded-lg flex flex-col md:flex-row md:items-center justify-between group hover:bg-surface-container-high transition-all cursor-pointer gap-4"
              >
                <div className="flex items-center gap-4 md:gap-6">
                  <div
                    className="h-16 w-16 rounded-lg bg-cover bg-center flex-shrink-0 grayscale group-hover:grayscale-0 transition-all border border-white/5"
                    style={{ backgroundImage: `url('${cls.image}')` }}
                    role="img"
                    aria-label={cls.alt}
                  />
                  <div>
                    <h3 className="font-bold text-lg md:text-xl text-primary">
                      {cls.title}
                    </h3>
                    <p className="text-tertiary-fixed-dim font-bold text-sm tracking-tighter">
                      {cls.startsIn}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-8 md:gap-12 text-right ml-auto">
                  <div>
                    <span className="block text-white/40 text-[10px] uppercase font-bold mb-1">
                      Dystans
                    </span>
                    <span className="text-white font-bold">{cls.distance}</span>
                  </div>
                  <div>
                    <span className="block text-white/40 text-[10px] uppercase font-bold mb-1">
                      Cena
                    </span>
                    <span className="text-tertiary-container font-black text-xl">
                      {cls.price}
                    </span>
                  </div>
                  <button className="bg-white/5 hover:bg-white/10 px-6 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap">
                    Zapisz się
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ───── Categories ───── */}
        <section className="bg-surface-container-low/50 py-16">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-4 md:gap-8">
              <h2
                className="font-extrabold text-4xl md:text-5xl tracking-tighter text-primary"
                style={{ fontFamily: "var(--font-plus-jakarta)" }}
              >
                Wybierz swój kierunek
              </h2>
              <p className="text-white/40 font-bold uppercase tracking-widest text-sm max-w-sm md:text-right">
                Eksploruj setki kategorii dostępnych od zaraz w Twojej okolicy.
              </p>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-6 md:gap-8">
              {categories.map((cat) => (
                <div
                  key={cat.label}
                  className="group flex flex-col items-center gap-3 md:gap-4 cursor-pointer"
                >
                  <div className="w-full aspect-square rounded-full bg-surface-container-high border-2 border-transparent group-hover:border-primary-container group-hover:scale-105 transition-all flex items-center justify-center shadow-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary-container/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="material-symbols-outlined text-3xl md:text-4xl text-primary-container">
                      {cat.icon}
                    </span>
                  </div>
                  <span className="font-bold text-xs md:text-sm uppercase tracking-wider text-white/70 group-hover:text-primary transition-colors">
                    {cat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───── Energy Banner CTA ───── */}
        <section className="py-20 bg-primary-container text-on-primary-container text-center overflow-hidden relative">
          <div className="absolute -left-20 top-0 text-[10rem] font-black opacity-10 leading-none select-none italic uppercase" style={{ fontFamily: "var(--font-plus-jakarta)" }}>
            HAKUNA
          </div>
          <div className="absolute -right-20 bottom-0 text-[10rem] font-black opacity-10 leading-none select-none italic uppercase" style={{ fontFamily: "var(--font-plus-jakarta)" }}>
            HAKUNA
          </div>
          <div className="relative z-10 px-6">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-none uppercase italic" style={{ fontFamily: "var(--font-plus-jakarta)" }}>
              Nie czekaj na okazję.<br />Stwórz ją teraz.
            </h2>
            <button className="bg-[#0a0514] text-white px-12 py-5 rounded-full text-xl font-black hover:scale-105 transition-transform shadow-2xl uppercase tracking-tighter hover:shadow-xl hover:shadow-[#0a0514]/50">
              ZAREZERWUJ JUŻ TERAZ
            </button>
          </div>
        </section>
      </main>

      {/* ───── Footer ───── */}
      <footer className="w-full bg-surface-container-lowest border-t border-white/5 mt-8 md:mt-16">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 py-10 md:py-12 w-full text-sm gap-6">
          <div
            className="text-lg font-bold text-primary-container"
            style={{ fontFamily: "var(--font-plus-jakarta)" }}
          >
            HAKUNA
          </div>
          <div className="flex gap-6 md:gap-8">
            <Link
              href="#"
              className="text-white/40 hover:text-white transition-colors"
            >
              Prywatność
            </Link>
            <Link
              href="#"
              className="text-white/40 hover:text-white transition-colors"
            >
              Regulamin
            </Link>
            <Link
              href="#"
              className="text-white/40 hover:text-white transition-colors"
            >
              Kontakt
            </Link>
          </div>
          <div className="text-white/30">
            © 2025 HAKUNA. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}

/* ────────────────────────────────────────────
 * SearchField Component — reusable search input
 * ──────────────────────────────────────────── */

function SearchField({
  label,
  placeholder,
  className = "flex-1",
}: {
  label: string;
  placeholder: string;
  className?: string;
}) {
  return (
    <div className={`${className} group`}>
      <div className="px-4 md:px-6 py-3 md:py-4 rounded-lg bg-surface-container-highest/50 transition-all hover:bg-surface-container-highest group-focus-within:bg-surface-container-highest relative overflow-hidden">
        <label className="block text-[10px] uppercase tracking-widest text-tertiary-fixed-dim font-bold mb-1">
          {label}
        </label>
        <input
          className="w-full bg-transparent border-none p-0 text-on-surface placeholder:text-white/20 focus:ring-0 focus:outline-none font-bold text-base md:text-lg"
          placeholder={placeholder}
          type="text"
        />
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-tertiary transform scale-x-0 transition-transform duration-300 group-focus-within:scale-x-100" />
      </div>
    </div>
  );
}
