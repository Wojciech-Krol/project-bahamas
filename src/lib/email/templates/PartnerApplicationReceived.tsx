import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type Locale = "pl" | "en";

type PartnerApplicationReceivedProps = {
  partnerName: string;
  locale: Locale;
};

const brand = {
  primary: "#b40f55",
  surface: "#fdf9f0",
  ink: "#1a1a1a",
  muted: "#5a4a4a",
};

const bodyStyle = {
  backgroundColor: brand.surface,
  color: brand.ink,
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  margin: 0,
  padding: "24px 0",
};

const containerStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  margin: "0 auto",
  maxWidth: "560px",
  padding: "40px 32px",
};

const headingStyle = {
  color: brand.primary,
  fontSize: "24px",
  fontWeight: 700,
  lineHeight: 1.25,
  margin: "0 0 16px",
};

const paragraphStyle = {
  color: brand.ink,
  fontSize: "16px",
  lineHeight: 1.6,
  margin: "0 0 16px",
};

const signatureStyle = {
  color: brand.muted,
  fontSize: "14px",
  lineHeight: 1.6,
  margin: "24px 0 0",
};

const hrStyle = {
  borderColor: "#eeddd9",
  margin: "32px 0 24px",
};

export function PartnerApplicationReceived({
  partnerName,
  locale,
}: PartnerApplicationReceivedProps) {
  const isPl = locale === "pl";

  const preview = isPl
    ? "Otrzymaliśmy Twoje zgłoszenie do Hakuna."
    : "We got your Hakuna partner application.";

  const heading = isPl
    ? "Dziękujemy za zgłoszenie!"
    : "Thanks for applying!";

  const greeting = isPl ? `Cześć ${partnerName},` : `Hi ${partnerName},`;

  const body1 = isPl
    ? "Cieszymy się, że chcesz dołączyć do Hakuna. Otrzymaliśmy Twoje zgłoszenie i już zaczynamy je przeglądać."
    : "We're thrilled you want to join Hakuna. Your application has landed safely and our team is starting to review it.";

  const body2 = isPl
    ? "Damy znać w ciągu 3 dni roboczych — niezależnie od decyzji napiszemy do Ciebie mailem."
    : "Expect to hear back from us within 3 business days — we'll email you as soon as a decision is made, either way.";

  const body3 = isPl
    ? "W międzyczasie, jeśli masz pytania, po prostu odpowiedz na tego maila."
    : "In the meantime, if anything comes up, just reply to this email.";

  const signoff = isPl ? "Do usłyszenia," : "Talk soon,";

  return (
    <Html lang={locale}>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section>
            <Heading style={headingStyle}>{heading}</Heading>
            <Text style={paragraphStyle}>{greeting}</Text>
            <Text style={paragraphStyle}>{body1}</Text>
            <Text style={paragraphStyle}>{body2}</Text>
            <Text style={paragraphStyle}>{body3}</Text>
            <Hr style={hrStyle} />
            <Text style={signatureStyle}>{signoff}</Text>
            <Text style={signatureStyle}>— Hakuna Team</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
