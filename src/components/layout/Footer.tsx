"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowUp } from "lucide-react";
import { AKMark } from "@/components/ui/Logo";
import { Magnetic } from "@/components/motion/Magnetic";
import { scrollToTarget } from "@/lib/scroll";

export function Footer() {
  const t = useTranslations("footer");
  const a = useTranslations("a11y");
  const [year, setYear] = useState<number | null>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    setYear(new Date().getFullYear());
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setNear(max > 0 && window.scrollY > max - window.innerHeight * 1.2);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <footer className="relative px-5 pb-8 md:px-8" data-tone="coral">
        <div className="mx-auto flex max-w-[1700px] flex-col gap-6 border-t border-fg/40 pt-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <AKMark size={30} />
            <p className="mono-label text-[0.68rem]">
              {t("rights")} <span suppressHydrationWarning>{year ?? ""}</span>
            </p>
          </div>
          <p className="mono-label text-[0.68rem] text-muted">
            {t("tagline")} · {t("built")}
          </p>
          <Magnetic>
            <button
              type="button"
              onClick={() => scrollToTarget(0)}
              data-cursor-snap
              className="mono-label inline-flex items-center gap-2 border border-fg px-4 py-3 text-[0.68rem] transition-colors hover:bg-fg hover:text-bg"
            >
              {t("top")} <ArrowUp size={14} aria-hidden="true" />
            </button>
          </Magnetic>
        </div>
      </footer>

      <button
        type="button"
        aria-label={a("backToTop")}
        onClick={() => scrollToTarget(0)}
        tabIndex={near ? 0 : -1}
        className="fixed bottom-6 right-6 z-[60] grid h-12 w-12 place-items-center rounded-full bg-fg text-bg transition-all duration-500 md:right-10"
        style={{ opacity: near ? 1 : 0, transform: near ? "none" : "translateY(20px)", pointerEvents: near ? "auto" : "none" }}
      >
        <ArrowUp size={18} aria-hidden="true" />
      </button>
    </>
  );
}
