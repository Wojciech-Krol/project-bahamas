import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

/**
 * Internal alert — sent to the admin distribution list after a POS
 * integration hits its third consecutive sync failure. English-only on
 * purpose: this lands in the ops inbox, not a partner's inbox.
 */

type PosSyncFailureProps = {
  partnerName: string;
  partnerId: string;
  provider: string;
  consecutiveFailures: number;
  lastError: string;
  adminUrl?: string;
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
  margin: "0 0 12px",
};

const paragraphStyle = {
  color: brand.ink,
  fontSize: "15px",
  lineHeight: 1.6,
  margin: "0 0 12px",
};

const rowStyle = {
  color: brand.ink,
  fontSize: "14px",
  lineHeight: 1.6,
  margin: "0 0 6px",
};

const labelStyle = {
  color: brand.muted,
  fontWeight: 600,
};

const preStyle = {
  backgroundColor: "#f6efe0",
  borderRadius: "8px",
  color: brand.ink,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSize: "12px",
  lineHeight: 1.5,
  margin: "12px 0 0",
  padding: "12px",
  whiteSpace: "pre-wrap" as const,
  wordBreak: "break-word" as const,
};

export function PosSyncFailure({
  partnerName,
  partnerId,
  provider,
  consecutiveFailures,
  lastError,
  adminUrl,
}: PosSyncFailureProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{`POS sync failing for ${partnerName} (${provider})`}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section>
            <Heading style={headingStyle}>POS sync is failing</Heading>
            <Text style={paragraphStyle}>
              A POS integration has hit {consecutiveFailures} consecutive sync
              failures. Partner credentials may have expired, the upstream API
              may be unreachable, or the CSV upload may be malformed.
            </Text>
            <Text style={rowStyle}>
              <span style={labelStyle}>Partner: </span>
              {partnerName} ({partnerId})
            </Text>
            <Text style={rowStyle}>
              <span style={labelStyle}>Provider: </span>
              {provider}
            </Text>
            <Text style={rowStyle}>
              <span style={labelStyle}>Consecutive failures: </span>
              {consecutiveFailures}
            </Text>
            {adminUrl ? (
              <Text style={rowStyle}>
                <span style={labelStyle}>Admin: </span>
                {adminUrl}
              </Text>
            ) : null}
            <Text style={paragraphStyle}>Last error:</Text>
            <pre style={preStyle}>{lastError}</pre>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
