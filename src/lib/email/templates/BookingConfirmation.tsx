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

type BookingConfirmationProps = {
  locale: Locale;
  activityTitle: string;
  startsAtDisplay: string;
  venueName?: string;
  bookingId: string;
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
 * Minimal booking-confirmation template. Phase 3 pipeline-only — copy
 * refinement lives with the email/marketing agent later.
 */
export function BookingConfirmation({
  locale,
  activityTitle,
  startsAtDisplay,
  venueName,
  bookingId,
}: BookingConfirmationProps) {
  const isPl = locale === "pl";

  const preview = isPl
    ? `Rezerwacja potwierdzona: ${activityTitle}`
    : `Booking confirmed: ${activityTitle}`;
  const heading = isPl ? "Rezerwacja potwierdzona" : "Booking confirmed";
  const intro = isPl
    ? "Dziękujemy — Twoja rezerwacja jest potwierdzona."
    : "Thanks — your booking is confirmed.";
  const labelActivity = isPl ? "Zajęcia" : "Activity";
  const labelWhen = isPl ? "Termin" : "When";
  const labelVenue = isPl ? "Miejsce" : "Venue";
  const labelRef = isPl ? "Numer rezerwacji" : "Booking reference";

  return (
    <Html lang={locale}>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section>
            <Heading style={headingStyle}>{heading}</Heading>
            <Text style={paragraphStyle}>{intro}</Text>
            <Text style={paragraphStyle}>
              <strong>{labelActivity}:</strong> {activityTitle}
            </Text>
            <Text style={paragraphStyle}>
              <strong>{labelWhen}:</strong> {startsAtDisplay}
            </Text>
            {venueName ? (
              <Text style={paragraphStyle}>
                <strong>{labelVenue}:</strong> {venueName}
              </Text>
            ) : null}
            <Text style={paragraphStyle}>
              <strong>{labelRef}:</strong> {bookingId}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
