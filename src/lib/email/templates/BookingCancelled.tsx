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

type Locale = "pl" | "en";

type BookingCancelledProps = {
  locale: Locale;
  activityTitle: string;
  bookingId: string;
  audience: "user" | "partner";
};

const brand = {
  primary: "#b40f55",
  surface: "#fdf9f0",
  ink: "#1a1a1a",
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

/**
 * Minimal cancellation template for user + partner sides. Phase 3 stub —
 * refine copy later.
 */
export function BookingCancelled({
  locale,
  activityTitle,
  bookingId,
  audience,
}: BookingCancelledProps) {
  const isPl = locale === "pl";
  const isUser = audience === "user";

  const preview = isPl
    ? `Rezerwacja anulowana: ${activityTitle}`
    : `Booking cancelled: ${activityTitle}`;

  const heading = isPl ? "Rezerwacja anulowana" : "Booking cancelled";

  const body = isUser
    ? isPl
      ? "Twoja rezerwacja została anulowana. Zwrot zostanie przetworzony w ciągu kilku dni."
      : "Your booking has been cancelled. The refund will be processed within a few days."
    : isPl
      ? "Klient anulował rezerwację z wyprzedzeniem. Miejsce zostało zwolnione."
      : "A customer cancelled their booking in advance. The spot has been freed.";

  return (
    <Html lang={locale}>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section>
            <Heading style={headingStyle}>{heading}</Heading>
            <Text style={paragraphStyle}>{body}</Text>
            <Text style={paragraphStyle}>
              <strong>{isPl ? "Zajęcia" : "Activity"}:</strong> {activityTitle}
            </Text>
            <Text style={paragraphStyle}>
              <strong>{isPl ? "Numer" : "Reference"}:</strong> {bookingId}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
