import LegalPage from "../../components/LegalPage";

const SECTIONS = ["collect", "use", "cookies", "retention", "rights", "contact"] as const;

export default function PrivacyPolicyPage() {
  return <LegalPage pageKey="privacy" sections={SECTIONS} />;
}
