import { cookies } from "next/headers";

// Pre-launch landing gate. Stops casual visitors from seeing the site
// before invite-only soft launch. Not a security boundary — anyone with
// the password (or who reads the cookie value) gets in. The cookie is
// httpOnly + sameSite=lax so it survives a same-site redirect from the
// gate form back to the landing page.
export const LANDING_GATE_COOKIE = "hakuna_landing_gate";
export const LANDING_GATE_OPEN_VALUE = "open";

export async function isLandingGateOpen(): Promise<boolean> {
  const store = await cookies();
  return store.get(LANDING_GATE_COOKIE)?.value === LANDING_GATE_OPEN_VALUE;
}
