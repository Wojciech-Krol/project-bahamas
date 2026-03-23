import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { AdultsHero } from "@/components/adults/adults-hero";
import { AdultsCategories } from "@/components/adults/adults-categories";
import { AdultsFeatured } from "@/components/adults/adults-featured";
import { AdultsMembership } from "@/components/adults/adults-membership";
import { AdultsTestimonials } from "@/components/adults/adults-testimonials";
import { AdultsCTA } from "@/components/adults/adults-cta";

export const metadata = {
  title: "Adult Workshops | Hakuna - Refine Your Skills",
  description: "Expert-led workshops for adults in The Bahamas. Yoga, culinary arts, photography, wellness, and more refined experiences.",
};

export default function AdultsPage() {
  return (
    <>
      <Navigation variant="adults" />
      <main className="bg-[var(--color-adults-bg)]">
        <AdultsHero />
        <AdultsCategories />
        <AdultsFeatured />
        <AdultsMembership />
        <AdultsTestimonials />
        <AdultsCTA />
      </main>
      <Footer variant="adults" />
    </>
  );
}
