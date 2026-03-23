import Image from "next/image";
import { Icon } from "@/components/ui/icon";

const testimonials = [
  {
    id: 1,
    content:
      "The yoga workshops have transformed my daily routine. Elena is an incredible instructor who truly understands the practice.",
    author: "Rebecca S.",
    role: "Marketing Executive",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    rating: 5,
  },
  {
    id: 2,
    content:
      "Chef Pierre's cooking class was worth every penny. I learned techniques I've been trying to master for years in just one session.",
    author: "Michael T.",
    role: "Business Owner",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
    rating: 5,
  },
  {
    id: 3,
    content:
      "The membership has been incredible value. I've taken 12 different workshops and each one has exceeded my expectations.",
    author: "Amanda L.",
    role: "Architect",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
    rating: 5,
  },
];

export function AdultsTestimonials() {
  return (
    <section className="py-20 bg-[var(--color-adults-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-gray-800)] mb-4">
            What Our Members Say
          </h2>
          <p className="text-lg text-[var(--color-gray-500)]">
            Hear from professionals who have elevated their skills with us
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm"
            >
              {/* Stars */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Icon
                    key={i}
                    name="star"
                    filled
                    size="sm"
                    className="text-amber-400"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-[var(--color-gray-600)] mb-6 leading-relaxed">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-semibold text-[var(--color-gray-800)]">
                    {testimonial.author}
                  </div>
                  <div className="text-sm text-[var(--color-gray-500)]">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
