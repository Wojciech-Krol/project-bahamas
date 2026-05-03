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

type BetaSignupConfirmProps = {
  email: string;
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

export function BetaSignupConfirm({ email, locale }: BetaSignupConfirmProps) {
  const isPl = locale === "pl";

  const preview = isPl
    ? "Jesteś na liście bety Hakuna."
    : "You're on the Hakuna beta list.";

  const heading = isPl
    ? "Jesteś na liście bety!"
    : "You're on the beta list!";

  const body1 = isPl
    ? `Dzięki za zapisanie ${email} na listę bety. Jako pierwszy dowiesz się, kiedy ruszamy w Twoim mieście.`
    : `Thanks for adding ${email} to our beta list. You'll be among the first to know when we open in your city.`;

  const body2 = isPl
    ? "Co jakiś czas wyślemy krótkie wiadomości od founderów, wybrane studia i instruktorów, oraz wcześniejszy dostęp do nowości. Bez spamu, słowo."
    : "Now and then we'll send a short note from the founders, hand-picked studios and instructors, and early access to new features. No spam — promise.";

  const body3 = isPl
    ? "Jeśli to nie Ty zapisałeś się — po prostu zignoruj ten mail."
    : "If you didn't sign up, just ignore this email.";

  const signoff = isPl ? "Do usłyszenia wkrótce," : "Talk soon,";

  return (
    <Html lang={locale}>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section>
            <Heading style={headingStyle}>{heading}</Heading>
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
