"use client";

import { useTranslations } from "next-intl";
import { useSite } from "./SiteProvider";

export function Toasts() {
  const { toasts } = useSite();
  const t = useTranslations("a11y");
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={t("toastRegion")}
      className="pointer-events-none fixed bottom-5 left-5 z-[125] flex max-w-[calc(100vw-2.5rem)] flex-col gap-2"
    >
      {toasts.map((x) => (
        <div
          key={x.id}
          className="mono-label animate-[toastIn_0.4s_cubic-bezier(0.19,1,0.22,1)] border border-[#EDE9DF]/25 bg-[#101F1C] px-4 py-3 text-[0.68rem] text-[#EDE9DF] shadow-xl"
        >
          <span className="mr-2 text-[#D6F46A]" aria-hidden="true">●</span>
          {x.message}
        </div>
      ))}
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
