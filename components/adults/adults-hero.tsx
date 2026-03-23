import Image from "next/image";
import { SearchBar } from "@/components/search-bar";
import { Icon } from "@/components/ui/icon";

export function AdultsHero() {
  return (
    <section className="relative min-h-[85vh] flex items-center pt-16 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1920&q=80"
          alt="Yoga and wellness"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/95 via-emerald-900/80 to-emerald-900/60" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
            <Icon name="verified" size="sm" className="text-emerald-300" filled />
            <span className="text-sm font-medium text-white/90">Expert-Led Workshops</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Refine Your{" "}
            <span className="text-emerald-300">Craft</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-white/80 mb-8 leading-relaxed max-w-xl">
            Discover curated workshops designed for adults who value quality experiences.
            From mindful yoga to culinary mastery - elevate your skills.
          </p>

          {/* Search Bar */}
          <SearchBar
            variant="adults"
            placeholder="Search workshops, instructors..."
            className="max-w-xl mb-10"
          />

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Icon name="workspace_premium" className="text-amber-400" filled />
              </div>
              <div className="text-white">
                <div className="font-semibold">200+</div>
                <div className="text-sm text-white/60">Premium Classes</div>
              </div>
            </div>
            <div className="w-px h-10 bg-white/20 hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Icon name="person" className="text-emerald-300" filled />
              </div>
              <div className="text-white">
                <div className="font-semibold">80+</div>
                <div className="text-sm text-white/60">Expert Instructors</div>
              </div>
            </div>
            <div className="w-px h-10 bg-white/20 hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Icon name="star" className="text-amber-400" filled />
              </div>
              <div className="text-white">
                <div className="font-semibold">4.9</div>
                <div className="text-sm text-white/60">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
