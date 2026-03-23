import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export function KidsCTA() {
  return (
    <section className="py-16 bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
            <Icon name="celebration" size="xl" className="text-white" />
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 text-balance">
            Ready for Some Fun?
          </h2>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Sign up today and get 20% off your first class!
            Let the learning adventure begin!
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-white text-orange-600 hover:bg-white/90"
            >
              <Icon name="search" size="sm" />
              Browse All Classes
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10"
            >
              <Icon name="calendar_month" size="sm" />
              Book a Trial Class
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
