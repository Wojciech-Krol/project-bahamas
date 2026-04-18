import LegalPage from "../components/LegalPage";

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="April 18, 2026"
      intro="These Terms of Service govern your access to and use of the Hakuna platform. By creating an account or booking an activity, you agree to these terms."
      sections={[
        {
          heading: "Eligibility",
          body: [
            "You must be at least 18 years old to create a Hakuna account. If you book on behalf of a minor, you are responsible for ensuring compliance with venue requirements.",
          ],
        },
        {
          heading: "Bookings and Payments",
          body: [
            "When you book an activity, you enter into an agreement directly with the host or studio. Hakuna acts as a marketplace and processes payments on behalf of hosts.",
            "Fees are shown at checkout and include applicable taxes. Some activities require non-refundable deposits; this is clearly indicated on each listing.",
          ],
        },
        {
          heading: "Cancellations",
          body: [
            "Unless otherwise stated on a listing, you may cancel free of charge up to 48 hours before the activity start time. After that window, refunds are at the host's discretion.",
          ],
        },
        {
          heading: "User Conduct",
          body: [
            "You agree not to use Hakuna to harass other users, post misleading content, or attempt to bypass platform security. Accounts violating these terms may be suspended without notice.",
          ],
        },
        {
          heading: "Liability",
          body: [
            "Hakuna is not liable for injuries, damages, or losses arising from your participation in an activity. Always follow host and venue instructions and consult a professional if you have medical concerns.",
          ],
        },
        {
          heading: "Changes to These Terms",
          body: [
            "We may update these Terms from time to time. Material changes will be communicated via the platform or email at least 14 days before taking effect.",
          ],
        },
      ]}
    />
  );
}
