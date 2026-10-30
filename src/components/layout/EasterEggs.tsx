"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { useSite } from "./SiteProvider";
import { isEditableTarget } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useMedia";

const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];

/** Global klavye kısayolları (~ terminal, Ctrl/Cmd+K palet, Konami) + gizli etkileşimler. */
export function GlobalKeys() {
  const { terminalOpen, setTerminalOpen, paletteOpen, setPaletteOpen, fireKonami, menuOpen, setMenuOpen } = useSite();
  const seq = useRef<string[]>([]);
  const state = useRef({ terminalOpen, paletteOpen, menuOpen });
  state.current = { terminalOpen, paletteOpen, menuOpen };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setTerminalOpen(false);
        setMenuOpen(false);
        setPaletteOpen(!state.current.paletteOpen);
        return;
      }
      if (e.key === "Escape") {
        if (state.current.menuOpen) setMenuOpen(false);
        return;
      }
      if (isEditableTarget(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === "~" || e.key === "`") {
        e.preventDefault();
        setPaletteOpen(false);
        setTerminalOpen(!state.current.terminalOpen);
        return;
      }

      const k = e.key.toLowerCase();
      seq.current = [...seq.current, k].slice(-KONAMI.length);
      if (seq.current.length === KONAMI.length && seq.current.every((v, i) => v === KONAMI[i])) {
        seq.current = [];
        fireKonami();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setTerminalOpen, setPaletteOpen, setMenuOpen, fireKonami]);

  return null;
}

/** Konami animasyonu: kısa bir sinyal taraması + büyük tipografi. Hero objesine de darbe gönderir. */
export function KonamiOverlay() {
  const { konamiAt, toast } = useSite();
  const t = useTranslations("easter");
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!konamiAt) return;
    window.dispatchEvent(new CustomEvent("ak:burst"));
    const el = ref.current;
    if (!el || reduce) {
      toast(t("konami"));
      return;
    }
    const text = el.querySelector<HTMLElement>(".k-text");
    el.style.visibility = "visible";
    const tl = gsap
      .timeline({ onComplete: () => { el.style.visibility = "hidden"; } })
      .fromTo(el, { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(75% at 50% 50%)", duration: 0.6, ease: "expo.out" })
      .fromTo(text, { scale: 0.6, rotate: -6, autoAlpha: 0 }, { scale: 1, rotate: 0, autoAlpha: 1, duration: 0.5, ease: "back.out(2)" }, "-=0.3")
      .to(text, { x: () => gsap.utils.random(-14, 14), skewX: () => gsap.utils.random(-12, 12), duration: 0.06, repeat: 9, yoyo: true, ease: "none" })
      .to(text, { x: 0, skewX: 0, duration: 0.1 })
      .to(el, { clipPath: "circle(0% at 50% 50%)", duration: 0.55, ease: "expo.inOut" }, "+=0.35");
    return () => {
      tl.kill();
    };
  }, [konamiAt, reduce, toast, t]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[115] flex items-center justify-center bg-[#D6F46A] text-[#101F1C]"
      style={{ visibility: "hidden", clipPath: "circle(0% at 50% 50%)" }}
    >
      <span className="k-text display px-6 text-center text-[clamp(2.4rem,11vw,9rem)]">{t("konami")}</span>
    </div>
  );
}

export function DevGrid() {
  const { devMode } = useSite();
  if (!devMode) return null;
  return (
    <div aria-hidden="true" className="dev-grid md:px-8">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} />
      ))}
    </div>
  );
}
