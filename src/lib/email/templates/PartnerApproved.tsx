import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type Locale = "pl" | "en";

type PartnerApprovedProps = {
  partnerName: string;
  locale: Locale;
  magicLink?: string;
  /**
   * Base URL of the site (typically `env.NEXT_PUBLIC_SITE_URL` at call
   * time). When omitted, falls back to the pre-launch placeholder. The
   * real URL should always be supplied by the caller in production — this
   * template is pure JSX and intentionally does not read env directly.
   */
  baseUrl?: string;
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
  fontSize: "26px",
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

const buttonStyle = {
  backgroundColor: brand.primary,
  borderRadius: "999px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: 600,
  padding: "14px 28px",
  textDecoration: "none",
};

const buttonSectionStyle = {
  margin: "24px 0",
  textAlign: "center" as const,
};

const linkStyle = {
  color: brand.primary,
  textDecoration: "underline",
  wordBreak: "break-all" as const,
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

export function PartnerApproved({
  partnerName,
  locale,
  magicLink,
  baseUrl,
}: PartnerApprovedProps) {
  const isPl = locale === "pl";

  // Placeholder fallback — callers should pass baseUrl from
  // NEXT_PUBLIC_SITE_URL in production.
  const dashboardUrl = `${baseUrl ?? "https://hakuna.pl"}/partner`;
  const ctaUrl = magicLink ?? dashboardUrl;

  const preview = isPl
    ? "Twoje zgłoszenie do Hakuna zostało zaakceptowane!"
    : "Your Hakuna partner application is approved!";

  const heading = isPl ? "Witamy w Hakuna!" : "Welcome to Hakuna!";

  const greeting = isPl ? `Cześć ${partnerName},` : `Hi ${partnerName},`;

  const body1 = isPl
    ? "Świetne wieści — Twoje zgłoszenie zostało zaakceptowane. Nie możemy się doczekać, aż pokażesz swoje zajęcia naszej społeczności."
    : "Great news — your application has been approved. We can't wait to see what you bring to our community.";

  const body2 = magicLink
    ? isPl
      ? "Kliknij poniżej, aby się zalogować i zacząć dodawać oferty. Link jest jednorazowy i wygaśnie wkrótce."
      : "Click below to log in and start building your listings. This link is single-use and will expire soon."
    : isPl
      ? "Zaloguj się, aby zacząć dodawać oferty:"
      : "Log in to start building your listings:";

  const buttonLabel = magicLink
    ? isPl
      ? "Zaloguj się"
      : "Log in"
    : isPl
      ? "Przejdź do panelu partnera"
      : "Go to partner dashboard";

  const fallbackLine = isPl
    ? "Jeśli przycisk nie działa, skopiuj ten adres do przeglądarki:"
    : "If the button doesn't work, paste this URL into your browser:";

  const signoff = isPl ? "Miłego startu," : "Welcome aboard,";

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
          </Section>
          <Section style={buttonSectionStyle}>
            <Button href={ctaUrl} style={buttonStyle}>
              {buttonLabel}
            </Button>
          </Section>
          <Section>
            <Text style={paragraphStyle}>{fallbackLine}</Text>
            <Text style={paragraphStyle}>
              <Link href={ctaUrl} style={linkStyle}>
                {ctaUrl}
              </Link>
            </Text>
            <Hr style={hrStyle} />
            <Text style={signatureStyle}>{signoff}</Text>
            <Text style={signatureStyle}>— Hakuna Team</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
