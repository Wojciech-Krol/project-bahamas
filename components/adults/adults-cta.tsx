import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export function AdultsCTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
            <Icon name="spa" size="xl" className="text-white" />
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 text-balance">
            Begin Your Journey
          </h2>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join a community of lifelong learners.
            Start with a free trial class and discover your next passion.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-white text-emerald-700 hover:bg-white/90"
            >
              <Icon name="calendar_month" size="sm" />
              Book Free Trial
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10"
            >
              <Icon name="explore" size="sm" />
              Browse Workshops
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <Icon name="verified" size="sm" filled />
              <span>Certified Instructors</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="schedule" size="sm" />
              <span>Flexible Scheduling</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="refresh" size="sm" />
              <span>Free Cancellation</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
