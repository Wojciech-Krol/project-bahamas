import Image from "next/image";
import { Icon } from "@/components/ui/icon";

const spotlights = [
  {
    id: 1,
    name: "Maya T.",
    age: 16,
    achievement: "Built a mental health app that helps 500+ teens",
    program: "App Development Bootcamp",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&q=80",
    quote: "Hakuna gave me the skills to turn my idea into reality. Now I'm helping other teens like me!",
  },
  {
    id: 2,
    name: "Jordan K.",
    age: 15,
    achievement: "Started a successful YouTube channel with 50K subscribers",
    program: "Content Creation Masterclass",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80",
    quote: "The program taught me everything from filming to editing. Best decision I ever made!",
  },
  {
    id: 3,
    name: "Zoe M.",
    age: 17,
    achievement: "Released her first EP on Spotify with 100K+ streams",
    program: "Music Production Intensive",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80",
    quote: "Learning to produce my own music changed everything. Now I'm living my dream!",
  },
];

export function CommunitySpotlight() {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-900/50 to-[var(--color-teens-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 mb-4">
            <Icon name="stars" className="text-purple-400" filled />
            <span className="text-sm font-medium text-purple-300">COMMUNITY SPOTLIGHT</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Teens Making Waves
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Meet the amazing teens in our community who are building, creating, and achieving incredible things.
          </p>
        </div>

        {/* Spotlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {spotlights.map((spotlight) => (
            <div
              key={spotlight.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-purple-500">
                  <Image
                    src={spotlight.avatar}
                    alt={spotlight.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{spotlight.name}</h3>
                  <p className="text-sm text-white/50">Age {spotlight.age}</p>
                </div>
              </div>

              {/* Achievement */}
              <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="emoji_events" size="sm" className="text-amber-400" />
                  <span className="text-xs font-medium text-amber-300">ACHIEVEMENT</span>
                </div>
                <p className="text-white text-sm">{spotlight.achievement}</p>
              </div>

              {/* Program Badge */}
              <div className="flex items-center gap-2 mb-4">
                <Icon name="school" size="sm" className="text-[var(--color-teens-neon-green)]" />
                <span className="text-sm text-[var(--color-teens-neon-green)]">
                  {spotlight.program}
                </span>
              </div>

              {/* Quote */}
              <p className="text-white/70 text-sm italic">
                &ldquo;{spotlight.quote}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
