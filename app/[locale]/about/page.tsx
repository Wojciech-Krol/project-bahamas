import { useTranslations } from "next-intl";
import SiteNavbar from "../../components/SiteNavbar";
import SiteFooter from "../../components/SiteFooter";
import BetaSignup from "../../components/BetaSignup";
import { Icon } from "../../components/Icon";

const VALUE_KEYS = [
  { key: "spontaneity", icon: "bolt" },
  { key: "local", icon: "diversity_3" },
  { key: "curated", icon: "auto_awesome" },
] as const;

const TIMELINE_KEYS = ["y2023", "y2024", "y2026"] as const;

export default function AboutPage() {
  const t = useTranslations("About");
  const tValues = useTranslations("About.values");
  const tTimeline = useTranslations("About.timeline");

  return (
    <>
      <SiteNavbar />
      <main className="pt-20 md:pt-24">
        <section className="max-w-5xl mx-auto px-4 md:px-6 py-16 md:py-28 text-center">
          <span className="inline-block bg-primary-fixed/60 px-4 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-widest text-primary mb-6">
            {t("badge")}
          </span>
          <h1 className="font-headline font-extrabold text-4xl md:text-7xl leading-[1.05] tracking-tight text-on-surface mb-6">
            {t("heroStart")}{" "}
            <span className="italic text-primary">{t("heroEmphasis")}</span>{" "}
            {t("heroEnd")}
          </h1>
          <p className="text-xl md:text-2xl text-on-surface/70 leading-relaxed max-w-3xl mx-auto">
            {t("heroBody")}
          </p>
        </section>

        <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {VALUE_KEYS.map((v) => (
              <div
                key={v.key}
                className="bg-surface-container-lowest rounded-[2rem] p-7 border border-on-surface/[0.05] editorial-shadow"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center mb-5">
                  <Icon name={v.icon} className="text-[26px]" />
                </div>
                <h3 className="font-headline font-bold text-xl mb-3">
                  {tValues(`${v.key}.title`)}
                </h3>
                <p className="text-on-surface/70 leading-relaxed">
                  {tValues(`${v.key}.text`)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-secondary-fixed/20 py-16 md:py-24">
          <div className="max-w-5xl mx-auto px-4 md:px-6">
            <h2 className="font-headline font-bold text-4xl md:text-6xl leading-none tracking-tight text-center mb-12 md:mb-16">
              {t("timelineHeading")}
            </h2>
            <div className="relative">
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-on-surface/10" />
              <div className="space-y-10 md:space-y-16">
                {TIMELINE_KEYS.map((key, i) => (
                  <div
                    key={key}
                    className={`relative grid md:grid-cols-2 gap-6 md:gap-12 ${
                      i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
                    }`}
                  >
                    <div className="pl-12 md:pl-0 md:text-right">
                      <div className="font-headline font-extrabold text-5xl md:text-6xl text-primary">
                        {tTimeline(`${key}.year`)}
                      </div>
                      <div className="text-[0.7rem] font-bold uppercase tracking-widest text-on-surface/60 mt-1">
                        {tTimeline(`${key}.label`)}
                      </div>
                    </div>
                    <div className="pl-12 md:pl-0">
                      <p className="text-lg text-on-surface/80 leading-relaxed">
                        {tTimeline(`${key}.text`)}
                      </p>
                    </div>
                    <span className="absolute left-4 md:left-1/2 top-3 md:top-4 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-surface" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <BetaSignup variant="business" />
      </main>
      <SiteFooter />
    </>
  );
}
