import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
            <Icon name="rocket_launch" size="xl" className="text-white" />
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 text-balance">
            Ready to Start Your Journey?
          </h2>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of learners discovering new passions every day.
            Sign up today and get your first class free!
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-white text-[var(--color-primary)] hover:bg-white/90"
            >
              <Icon name="person_add" size="sm" />
              Create Free Account
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10"
            >
              <Icon name="play_circle" size="sm" />
              Watch How It Works
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-8 mt-12 text-white/60 text-sm">
            <div className="flex items-center gap-2">
              <Icon name="verified" size="sm" />
              <span>Verified Instructors</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="shield" size="sm" />
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="support_agent" size="sm" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
