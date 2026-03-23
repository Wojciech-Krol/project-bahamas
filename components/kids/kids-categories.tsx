import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";

const categories = [
  {
    name: "Art & Crafts",
    icon: "palette",
    classCount: 45,
    color: "bg-pink-100 text-pink-600",
    href: "/kids/art",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80",
    featured: true,
  },
  {
    name: "Music & Dance",
    icon: "music_note",
    classCount: 32,
    color: "bg-purple-100 text-purple-600",
    href: "/kids/music",
    image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&q=80",
    featured: true,
  },
  {
    name: "Sports",
    icon: "sports_soccer",
    classCount: 38,
    color: "bg-blue-100 text-blue-600",
    href: "/kids/sports",
    image: null,
    featured: false,
  },
  {
    name: "Coding",
    icon: "code",
    classCount: 24,
    color: "bg-green-100 text-green-600",
    href: "/kids/coding",
    image: null,
    featured: false,
  },
  {
    name: "Science",
    icon: "science",
    classCount: 28,
    color: "bg-cyan-100 text-cyan-600",
    href: "/kids/science",
    image: null,
    featured: false,
  },
  {
    name: "Languages",
    icon: "translate",
    classCount: 18,
    color: "bg-amber-100 text-amber-600",
    href: "/kids/languages",
    image: null,
    featured: false,
  },
];

export function KidsCategories() {
  const featuredCategories = categories.filter((c) => c.featured);
  const regularCategories = categories.filter((c) => !c.featured);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-gray-800)] mb-4">
            Explore by Category
          </h2>
          <p className="text-lg text-[var(--color-gray-500)]">
            Find the perfect class for your little one
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Featured Categories - Large */}
          {featuredCategories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="col-span-2 lg:col-span-2 group"
            >
              <div className="relative h-64 rounded-3xl overflow-hidden">
                <Image
                  src={category.image!}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${category.color} mb-3`}>
                    <Icon name={category.icon} size="sm" />
                    <span className="text-sm font-medium">{category.classCount} classes</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">{category.name}</h3>
                </div>
              </div>
            </Link>
          ))}

          {/* Regular Categories - Small */}
          {regularCategories.map((category) => (
            <Link key={category.name} href={category.href} className="group">
              <div className="h-full bg-[var(--color-kids-bg)] rounded-2xl p-5 border border-orange-100 hover:border-[var(--color-kids-primary)] hover:shadow-lg hover:shadow-orange-100/50 transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl ${category.color} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
                  <Icon name={category.icon} size="lg" />
                </div>
                <h3 className="font-semibold text-[var(--color-gray-800)] mb-1">
                  {category.name}
                </h3>
                <p className="text-sm text-[var(--color-gray-500)]">
                  {category.classCount} classes
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
