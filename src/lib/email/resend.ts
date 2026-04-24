// TODO-OPERATOR: configure SPF/DKIM/DMARC on the sending domain before going to production.

import { Resend } from "resend";
import type { ReactElement } from "react";
import { env } from "@/src/env";

/**
 * Resend client singleton with a graceful stub fallback.
 *
 * If `RESEND_API_KEY` is missing (pre-launch or local dev without email
 * provisioned), `sendEmail()` logs the attempt and returns a sentinel
 * `{ id: "stub", skipped: true }` so callers don't have to branch.
 *
 * When real Resend is configured, a singleton client is reused across
 * requests — the SDK is stateless/fetch-based, but we avoid reconstructing
 * it on every call.
 */

type SendResult = { id: string; skipped?: boolean };

type SendEmailArgs = {
  to: string | string[];
  subject: string;
  react: ReactElement;
  from?: string;
  replyTo?: string | string[];
};

// `env` is typed as the union of server + client schemas; on the browser it
// narrows to the client-only shape and drops server-only keys. This module
// is server-only (Resend API key must never be exposed), so we re-type env
// locally to include the server-only fields we read.
type ServerEnv = typeof env & {
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
};

const FALLBACK_FROM = "Hakuna <no-reply@hakuna.example>";

let cachedClient: Resend | null = null;

function getClient(): Resend | null {
  const serverEnv = env as ServerEnv;
  if (!serverEnv.RESEND_API_KEY) {
    return null;
  }
  if (!cachedClient) {
    cachedClient = new Resend(serverEnv.RESEND_API_KEY);
  }
  return cachedClient;
}

export async function sendEmail({
  to,
  subject,
  react,
  from,
  replyTo,
}: SendEmailArgs): Promise<SendResult> {
  const serverEnv = env as ServerEnv;
  const client = getClient();
  const resolvedFrom = from ?? serverEnv.RESEND_FROM_EMAIL ?? FALLBACK_FROM;

  if (!client) {
    console.info("[email stub]", { to, subject });
    return { id: "stub", skipped: true };
  }

  const { data, error } = await client.emails.send({
    from: resolvedFrom,
    to,
    subject,
    react,
    replyTo,
  });

  if (error) {
    throw new Error(`Resend send failed: ${error.message ?? String(error)}`);
  }

  return { id: data?.id ?? "unknown" };
}
