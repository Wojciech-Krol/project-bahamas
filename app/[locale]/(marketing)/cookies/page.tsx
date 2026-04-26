import LegalPage from "@/src/components/LegalPage";

const SECTIONS = ["what", "types", "third", "managing", "contact"] as const;

export default function CookiePolicyPage() {
  return <LegalPage pageKey="cookies" sections={SECTIONS} />;
}
