import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export function TeensCTA() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500" />
      
      {/* Animated Circles */}
      <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-white/10 blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
            <Icon name="bolt" size="xl" className="text-white" />
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 text-balance">
            Ready to Level Up?
          </h2>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of teens building real skills.
            Your journey starts with one click.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-white text-purple-600 hover:bg-white/90"
            >
              <Icon name="rocket_launch" size="sm" />
              Start Learning Free
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10"
            >
              <Icon name="groups" size="sm" />
              Join the Community
            </Button>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-6 mt-10">
            <div className="flex items-center gap-2 text-white/80">
              <Icon name="check_circle" size="sm" filled />
              <span className="text-sm">No credit card required</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Icon name="check_circle" size="sm" filled />
              <span className="text-sm">Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Icon name="check_circle" size="sm" filled />
              <span className="text-sm">Parent-approved</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
