import Image from "next/image";
import { SearchBar } from "@/components/search-bar";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

export function TeensHero() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-16 overflow-hidden">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900" />
      
      {/* Animated neon accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-cyan-500/20 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full bg-pink-500/15 blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), 
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-[var(--color-teens-neon-green)] animate-pulse" />
              <span className="text-sm font-medium text-white/90">Ages 13-17</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Level Up Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                Skills
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-white/70 mb-8 leading-relaxed max-w-xl">
              Join the next generation of creators, coders, and innovators.
              Find your passion and build skills that matter.
            </p>

            {/* Search Bar */}
            <SearchBar
              variant="teens"
              placeholder="What do you want to learn?"
              className="max-w-lg mb-8"
            />

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Button
                size="lg"
                className="bg-[var(--color-teens-neon-green)] text-slate-900 hover:bg-cyan-400"
              >
                <Icon name="explore" size="sm" />
                Explore Programs
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Icon name="play_circle" size="sm" />
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Right - Feature Cards */}
          <div className="hidden lg:block relative">
            <div className="grid grid-cols-2 gap-4">
              {/* Card 1 */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-4">
                  <Icon name="code" size="lg" className="text-cyan-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Tech & Coding</h3>
                <p className="text-white/60 text-sm">Build apps, games, and websites</p>
              </div>

              {/* Card 2 */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/10 transition-colors mt-8">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                  <Icon name="mic" size="lg" className="text-purple-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Music Production</h3>
                <p className="text-white/60 text-sm">Create beats and mix tracks</p>
              </div>

              {/* Card 3 */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-4">
                  <Icon name="videocam" size="lg" className="text-pink-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Content Creation</h3>
                <p className="text-white/60 text-sm">YouTube, TikTok, and more</p>
              </div>

              {/* Card 4 */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/10 transition-colors mt-8">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4">
                  <Icon name="rocket_launch" size="lg" className="text-amber-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Entrepreneurship</h3>
                <p className="text-white/60 text-sm">Launch your first business</p>
              </div>
            </div>

            {/* Floating Stats */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl p-4 px-8">
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">150+</div>
                  <div className="text-xs text-white/80">Programs</div>
                </div>
                <div className="w-px h-8 bg-white/30" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">5K+</div>
                  <div className="text-xs text-white/80">Teens</div>
                </div>
                <div className="w-px h-8 bg-white/30" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">4.8</div>
                  <div className="text-xs text-white/80">Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
