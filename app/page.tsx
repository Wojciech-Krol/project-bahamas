import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { AgeGroupSection } from "@/components/landing/age-group-section";
import { CategoriesSection } from "@/components/landing/categories-section";
import { FeaturedClassesSection } from "@/components/landing/featured-classes-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { CTASection } from "@/components/landing/cta-section";

export default function HomePage() {
  return (
    <>
      <Navigation variant="default" />
      <main>
        <HeroSection />
        <AgeGroupSection />
        <CategoriesSection />
        <FeaturedClassesSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer variant="default" />
    </>
  );
}
