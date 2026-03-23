import { ClassCard } from "@/components/class-card";
import { SegmentHero } from "@/components/segment-hero";
import { SiteHeader } from "@/components/site-header";
import { classes } from "@/lib/mock-data";

export default function TeensPage() {
  const teensClasses = classes.filter((c) => c.audience === "teens");
  return (
    <main className="bg-slate-950">
      <SiteHeader active="teens" />
      <SegmentHero
        audience="teens"
        title="Electric programs for builders and creators"
        subtitle="A high-energy discovery hub for tech, movement, and competitive learning."
      />
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-white">Trending Teen Classes</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {teensClasses.map((item) => (
            <ClassCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </main>
  );
}
