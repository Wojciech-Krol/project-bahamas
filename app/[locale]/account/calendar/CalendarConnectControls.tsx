"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";

import { Icon } from "@/src/components/Icon";

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
        className="inline-flex items-center gap-2 rounded-full bg-primary text-on-primary px-6 py-3 text-sm font-headline uppercase tracking-widest font-bold hover:bg-tertiary disabled:opacity-60 active:scale-95 transition-all"
      >
        <Icon name="calendar_month" className="text-[18px]" />
        {t("calendar.connect")}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        type="button"
        onClick={onTogglePause}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-low text-on-surface px-4 py-2.5 text-xs font-headline uppercase tracking-widest font-bold hover:bg-primary-fixed disabled:opacity-60 active:scale-95 transition-all"
      >
        <Icon
          name={syncEnabled ? "pause_circle" : "sync"}
          className="text-[16px]"
        />
        {syncEnabled ? t("calendar.pause") : t("calendar.resume")}
      </button>
      <button
        type="button"
        onClick={onDisconnect}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 rounded-full border border-red-400 text-red-600 px-4 py-2.5 text-xs font-headline uppercase tracking-widest font-bold hover:bg-red-50 disabled:opacity-60 active:scale-95 transition-all"
      >
        <Icon name="close" className="text-[16px]" />
        {t("calendar.disconnect")}
      </button>
    </div>
  );
}
