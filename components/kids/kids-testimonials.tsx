import Image from "next/image";
import { Icon } from "@/components/ui/icon";

const testimonials = [
  {
    id: 1,
    content:
      "My son has been taking the coding class for 2 months and he absolutely loves it. He's already building his own games!",
    author: "Sarah M.",
    role: "Parent of Tommy, age 9",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
  },
  {
    id: 2,
    content:
      "The art class has helped my daughter express herself so much. She comes home every week excited to show us what she made.",
    author: "Michael T.",
    role: "Parent of Emma, age 7",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
  },
  {
    id: 3,
    content:
      "Best investment we've made! Both our kids attend different classes and the quality is consistently amazing.",
    author: "Lisa K.",
    role: "Parent of Jake & Mia",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
  },
];

export function KidsTestimonials() {
  return (
    <section className="py-16 bg-[var(--color-kids-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-gray-800)] mb-4">
            Happy Parents, Happy Kids
          </h2>
          <p className="text-lg text-[var(--color-gray-500)]">
            See what families are saying about Hakuna
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-2xl p-6 border border-orange-100"
            >
              {/* Stars */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
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
