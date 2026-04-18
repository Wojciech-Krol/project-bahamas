import SiteNavbar from "../components/SiteNavbar";
import SiteFooter from "../components/SiteFooter";
import BetaSignup from "../components/BetaSignup";
import { Icon } from "../components/Icon";

const VALUES = [
  {
    icon: "bolt",
    title: "Spontaneity first",
    text: "The best moments don't fit in a spreadsheet. We surface what's starting in the next two hours.",
  },
  {
    icon: "diversity_3",
    title: "Local by design",
    text: "Every host, studio and instructor on Hakuna is rooted in your city. No franchises, no fluff.",
  },
  {
    icon: "auto_awesome",
    title: "Curated, not catalogued",
    text: "We hand-pick experiences that feel alive — not just the ones with the biggest marketing budgets.",
  },
];

const TIMELINE = [
  { year: "2023", label: "The idea", text: "Hakuna starts as a weekend experiment: how do we help people say yes to their city?" },
  { year: "2024", label: "First cities", text: "Private beta with 450+ local hosts across Berlin and London." },
  { year: "2026", label: "Today", text: "Opening the doors to everyone — with a public beta and a fast-growing community." },
];

export default function AboutPage() {
  return (
    <>
      <SiteNavbar />
      <main className="pt-20 md:pt-24">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-4 md:px-6 py-16 md:py-28 text-center">
          <span className="inline-block bg-primary-fixed/60 px-4 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-widest text-primary mb-6">
            Our Vision
          </span>
          <h1 className="font-headline font-extrabold text-4xl md:text-7xl leading-[1.05] tracking-tight text-on-surface mb-6">
            A city you <span className="italic text-primary">actually</span> live in.
          </h1>
          <p className="text-xl md:text-2xl text-on-surface/70 leading-relaxed max-w-3xl mx-auto">
            Hakuna is a platform for people who&apos;d rather discover than plan. We connect you with local studios, workshops and open sessions — the kind of tiny gatherings that make a neighborhood feel like home.
          </p>
        </section>

        {/* Values */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="bg-surface-container-lowest rounded-[2rem] p-7 border border-on-surface/[0.05] editorial-shadow"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center mb-5">
                  <Icon name={v.icon} className="text-[26px]" />
                </div>
                <h3 className="font-headline font-bold text-xl mb-3">{v.title}</h3>
                <p className="text-on-surface/70 leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="bg-secondary-fixed/20 py-16 md:py-24">
          <div className="max-w-5xl mx-auto px-4 md:px-6">
            <h2 className="font-headline font-bold text-4xl md:text-6xl leading-none tracking-tight text-center mb-12 md:mb-16">
              The road so far
            </h2>
            <div className="relative">
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-on-surface/10" />
              <div className="space-y-10 md:space-y-16">
                {TIMELINE.map((t, i) => (
                  <div
                    key={t.year}
                    className={`relative grid md:grid-cols-2 gap-6 md:gap-12 ${
                      i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
                    }`}
                  >
                    <div className="pl-12 md:pl-0 md:text-right">
                      <div className="font-headline font-extrabold text-5xl md:text-6xl text-primary">
                        {t.year}
                      </div>
                      <div className="text-[0.7rem] font-bold uppercase tracking-widest text-on-surface/60 mt-1">
                        {t.label}
                      </div>
                    </div>
                    <div className="pl-12 md:pl-0">
                      <p className="text-lg text-on-surface/80 leading-relaxed">{t.text}</p>
                    </div>
                    <span className="absolute left-4 md:left-1/2 top-3 md:top-4 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-surface" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Beta + For Business */}
        <BetaSignup
          variant="business"
          title="Run a studio or venue? Let's talk."
          subtitle="We're onboarding a small group of partner studios, instructors and workshops. No fees during the beta."
          ctaLabel="Apply"
        />
      </main>
      <SiteFooter />
    </>
  );
}
