"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { siteConfig } from "@/config/site";

/** Config'teki saat diliminde canlı saat. Sunucu/istemci uyumsuzluğu olmasın diye mount sonrası dolar. */
export function Clock({ className }: { className?: string }) {
  const locale = useLocale();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  let time = "--:--:--";
  let zone = "";
  if (now) {
    try {
      time = new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", {
        timeZone: siteConfig.timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(now);
      zone =
        new Intl.DateTimeFormat("en-GB", { timeZone: siteConfig.timeZone, timeZoneName: "short" })
          .formatToParts(now)
          .find((p) => p.type === "timeZoneName")?.value ?? "";
    } catch {
      time = now.toLocaleTimeString();
    }
  }

  return (
    <span className={`tabular-nums ${className ?? ""}`}>
      {time} {zone}
    </span>
  );
}
