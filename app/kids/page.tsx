import { ClassCard } from "@/components/class-card";
import { SegmentHero } from "@/components/segment-hero";
import { SiteHeader } from "@/components/site-header";
import { classes } from "@/lib/mock-data";

export default function KidsPage() {
  const kidsClasses = classes.filter((c) => c.audience === "kids");
  return (
    <main>
      <SiteHeader active="kids" />
      <SegmentHero
        audience="kids"
        title="Playful learning for curious minds"
        subtitle="Warm, parent-friendly discovery with activity-first experiences."
      />
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-slate-900">Popular Kids Classes</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {kidsClasses.map((item) => (
            <ClassCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </main>
  );
}
