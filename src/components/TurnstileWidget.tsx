"use client";

/**
 * Client wrapper for Cloudflare Turnstile.
 *
 * When `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is unset (local dev, pre-launch)
 * the widget renders nothing and fires `onVerify("")` once. Paired with
 * the server-side no-op in `src/lib/turnstile.ts` this lets forms submit
 * successfully without any Turnstile setup. Once the operator provisions
 * a site key, the widget activates automatically — no component changes.
 */

import { useEffect, useRef } from "react";
import Turnstile from "react-turnstile";

type TurnstileWidgetProps = {
  onVerify: (token: string) => void;
  action?: string;
};

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function TurnstileWidget({
  onVerify,
  action,
}: TurnstileWidgetProps) {
  const emittedRef = useRef(false);

  useEffect(() => {
    if (!SITE_KEY && !emittedRef.current) {
      emittedRef.current = true;
      onVerify("");
    }
  }, [onVerify]);

  if (!SITE_KEY) {
    return null;
  }

  return (
    <Turnstile
      sitekey={SITE_KEY}
      action={action}
      theme="light"
      size="normal"
      onVerify={(token) => onVerify(token)}
    />
  );
}
