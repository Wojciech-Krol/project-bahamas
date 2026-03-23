import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";

const categories = [
  {
    name: "Yoga & Mindfulness",
    icon: "self_improvement",
    classCount: 48,
    href: "/adults/yoga",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
    featured: true,
    description: "Find balance and inner peace",
  },
  {
    name: "Culinary Arts",
    icon: "restaurant",
    classCount: 36,
    href: "/adults/culinary",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80",
    featured: true,
    description: "Master the art of cooking",
  },
  {
    name: "Photography",
    icon: "photo_camera",
    classCount: 28,
    href: "/adults/photography",
    image: null,
    featured: false,
    description: null,
  },
  {
    name: "Wine & Spirits",
    icon: "wine_bar",
    classCount: 18,
    href: "/adults/wine",
    image: null,
    featured: false,
    description: null,
  },
  {
    name: "Wellness & Fitness",
    icon: "fitness_center",
    classCount: 42,
    href: "/adults/wellness",
    image: null,
    featured: false,
    description: null,
  },
  {
    name: "Creative Writing",
    icon: "edit_note",
    classCount: 22,
    href: "/adults/writing",
    image: null,
    featured: false,
    description: null,
  },
];

export function AdultsCategories() {
  const featuredCategories = categories.filter((c) => c.featured);
  const regularCategories = categories.filter((c) => !c.featured);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-gray-800)] mb-4">
            Curated Categories
          </h2>
          <p className="text-lg text-[var(--color-gray-500)] max-w-2xl mx-auto">
            Explore workshops designed for discerning adults seeking quality experiences
          </p>
        </div>

        {/* Featured Categories - Large Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {featuredCategories.map((category) => (
            <Link key={category.name} href={category.href} className="group">
              <div className="relative h-72 rounded-3xl overflow-hidden">
                <Image
                  src={category.image!}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Icon name={category.icon} className="text-white" size="lg" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {category.name}
                  </h3>
                  <p className="text-white/80 mb-3">{category.description}</p>
                  <div className="flex items-center gap-2 text-emerald-300">
                    <span className="text-sm font-medium">{category.classCount} workshops</span>
                    <Icon name="arrow_forward" size="sm" className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Regular Categories - Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {regularCategories.map((category) => (
            <Link key={category.name} href={category.href} className="group">
              <div className="h-full bg-[var(--color-adults-bg)] border border-emerald-100 rounded-2xl p-5 hover:border-[var(--color-adults-primary)] hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-adults-primary)]/10 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                  <Icon name={category.icon} size="lg" className="text-[var(--color-adults-primary)]" />
                </div>
                <h3 className="font-semibold text-[var(--color-gray-800)] mb-1 group-hover:text-[var(--color-adults-primary)] transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-[var(--color-gray-500)]">
                  {category.classCount} workshops
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
