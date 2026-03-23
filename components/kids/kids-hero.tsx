import Image from "next/image";
import { SearchBar } from "@/components/search-bar";
import { Icon } from "@/components/ui/icon";

export function KidsHero() {
  return (
    <section className="relative min-h-[85vh] flex items-center pt-16 overflow-hidden">
      {/* Background with playful pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-amber-400 to-orange-500" />
      
      {/* Decorative circles */}
      <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-white/10 blur-xl" />
      <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-yellow-300/20 blur-2xl" />
      <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-orange-300/30 blur-lg" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
              <Icon name="child_care" size="sm" className="text-white" filled />
              <span className="text-sm font-medium text-white">Ages 4-12</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Where Learning{" "}
              <span className="text-yellow-200">Meets Fun!</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-white/90 mb-8 leading-relaxed max-w-xl">
              Discover creative classes that spark curiosity and build confidence.
              From art adventures to coding quests - there&apos;s something for every young explorer!
            </p>

            {/* Search Bar */}
            <SearchBar
              variant="kids"
              placeholder="Search kids classes..."
              className="max-w-lg mb-8"
            />

            {/* Quick stats */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-white">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Icon name="palette" size="sm" />
                </div>
                <span className="font-medium">180+ Classes</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Icon name="group" size="sm" />
                </div>
                <span className="font-medium">50+ Instructors</span>
              </div>
            </div>
          </div>

          {/* Right - Image Collage */}
          <div className="relative hidden lg:block">
            <div className="relative w-full aspect-square">
              {/* Main image */}
              <div className="absolute top-0 right-0 w-3/4 aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-300">
                <Image
                  src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80"
                  alt="Kids painting"
                  fill
                  className="object-cover"
                />
              </div>
              
              {/* Secondary image */}
              <div className="absolute bottom-0 left-0 w-2/3 aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl -rotate-6 hover:rotate-0 transition-transform duration-300">
                <Image
                  src="https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=800&q=80"
                  alt="Kids coding"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Floating card */}
              <div className="absolute bottom-1/4 right-0 bg-white rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Icon name="thumb_up" className="text-green-600" filled />
                  </div>
                  <div>
                    <div className="font-bold text-[var(--color-gray-800)]">4.9 Rating</div>
                    <div className="text-sm text-[var(--color-gray-500)]">From 2,000+ parents</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
