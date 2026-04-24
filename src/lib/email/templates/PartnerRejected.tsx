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

type PartnerRejectedProps = {
  partnerName: string;
  locale: Locale;
  reason?: string;
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

const subHeadingStyle = {
  color: brand.ink,
  fontSize: "16px",
  fontWeight: 700,
  lineHeight: 1.4,
  margin: "24px 0 8px",
};

const paragraphStyle = {
  color: brand.ink,
  fontSize: "16px",
  lineHeight: 1.6,
  margin: "0 0 16px",
};

const reasonBoxStyle = {
  backgroundColor: brand.surface,
  borderLeft: `4px solid ${brand.primary}`,
  borderRadius: "8px",
  color: brand.ink,
  fontSize: "15px",
  lineHeight: 1.6,
  margin: "0 0 16px",
  padding: "16px 20px",
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

export function PartnerRejected({
  partnerName,
  locale,
  reason,
}: PartnerRejectedProps) {
  const isPl = locale === "pl";

  const preview = isPl
    ? "Aktualizacja dotycząca Twojego zgłoszenia do Hakuna."
    : "An update on your Hakuna partner application.";

  const heading = isPl
    ? "Aktualizacja zgłoszenia"
    : "An update on your application";

  const greeting = isPl ? `Cześć ${partnerName},` : `Hi ${partnerName},`;

  const body1 = isPl
    ? "Dziękujemy za poświęcony czas i za zainteresowanie Hakuna. Po uważnym rozpatrzeniu Twojego zgłoszenia musimy, niestety, poinformować, że na tym etapie nie możemy go zaakceptować."
    : "Thank you for taking the time to apply and for your interest in Hakuna. After careful review, we're not able to move forward with your application at this time.";

  const feedbackHeading = isPl ? "Informacja zwrotna" : "Feedback";

  const reapply = isPl
    ? "To nie jest koniec drogi — zapraszamy do ponownego zgłoszenia za 6 miesięcy. Chętnie zobaczymy, jak Twoja oferta będzie się rozwijać."
    : "This isn't a closed door — you're welcome to re-apply in 6 months. We'd love to see how your offering grows.";

  const closing = isPl
    ? "Życzymy powodzenia i dziękujemy jeszcze raz."
    : "Wishing you the very best, and thank you again.";

  const signoff = isPl ? "Z pozdrowieniami," : "With warm regards,";

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
            {reason ? (
              <>
                <Heading as="h2" style={subHeadingStyle}>
                  {feedbackHeading}
                </Heading>
                <Text style={reasonBoxStyle}>{reason}</Text>
              </>
            ) : null}
            <Text style={paragraphStyle}>{reapply}</Text>
            <Text style={paragraphStyle}>{closing}</Text>
            <Hr style={hrStyle} />
            <Text style={signatureStyle}>{signoff}</Text>
            <Text style={signatureStyle}>— Hakuna Team</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
