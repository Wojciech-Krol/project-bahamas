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

type BookingOverbookedProps = {
  locale: Locale;
  activityTitle: string;
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
 * Sent when the webhook detects that a session was already at full capacity
 * by the time payment cleared. The customer's card has already been refunded
 * (incl. application fee) by the time this email lands.
 */
export function BookingOverbooked({
  locale,
  activityTitle,
  bookingId,
}: BookingOverbookedProps) {
  const isPl = locale === "pl";

  const preview = isPl
    ? `Rezerwacja niedostępna — pełen zwrot: ${activityTitle}`
    : `Spot no longer available — full refund: ${activityTitle}`;

  const heading = isPl
    ? "Niestety nie udało się potwierdzić rezerwacji"
    : "We couldn't confirm your booking";

  const body = isPl
    ? "W chwili autoryzacji płatności miejsce zostało już zajęte przez innego klienta. Przyjęliśmy płatność w trybie wstępnym, dlatego natychmiast zwracamy całą kwotę wraz z prowizją. Środki powinny pojawić się na Twoim koncie w ciągu 1–2 dni roboczych."
    : "By the time your payment cleared, the spot had already been taken by another customer. Because we authorised the payment first, we've issued a full refund (including platform fee) immediately. The funds should arrive in your account within 1–2 business days.";

  const closer = isPl
    ? "Bardzo nam przykro za niedogodność. Zapraszamy do wybrania innego terminu na naszej stronie."
    : "We're really sorry for the inconvenience. You're welcome to pick another session on our site.";

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
              <strong>{isPl ? "Numer rezerwacji" : "Reference"}:</strong>{" "}
              {bookingId}
            </Text>
            <Text style={paragraphStyle}>{closer}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
