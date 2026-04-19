import LegalPage from "../../components/LegalPage";

const SECTIONS = ["eligibility", "bookings", "cancellation", "conduct", "liability", "changes"] as const;

export default function TermsPage() {
  return <LegalPage pageKey="terms" sections={SECTIONS} />;
}
