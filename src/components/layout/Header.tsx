"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { Menu, SquareTerminal, X, Command } from "lucide-react";
import { AKMark } from "@/components/ui/Logo";
import { Clock } from "@/components/ui/Clock";
import { useNavActions } from "@/hooks/useNavActions";
import { useSite } from "./SiteProvider";
import { siteConfig } from "@/config/site";
import { useReducedMotion } from "@/hooks/useMedia";
import type { SectionId } from "@/lib/scroll";

const NAV: { id: SectionId; key: "work" | "about" | "playground" | "contact" }[] = [
  { id: "work", key: "work" },
  { id: "about", key: "about" },
  { id: "playground", key: "playground" },
  { id: "contact", key: "contact" },
];

function StatusDot() {
  const t = useTranslations("status");
  return (
    <span className="mono-label hidden items-center gap-2 text-[0.62rem] text-muted xl:inline-flex">
      <span aria-hidden="true" className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
      </span>
      {t("online")}
    </span>
  );
}

function LocaleSwitch({ className }: { className?: string }) {
  const t = useTranslations("a11y");
  const { switchLocale, locale } = useNavActions();
  return (
    <div role="group" aria-label={t("language")} className={`mono-label flex items-center gap-1 text-[0.72rem] ${className ?? ""}`}>
      {(["tr", "en"] as const).map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span aria-hidden="true" className="text-muted">/</span>}
          <button
            type="button"
            lang={l}
            aria-pressed={locale === l}
            onClick={() => switchLocale(l)}
            data-cursor-snap
            className={`px-1 py-1 transition-colors ${locale === l ? "text-accent" : "text-fg/70 hover:text-fg"}`}
          >
            {l.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}

function ThemeButton() {
  const t = useTranslations();
  const { toggleTheme, toast } = useSite();
  return (
    <button
      type="button"
      aria-label={t("a11y.theme")}
      onClick={() => {
        const next = toggleTheme();
        toast(t("theme.changed", { name: t(`theme.${next}`) }));
      }}
      data-cursor-snap
      className="grid h-9 w-9 place-items-center rounded-full border border-fg/25 transition-colors hover:border-accent"
    >
      <span aria-hidden="true" className="block h-3.5 w-3.5 rounded-full border border-current" style={{ background: "linear-gradient(90deg, currentColor 50%, transparent 50%)" }} />
    </button>
  );
}

export function Header() {
  const t = useTranslations();
  const { goSection, locale } = useNavActions();
  const { setTerminalOpen, setPaletteOpen, menuOpen, setMenuOpen, introDone, togglePalette, toast } = useSite();
  const reduce = useReducedMotion();
  const bar = useRef<HTMLElement>(null);
  const [active, setActive] = useState<SectionId | null>(null);
  const clicks = useRef({ n: 0, t: 0 });

  // Akıllı gizlenme: aşağı kaydırırken gizle, yukarı kaydırırken göster.
  useEffect(() => {
    const el = bar.current;
    if (!el || reduce) return;
    let last = window.scrollY;
    let hidden = false;
    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - last;
      if (Math.abs(dy) < 8) return;
      const shouldHide = dy > 0 && y > 240 && !menuOpen;
      if (shouldHide !== hidden) {
        hidden = shouldHide;
        gsap.to(el, { yPercent: hidden ? -110 : 0, duration: 0.45, ease: "power3.out" });
      }
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduce, menuOpen]);

  // Aktif bölüm
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));
    if (els.length === 0) {
      setActive(null);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.getAttribute("data-section") as SectionId);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [locale]);

  const onLogo = useCallback(() => {
    goSection("hero");
    const now = Date.now();
    const c = clicks.current;
    c.n = now - c.t < 1800 ? c.n + 1 : 1;
    c.t = now;
    if (c.n >= siteConfig.logoClicksForEgg) {
      c.n = 0;
      const next = togglePalette();
      toast(t(next === "alt" ? "easter.alt" : "easter.back"));
    }
  }, [goSection, togglePalette, toast, t]);

  const onRegistered = useCallback(() => {
    const msgs = t.raw("easter.hidden") as string[];
    toast(msgs[Math.floor(Math.random() * msgs.length)]);
  }, [t, toast]);

  // Mobil menü animasyonu
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    if (menuOpen) {
      el.style.visibility = "visible";
      gsap.fromTo(el, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: reduce ? 0 : 0.7, ease: "expo.inOut" });
      gsap.fromTo(el.querySelectorAll(".menu-item"), { yPercent: 110 }, { yPercent: 0, duration: reduce ? 0 : 0.8, ease: "expo.out", stagger: 0.06, delay: reduce ? 0 : 0.25 });
      el.querySelector<HTMLElement>("a,button")?.focus();
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
    const tween = gsap.to(el, {
      clipPath: "inset(0% 0% 100% 0%)",
      duration: reduce ? 0 : 0.5,
      ease: "expo.inOut",
      onComplete: () => {
        el.style.visibility = "hidden";
      },
    });
    return () => {
      tween.kill();
    };
  }, [menuOpen, reduce, setMenuOpen]);

  return (
    <>
      <header
        ref={bar}
        className="fixed inset-x-0 top-0 z-[70] px-5 py-4 md:px-8"
        style={
          {
            opacity: introDone ? 1 : 0,
            transition: "opacity 0.6s",
            ...(menuOpen ? { "--fg": "237 233 223", "--accent": "255 101 66", "--muted": "142 148 140" } : {}),
          } as React.CSSProperties
        }
      >
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button type="button" onClick={onLogo} aria-label={t("a11y.home")} data-cursor-snap className="flex items-center gap-3">
              <AKMark size={34} />
              <span className="display hidden text-[1.05rem] leading-none sm:inline">AHMET KULA</span>
            </button>
            <button
              type="button"
              onClick={onRegistered}
              aria-label="®"
              tabIndex={-1}
              className="-ml-3 hidden self-start text-[0.6rem] text-muted sm:inline"
            >
              ®
            </button>
            <StatusDot />
            <span className="mono-label hidden text-[0.62rem] text-muted xl:inline">
              <span className="mr-2">{t("status.localTime")}</span>
              <Clock />
            </span>
          </div>

          <nav aria-label={t("a11y.mainNav")} className="hidden items-center gap-7 md:flex">
            {NAV.map(({ id, key }) => (
              <button
                key={id}
                type="button"
                onClick={() => goSection(id)}
                data-cursor-snap
                aria-current={active === id ? "true" : undefined}
                className="mono-label group relative py-1 text-[0.72rem]"
              >
                {t(`nav.${key}`)}
                <span
                  aria-hidden="true"
                  className={`absolute -bottom-0.5 left-0 h-px bg-accent transition-all duration-300 ${active === id ? "w-full" : "w-0 group-hover:w-full"}`}
                />
              </button>
            ))}
            <LocaleSwitch />
            <ThemeButton />
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              aria-label={t("a11y.palette")}
              data-cursor-snap
              className="grid h-9 w-9 place-items-center rounded-full border border-fg/25 transition-colors hover:border-accent"
            >
              <Command size={15} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setTerminalOpen(true)}
              aria-label={t("a11y.terminal")}
              data-cursor-snap
              className="mono-label grid h-9 place-items-center rounded-full border border-fg/25 px-3 text-[0.72rem] transition-colors hover:border-accent"
            >
              {">_"}
            </button>
          </nav>

          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-fg/25 md:hidden"
            aria-label={menuOpen ? t("a11y.closeMenu") : t("a11y.openMenu")}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </div>
      </header>

      <div
        id="mobile-menu"
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("a11y.mainNav")}
        className="fixed inset-0 z-[65] flex flex-col justify-between bg-forest px-5 pb-8 pt-24 text-ivory md:hidden"
        style={{ visibility: "hidden", clipPath: "inset(0% 0% 100% 0%)" }}
      >
        <ul className="flex flex-col gap-1">
          {NAV.map(({ id, key }, i) => (
            <li key={id} className="mask-line">
              <button
                type="button"
                onClick={() => goSection(id)}
                className="menu-item mask-inner display flex w-full items-baseline gap-3 py-1 text-left text-[clamp(2.6rem,13vw,5rem)]"
              >
                <span className="mono-label text-[0.65rem] text-[#8E948C]">0{i + 1}</span>
                {t(`nav.${key}`)}
              </button>
            </li>
          ))}
          <li className="mask-line">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setTerminalOpen(true);
              }}
              className="menu-item mask-inner display flex w-full items-baseline gap-3 py-1 text-left text-[clamp(2.6rem,13vw,5rem)] text-[#D6F46A]"
            >
              <SquareTerminal size={28} aria-hidden="true" className="self-center" />
              {t("nav.terminal")}
            </button>
          </li>
        </ul>
        <div className="flex items-end justify-between gap-4">
          <div className="mono-label flex flex-col gap-2 text-[0.68rem] text-[#8E948C]">
            <span>{t("status.online")}</span>
            <span>
              {t("status.localTime")} · <Clock />
            </span>
          </div>
          <div className="flex items-center gap-3">
            <LocaleSwitch />
            <ThemeButton />
          </div>
        </div>
      </div>
    </>
  );
}
