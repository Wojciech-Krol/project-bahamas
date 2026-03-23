import Image from "next/image";
import { Icon } from "@/components/ui/icon";

const testimonials = [
  {
    id: 1,
    content:
      "Hakuna made it so easy to find the perfect art class for my daughter. She's been going every week for 3 months now and absolutely loves it!",
    author: "Jennifer M.",
    role: "Parent",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    rating: 5,
  },
  {
    id: 2,
    content:
      "As an instructor, Hakuna has helped me reach so many more students. The platform is intuitive and the support team is amazing.",
    author: "Carlos R.",
    role: "Music Instructor",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    rating: 5,
  },
  {
    id: 3,
    content:
      "I've tried three different cooking classes through Hakuna and each one has been fantastic. Great variety and quality instructors.",
    author: "David K.",
    role: "Student",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-gray-800)] mb-4">
            What Our Community Says
          </h2>
          <p className="text-lg text-[var(--color-gray-500)] max-w-2xl mx-auto">
            Join thousands of happy students and instructors in The Bahamas
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-[var(--color-off-white)] rounded-2xl p-6 lg:p-8"
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
