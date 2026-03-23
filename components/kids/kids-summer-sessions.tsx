import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

const summerCamps = [
  {
    title: "Art Camp Week",
    dates: "July 8-12",
    description: "5 days of painting, crafts, and creative expression",
    image: "https://images.unsplash.com/photo-1560421683-6856ea585c78?w=800&q=80",
    price: 199,
    spotsLeft: 8,
  },
  {
    title: "Coding Bootcamp",
    dates: "July 15-19",
    description: "Learn to build games and apps with Scratch",
    image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&q=80",
    price: 249,
    spotsLeft: 5,
  },
  {
    title: "Sports Adventure Week",
    dates: "July 22-26",
    description: "Swimming, soccer, basketball, and more!",
    image: "https://images.unsplash.com/photo-1461896836934- voices-for-youth?w=800&q=80",
    price: 179,
    spotsLeft: 12,
  },
];

export function KidsSummerSessions() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-[var(--color-kids-primary)] text-sm font-medium mb-3">
              <Icon name="wb_sunny" size="sm" filled />
              <span>Summer 2026</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-gray-800)]">
              Summer Camp Sessions
            </h2>
          </div>
          <Button variant="outline" className="border-[var(--color-kids-primary)] text-[var(--color-kids-primary)]">
            View All Camps
          </Button>
        </div>

        {/* Camps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {summerCamps.map((camp) => (
            <article
              key={camp.title}
              className="group bg-[var(--color-kids-bg)] rounded-2xl overflow-hidden border border-orange-100 hover:shadow-xl transition-all duration-300"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={camp.image}
                  alt={camp.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-white text-[var(--color-kids-primary)]">
                    {camp.dates}
                  </span>
                </div>
                {camp.spotsLeft < 10 && (
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500 text-white">
                      {camp.spotsLeft} spots left
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-bold text-lg text-[var(--color-gray-800)] mb-2">
                  {camp.title}
                </h3>
                <p className="text-sm text-[var(--color-gray-500)] mb-4">
                  {camp.description}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-[var(--color-kids-primary)]">
                      ${camp.price}
                    </span>
                    <span className="text-sm text-[var(--color-gray-400)]"> /week</span>
                  </div>
                  <Button size="sm" className="bg-[var(--color-kids-primary)] hover:bg-orange-600">
                    Book Now
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
