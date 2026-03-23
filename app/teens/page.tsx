import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { TeensHero } from "@/components/teens/teens-hero";
import { TeensCategories } from "@/components/teens/teens-categories";
import { TrendingClasses } from "@/components/teens/trending-classes";
import { CommunitySpotlight } from "@/components/teens/community-spotlight";
import { TeensCTA } from "@/components/teens/teens-cta";

export const metadata = {
  title: "Teen Programs | Hakuna - Build Skills, Ages 13-17",
  description: "High-energy programs for teens aged 13-17. From music production to entrepreneurship, level up your skills in The Bahamas.",
};

export default function TeensPage() {
  return (
    <>
      <Navigation variant="teens" />
      <main className="bg-[var(--color-teens-bg)]">
        <TeensHero />
        <TeensCategories />
        <TrendingClasses />
        <CommunitySpotlight />
        <TeensCTA />
      </main>
      <Footer variant="teens" />
    </>
  );
}
