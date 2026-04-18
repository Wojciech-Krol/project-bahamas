import LegalPage from "../components/LegalPage";

export default function CookiePolicyPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      updated="April 18, 2026"
      intro="This Cookie Policy explains what cookies are, how Hakuna uses them, and how you can manage your preferences."
      sections={[
        {
          heading: "What Are Cookies?",
          body: [
            "Cookies are small text files placed on your device when you visit a website. They help sites remember information about your visit, such as your preferred language and sign-in state.",
          ],
        },
        {
          heading: "Types of Cookies We Use",
          body: [
            "Essential cookies keep the platform running — for example, remembering your session when you move between pages.",
            "Performance cookies help us understand how the platform is used so we can improve it. These are anonymous and aggregated.",
            "Preference cookies remember your settings (language, city, favorites) to personalize your experience.",
          ],
        },
        {
          heading: "Third-Party Cookies",
          body: [
            "Some features rely on trusted third parties (such as payment processors and analytics providers). These providers may set their own cookies subject to their own privacy policies.",
          ],
        },
        {
          heading: "Managing Cookies",
          body: [
            "Most browsers let you refuse or delete cookies from the settings menu. Blocking essential cookies may prevent parts of the platform from working as expected.",
          ],
        },
        {
          heading: "Contact",
          body: [
            "Questions about cookies? Email us at privacy@hakuna.example and we'll be happy to help.",
          ],
        },
      ]}
    />
  );
}
