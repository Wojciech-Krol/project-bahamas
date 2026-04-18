import SiteNavbar from "./SiteNavbar";
import SiteFooter from "./SiteFooter";

export type LegalSection = {
  heading: string;
  body: string[];
};

export default function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <SiteNavbar />
      <main className="pt-24 md:pt-32 pb-16 md:pb-24">
        <article className="max-w-3xl mx-auto px-4 md:px-6">
          <div className="text-[0.7rem] font-bold uppercase tracking-widest text-primary mb-4">
            Legal
          </div>
          <h1 className="font-headline font-extrabold text-4xl md:text-6xl leading-[1.05] tracking-tight mb-4">
            {title}
          </h1>
          <p className="text-sm text-on-surface/50 mb-10">Last updated: {updated}</p>
          <p className="text-lg text-on-surface/80 leading-relaxed mb-12">{intro}</p>

          <div className="space-y-10">
            {sections.map((s) => (
              <section key={s.heading}>
                <h2 className="font-headline font-bold text-2xl md:text-3xl text-on-surface mb-4">
                  {s.heading}
                </h2>
                <div className="space-y-4 text-on-surface/75 leading-relaxed">
                  {s.body.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
