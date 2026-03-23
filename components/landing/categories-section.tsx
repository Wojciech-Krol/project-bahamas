import { CategoryCard } from "@/components/category-card";

const categories = [
  { name: "Art & Crafts", icon: "palette", classCount: 85, href: "/categories/art" },
  { name: "Music", icon: "music_note", classCount: 62, href: "/categories/music" },
  { name: "Sports", icon: "sports_soccer", classCount: 94, href: "/categories/sports" },
  { name: "Dance", icon: "sports_gymnastics", classCount: 48, href: "/categories/dance" },
  { name: "Coding", icon: "code", classCount: 36, href: "/categories/coding" },
  { name: "Cooking", icon: "restaurant", classCount: 54, href: "/categories/cooking" },
  { name: "Languages", icon: "translate", classCount: 42, href: "/categories/languages" },
  { name: "Photography", icon: "photo_camera", classCount: 28, href: "/categories/photography" },
];

export function CategoriesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-gray-800)] mb-2">
              Popular Categories
            </h2>
            <p className="text-lg text-[var(--color-gray-500)]">
              Browse classes by your interests
            </p>
          </div>
          <a
            href="/categories"
            className="text-[var(--color-primary)] font-medium hover:underline"
          >
            View all categories
          </a>
        </div>

        {/* Categories Grid - Bento Style */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((category, index) => (
            <CategoryCard
              key={category.name}
              name={category.name}
              icon={category.icon}
              classCount={category.classCount}
              href={category.href}
              variant="default"
              size={index < 2 ? "lg" : "md"}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
