import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";

const ageGroups = [
  {
    name: "Kids",
    ages: "Ages 4-12",
    description: "Fun, creative, and educational activities designed for young minds",
    href: "/kids",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80",
    color: "from-orange-500 to-amber-400",
    bgColor: "bg-orange-50",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    icon: "child_care",
    classCount: 180,
  },
  {
    name: "Teens",
    ages: "Ages 13-17",
    description: "Build skills, explore passions, and connect with peers",
    href: "/teens",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    icon: "groups",
    classCount: 150,
  },
  {
    name: "Adults",
    ages: "Ages 18+",
    description: "Refine your skills with expert-led workshops and experiences",
    href: "/adults",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
    color: "from-emerald-500 to-teal-400",
    bgColor: "bg-emerald-50",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    icon: "person",
    classCount: 200,
  },
];

export function AgeGroupSection() {
  return (
    <section className="py-20 bg-[var(--color-off-white)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-gray-800)] mb-4">
            Classes for Every Age
          </h2>
          <p className="text-lg text-[var(--color-gray-500)] max-w-2xl mx-auto">
            Whether you&apos;re 4 or 74, we have the perfect class waiting for you.
            Choose your path and start exploring.
          </p>
        </div>

        {/* Age Group Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {ageGroups.map((group) => (
            <Link
              key={group.name}
              href={group.href}
              className="group relative rounded-3xl overflow-hidden aspect-[3/4] md:aspect-[2/3]"
            >
              {/* Background Image */}
              <Image
                src={group.image}
                alt={group.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              
              {/* Overlay Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-t ${group.color} opacity-60 mix-blend-multiply`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
                {/* Icon Badge */}
                <div className={`w-14 h-14 rounded-2xl ${group.iconBg} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
                  <Icon name={group.icon} size="lg" className={group.iconColor} filled />
                </div>

                {/* Text */}
                <div className="text-white">
                  <span className="text-sm font-medium opacity-80">{group.ages}</span>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-2">{group.name}</h3>
                  <p className="text-white/80 text-sm sm:text-base mb-4 line-clamp-2">
                    {group.description}
                  </p>
                  
                  {/* CTA */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm opacity-80">
                      {group.classCount}+ classes
                    </span>
                    <div className="flex items-center gap-2 font-medium group-hover:gap-3 transition-all">
                      <span>Explore</span>
                      <Icon name="arrow_forward" size="sm" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
