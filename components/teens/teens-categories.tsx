import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";

const categories = [
  {
    name: "Tech & Coding",
    icon: "code",
    classCount: 38,
    gradient: "from-cyan-500 to-blue-600",
    href: "/teens/tech",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
    featured: true,
  },
  {
    name: "Music Production",
    icon: "headphones",
    classCount: 24,
    gradient: "from-purple-500 to-pink-500",
    href: "/teens/music",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80",
    featured: true,
  },
  {
    name: "Content Creation",
    icon: "videocam",
    classCount: 28,
    gradient: "from-pink-500 to-rose-500",
    href: "/teens/content",
    image: null,
    featured: false,
  },
  {
    name: "Entrepreneurship",
    icon: "trending_up",
    classCount: 18,
    gradient: "from-amber-500 to-orange-500",
    href: "/teens/business",
    image: null,
    featured: false,
  },
  {
    name: "Art & Design",
    icon: "brush",
    classCount: 32,
    gradient: "from-emerald-500 to-teal-500",
    href: "/teens/art",
    image: null,
    featured: false,
  },
  {
    name: "Sports & Fitness",
    icon: "fitness_center",
    classCount: 22,
    gradient: "from-red-500 to-pink-500",
    href: "/teens/sports",
    image: null,
    featured: false,
  },
];

export function TeensCategories() {
  const featuredCategories = categories.filter((c) => c.featured);
  const regularCategories = categories.filter((c) => !c.featured);

  return (
    <section className="py-20 bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Find Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              Vibe
            </span>
          </h2>
          <p className="text-lg text-white/60">
            Explore programs designed for the next generation
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Featured - Large Cards */}
          {featuredCategories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="col-span-2 group"
            >
              <div className="relative h-64 rounded-2xl overflow-hidden">
                <Image
                  src={category.image!}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${category.gradient} opacity-70 mix-blend-multiply`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Icon name={category.icon} className="text-white" />
                    </div>
                    <span className="text-white/80 text-sm">{category.classCount} programs</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {category.name}
                  </h3>
                </div>

                {/* Hover Arrow */}
                <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Icon name="arrow_forward" className="text-white" />
                </div>
              </div>
            </Link>
          ))}

          {/* Regular Categories - Small Cards */}
          {regularCategories.map((category) => (
            <Link key={category.name} href={category.href} className="group">
              <div className="h-full bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-[var(--color-teens-neon-green)]/50 transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
                  <Icon name={category.icon} size="lg" className="text-white" />
                </div>
                <h3 className="font-semibold text-white mb-1 group-hover:text-[var(--color-teens-neon-green)] transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-white/50">
                  {category.classCount} programs
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
