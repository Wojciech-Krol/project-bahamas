import LegalPage from "../components/LegalPage";

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="April 18, 2026"
      intro="This Privacy Policy describes how Hakuna collects, uses, and protects information about you when you use our platform. By using Hakuna, you agree to the practices described below."
      sections={[
        {
          heading: "Information We Collect",
          body: [
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. We collect information you provide directly when you create an account, book an activity, or contact us — such as your name, email, and payment details.",
            "We also automatically collect technical information including device type, browser, IP address and pages viewed, to keep the platform secure and to improve performance.",
          ],
        },
        {
          heading: "How We Use Your Information",
          body: [
            "We use the information we collect to provide and improve our services, process bookings, send you booking confirmations and occasional product updates, and to detect and prevent fraud.",
            "We do not sell your personal information. We share data with service providers only to the extent necessary to operate the platform (for example, payment processors).",
          ],
        },
        {
          heading: "Cookies and Tracking",
          body: [
            "Hakuna uses cookies and similar technologies to remember your preferences, keep you signed in, and understand how the platform is used. You can manage cookie preferences from your browser at any time.",
          ],
        },
        {
          heading: "Data Retention",
          body: [
            "We retain your personal information for as long as your account is active or as needed to provide the service and comply with legal obligations. You may request deletion at any time by contacting us.",
          ],
        },
        {
          heading: "Your Rights",
          body: [
            "Depending on your location, you may have the right to access, correct, port or delete your personal data. To exercise any of these rights, reach out to our team via the contact channels on this website.",
          ],
        },
        {
          heading: "Contact Us",
          body: [
            "If you have questions about this Privacy Policy or how we handle your data, please contact us at privacy@hakuna.example.",
          ],
        },
      ]}
    />
  );
}
