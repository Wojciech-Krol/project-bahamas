import { readConsent } from "@/src/lib/consent.server";
import CookieConsent from "./CookieConsent";

export default async function CookieConsentGate() {
  const state = await readConsent();
  if (state.hasChoice) return null;
  return <CookieConsent />;
}
