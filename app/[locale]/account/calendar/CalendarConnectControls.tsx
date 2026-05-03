"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";

import {
  disconnectCalendarAction,
  setSyncEnabledAction,
  startCalendarConnectAction,
} from "./actions";

type Props = {
  connected: boolean;
  syncEnabled: boolean;
};

export default function CalendarConnectControls({
  connected,
  syncEnabled,
}: Props) {
  const t = useTranslations("Account");
  const [isPending, startTransition] = useTransition();

  function onConnect() {
    startTransition(async () => {
      const url = await startCalendarConnectAction();
      if (typeof url === "string") {
        window.location.href = url;
      }
    });
  }

  function onDisconnect() {
    if (
      typeof window !== "undefined" &&
      !window.confirm(t("calendar.confirmDisconnect"))
    ) {
      return;
    }
    startTransition(() => disconnectCalendarAction());
  }

  function onTogglePause() {
    startTransition(() => setSyncEnabledAction(!syncEnabled));
  }

  if (!connected) {
    return (
      <button
        type="button"
        onClick={onConnect}
        disabled={isPending}
        className="rounded-full bg-primary text-on-primary px-5 py-2.5 text-sm font-bold hover:opacity-90 disabled:opacity-60"
      >
        {t("calendar.connect")}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onTogglePause}
        disabled={isPending}
        className="rounded-full bg-surface-container-low text-on-surface px-4 py-2 text-sm font-bold hover:bg-primary-fixed disabled:opacity-60"
      >
        {syncEnabled ? t("calendar.pause") : t("calendar.resume")}
      </button>
      <button
        type="button"
        onClick={onDisconnect}
        disabled={isPending}
        className="rounded-full border border-red-400 text-red-600 px-4 py-2 text-sm font-bold hover:bg-red-50 disabled:opacity-60"
      >
        {t("calendar.disconnect")}
      </button>
    </div>
  );
}
