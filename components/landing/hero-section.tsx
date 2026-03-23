import Image from "next/image";
import { SearchBar } from "@/components/search-bar";
import { Icon } from "@/components/ui/icon";

const stats = [
  { value: "500+", label: "Classes" },
  { value: "150+", label: "Instructors" },
  { value: "10K+", label: "Students" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-16 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=80"
          alt="Bahamas beach activities"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-gray-800)]/90 via-[var(--color-gray-800)]/70 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
            <Icon name="location_on" size="sm" className="text-[var(--color-primary-light)]" filled />
            <span className="text-sm text-white/90">Discover The Bahamas</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight text-balance">
            Discover Your Next{" "}
            <span className="text-[var(--color-primary-light)]">Adventure</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-white/80 mb-8 leading-relaxed max-w-xl">
            Explore hundreds of classes for all ages - from art and music to sports
            and coding. Find the perfect activity in The Bahamas.
          </p>

          {/* Search Bar */}
          <div className="mb-10">
            <SearchBar
              variant="default"
              placeholder="Search classes, activities, instructors..."
              className="max-w-xl"
            />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 sm:gap-12">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl sm:text-4xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="flex flex-col items-center gap-2 text-white/60">
          <span className="text-sm">Scroll to explore</span>
          <Icon name="keyboard_arrow_down" className="animate-bounce" />
        </div>
      </div>
    </section>
  );
}
