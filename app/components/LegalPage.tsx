import { useTranslations } from "next-intl";
import SiteNavbar from "./SiteNavbar";
import SiteFooter from "./SiteFooter";

export default function LegalPage({
  pageKey,
  sections,
}: {
  pageKey: "privacy" | "terms" | "cookies";
  sections: readonly string[];
}) {
  const tLabel = useTranslations("Legal");
  const t = useTranslations(`Legal.${pageKey}`);
  const tSections = useTranslations(`Legal.${pageKey}.sections`);

  return (
    <>
      <SiteNavbar />
      <main className="pt-24 md:pt-32 pb-16 md:pb-24">
        <article className="max-w-3xl mx-auto px-4 md:px-6">
          <div className="text-[0.7rem] font-bold uppercase tracking-widest text-primary mb-4">
            {tLabel("label")}
          </div>
          <h1 className="font-headline font-extrabold text-4xl md:text-6xl leading-[1.05] tracking-tight mb-4">
            {t("title")}
          </h1>
          <p className="text-sm text-on-surface/50 mb-10">
            {tLabel("lastUpdated", { date: t("updated") })}
          </p>
          <p className="text-lg text-on-surface/80 leading-relaxed mb-12">
            {t("intro")}
          </p>

          <div className="space-y-10">
            {sections.map((key) => {
              const heading = tSections(`${key}.heading`);
              const body = tSections.raw(`${key}.body`) as string[];
              return (
                <section key={key}>
                  <h2 className="font-headline font-bold text-2xl md:text-3xl text-on-surface mb-4">
                    {heading}
                  </h2>
                  <div className="space-y-4 text-on-surface/75 leading-relaxed">
                    {body.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
