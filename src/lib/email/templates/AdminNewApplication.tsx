import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type AdminNewApplicationProps = {
  partnerName: string;
  contactEmail: string;
  city?: string;
  website?: string;
  expectedMonthlyBookings?: string;
  adminUrl: string;
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
  padding: "32px",
};

const headingStyle = {
  color: brand.primary,
  fontSize: "20px",
  fontWeight: 700,
  lineHeight: 1.3,
  margin: "0 0 16px",
};

const paragraphStyle = {
  color: brand.ink,
  fontSize: "15px",
  lineHeight: 1.6,
  margin: "0 0 12px",
};

const fieldRowStyle = {
  color: brand.ink,
  fontSize: "14px",
  lineHeight: 1.6,
  margin: "0 0 6px",
};

const labelStyle = {
  color: brand.muted,
  fontWeight: 600,
};

const linkStyle = {
  color: brand.primary,
  textDecoration: "underline",
};

const buttonStyle = {
  backgroundColor: brand.primary,
  borderRadius: "8px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: 600,
  padding: "10px 20px",
  textDecoration: "none",
};

const buttonSectionStyle = {
  margin: "24px 0 0",
};

export function AdminNewApplication({
  partnerName,
  contactEmail,
  city,
  website,
  expectedMonthlyBookings,
  adminUrl,
}: AdminNewApplicationProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{`New partner application: ${partnerName}`}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section>
            <Heading style={headingStyle}>New partner application</Heading>
            <Text style={paragraphStyle}>
              A new partner application just came in. Summary below.
            </Text>
            <Text style={fieldRowStyle}>
              <span style={labelStyle}>Name: </span>
              {partnerName}
            </Text>
            <Text style={fieldRowStyle}>
              <span style={labelStyle}>Email: </span>
              <Link href={`mailto:${contactEmail}`} style={linkStyle}>
                {contactEmail}
              </Link>
            </Text>
            {city ? (
              <Text style={fieldRowStyle}>
                <span style={labelStyle}>City: </span>
                {city}
              </Text>
            ) : null}
            {website ? (
              <Text style={fieldRowStyle}>
                <span style={labelStyle}>Website: </span>
                <Link href={website} style={linkStyle}>
                  {website}
                </Link>
              </Text>
            ) : null}
            {expectedMonthlyBookings ? (
              <Text style={fieldRowStyle}>
                <span style={labelStyle}>Expected monthly bookings: </span>
                {expectedMonthlyBookings}
              </Text>
            ) : null}
          </Section>
          <Section style={buttonSectionStyle}>
            <Button href={adminUrl} style={buttonStyle}>
              Review in admin
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
