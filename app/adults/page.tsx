import { ClassCard } from "@/components/class-card";
import { SegmentHero } from "@/components/segment-hero";
import { SiteHeader } from "@/components/site-header";
import { classes } from "@/lib/mock-data";

export default function AdultsPage() {
  const adultClasses = classes.filter((c) => c.audience === "adults");
  return (
    <main>
      <SiteHeader active="adults" />
      <SegmentHero
        audience="adults"
        title="Refined workshops for personal growth"
        subtitle="Minimal, focused experiences for wellness, culinary mastery, and skill-building."
      />
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-slate-900">Featured Adult Workshops</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {adultClasses.map((item) => (
            <ClassCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </main>
  );
}
