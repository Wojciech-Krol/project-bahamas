import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

const benefits = [
  {
    icon: "all_inclusive",
    title: "Unlimited Access",
    description: "Access all workshops without limits",
  },
  {
    icon: "priority_high",
    title: "Priority Booking",
    description: "Book popular classes before they fill up",
  },
  {
    icon: "discount",
    title: "Member Discounts",
    description: "20% off all premium workshops",
  },
  {
    icon: "spa",
    title: "Exclusive Events",
    description: "Members-only retreats and experiences",
  },
];

const plans = [
  {
    name: "Monthly",
    price: 49,
    period: "/month",
    description: "Perfect for trying us out",
    features: ["5 workshops/month", "Standard booking", "Email support"],
    popular: false,
  },
  {
    name: "Annual",
    price: 39,
    period: "/month",
    description: "Best value for committed learners",
    features: ["Unlimited workshops", "Priority booking", "Personal concierge", "Exclusive events"],
    popular: true,
    savings: "Save $120/year",
  },
];

export function AdultsMembership() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-[var(--color-adults-primary)] text-sm font-medium mb-4">
            <Icon name="card_membership" size="sm" />
            <span>Membership</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-gray-800)] mb-4">
            Unlock Premium Benefits
          </h2>
          <p className="text-lg text-[var(--color-gray-500)] max-w-2xl mx-auto">
            Join our membership program for unlimited access to all workshops and exclusive perks
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <Icon name={benefit.icon} size="lg" className="text-[var(--color-adults-primary)]" />
              </div>
              <h3 className="font-semibold text-[var(--color-gray-800)] mb-2">
                {benefit.title}
              </h3>
              <p className="text-sm text-[var(--color-gray-500)]">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-8 ${
                plan.popular
                  ? "bg-[var(--color-adults-primary)] text-white ring-4 ring-emerald-200"
                  : "bg-[var(--color-adults-bg)] border border-emerald-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-400 text-amber-900 text-sm font-medium">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-xl font-bold mb-2 ${plan.popular ? "text-white" : "text-[var(--color-gray-800)]"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm ${plan.popular ? "text-white/80" : "text-[var(--color-gray-500)]"}`}>
                  {plan.description}
                </p>
              </div>

              <div className="flex items-baseline gap-1 mb-6">
                <span className={`text-4xl font-bold ${plan.popular ? "text-white" : "text-[var(--color-gray-800)]"}`}>
                  ${plan.price}
                </span>
                <span className={plan.popular ? "text-white/80" : "text-[var(--color-gray-500)]"}>
                  {plan.period}
                </span>
              </div>

              {plan.savings && (
                <div className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium mb-6">
                  {plan.savings}
                </div>
              )}

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Icon
                      name="check_circle"
                      size="sm"
                      filled
                      className={plan.popular ? "text-emerald-300" : "text-[var(--color-adults-primary)]"}
                    />
                    <span className={plan.popular ? "text-white/90" : "text-[var(--color-gray-600)]"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                className={`w-full ${
                  plan.popular
                    ? "bg-white text-[var(--color-adults-primary)] hover:bg-white/90"
                    : "bg-[var(--color-adults-primary)] text-white hover:bg-emerald-700"
                }`}
              >
                Get Started
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
