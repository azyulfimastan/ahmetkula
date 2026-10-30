"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { useSite } from "./SiteProvider";

const NAME = "AHMET KULA";
const STEPS = 3;

function Name({ half }: { half: "top" | "bottom" }) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-0 flex h-[100svh] items-center justify-center"
      style={{ top: half === "top" ? 0 : "-50svh" }}
    >
      <div className="display flex whitespace-nowrap text-[clamp(2.6rem,13.5vw,15rem)] leading-[0.9]">
        {NAME.split("").map((ch, i) => (
          <span key={i} className="mask-line" style={{ paddingInline: ch === " " ? "0.12em" : 0 }}>
            <span className="pl-char mask-inner">{ch === " " ? " " : ch}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Sinematik giriş. İlerleme göstergesi GERÇEK adımlara bağlıdır
 * (fontlar, sayfa yüklemesi, 3D sahne parçası). Oturumda bir kez oynar, atlanabilir.
 */
export function Preloader() {
  const t = useTranslations("preloader");
  const { setIntroDone } = useSite();
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const skipRef = useRef<() => void>(() => {});
  const [gone, setGone] = useState(false);
  const [done, setDone] = useState(0);
  const lines = t.raw("lines") as string[];

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    let seen = false;
    try {
      seen = sessionStorage.getItem("ak-intro") === "1";
    } catch {
      /* yok say */
    }
    if (seen) {
      setIntroDone(true);
      setGone(true);
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const html = document.documentElement;
    html.style.overflow = "hidden";

    let finished = false;
    let completed = 0;
    let minElapsed = false;
    let started = false;
    let tl: gsap.core.Timeline | null = null;

    const markSeen = () => {
      try {
        sessionStorage.setItem("ak-intro", "1");
      } catch {
        /* yok say */
      }
    };

    const end = () => {
      if (finished) return;
      finished = true;
      html.style.overflow = "";
      markSeen();
      setIntroDone(true);
      setGone(true);
    };

    const split = (fast: boolean) => {
      const panels = el.querySelectorAll<HTMLElement>(".pl-panel");
      const top = panels[0];
      const bottom = panels[1];
      const d = fast || reduce ? 0.5 : 1.15;
      gsap
        .timeline({ onComplete: end })
        .to(el.querySelector(".pl-ui"), { autoAlpha: 0, duration: 0.2 }, 0)
        .to(top, { yPercent: -100, duration: d, ease: "expo.inOut" }, 0)
        .to(bottom, { yPercent: 100, duration: d, ease: "expo.inOut" }, 0)
        .add(() => setIntroDone(true), d * 0.35);
    };

    const play = () => {
      if (started || finished) return;
      started = true;
      gsap.to(el.querySelectorAll(".pl-status"), { autoAlpha: 0, duration: 0.25 });
      if (reduce) {
        gsap.set(el.querySelectorAll(".pl-char"), { yPercent: 0 });
        gsap.delayedCall(0.4, () => split(true));
        return;
      }
      tl = gsap
        .timeline()
        .fromTo(
          el.querySelectorAll(".pl-char"),
          { yPercent: 115, rotate: 8 },
          { yPercent: 0, rotate: 0, duration: 1, ease: "expo.out", stagger: { each: 0.05, from: "start" } },
        )
        .to(el.querySelectorAll(".pl-char"), { fontVariationSettings: '"wght" 300', duration: 0.5, ease: "power2.inOut" }, "-=0.2")
        .to(el.querySelectorAll(".pl-char"), { fontVariationSettings: '"wght" 700', duration: 0.5, ease: "power2.inOut" })
        .add(() => split(false), "+=0.15");
    };

    const maybePlay = () => {
      if (completed >= STEPS && minElapsed) play();
    };

    const step = () => {
      completed += 1;
      setDone(completed);
      gsap.to(bar.current, { scaleX: completed / STEPS, duration: 0.5, ease: "power3.out" });
      maybePlay();
    };

    // Durum satırları (gerçek adımlardan bağımsız, sadece metin koreografisi)
    const status = el.querySelectorAll<HTMLElement>(".pl-line");
    const cycle = gsap.timeline({ onComplete: () => { minElapsed = true; maybePlay(); } });
    status.forEach((line, i) => {
      cycle
        .fromTo(line, { yPercent: 110 }, { yPercent: 0, duration: reduce ? 0 : 0.5, ease: "power3.out" })
        .to(line, { yPercent: -110, duration: reduce ? 0 : 0.4, ease: "power3.in" }, `+=${reduce ? 0 : i === status.length - 1 ? 0.55 : 0.4}`);
    });

    // Gerçek yükleme adımları
    const withTimeout = <T,>(p: Promise<T>, ms: number) =>
      Promise.race([p, new Promise<void>((r) => window.setTimeout(r, ms))]);

    withTimeout(document.fonts.ready, 4000).finally(step);
    withTimeout(
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((r) => window.addEventListener("load", () => r(), { once: true })),
      6000,
    ).finally(step);
    withTimeout(import("@/components/three/HeroScene"), 7000)
      .catch(() => undefined)
      .finally(step);

    skipRef.current = () => {
      if (finished) return;
      cycle.kill();
      tl?.kill();
      gsap.killTweensOf(el.querySelectorAll(".pl-char"));
      started = true;
      split(true);
    };

    return () => {
      cycle.kill();
      tl?.kill();
      html.style.overflow = "";
    };
  }, [setIntroDone]);

  useEffect(() => {
    if (gone) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") skipRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gone]);

  if (gone) return null;

  return (
    <div
      ref={root}
      role="status"
      aria-live="polite"
      className="preloader fixed inset-0 z-[100] overflow-hidden text-[#EDE9DF]"
    >
      <span className="sr-only">AHMET KULA — {t("steps")} {done}/{STEPS}</span>

      <div className="pl-panel absolute inset-x-0 top-0 h-1/2 overflow-hidden bg-[#101F1C]">
        <Name half="top" />
      </div>
      <div className="pl-panel absolute inset-x-0 bottom-0 h-1/2 overflow-hidden bg-[#101F1C]">
        <Name half="bottom" />
      </div>

      <div className="pl-ui pointer-events-none absolute inset-0 flex flex-col justify-between p-5 md:p-8">
        <div className="flex items-start justify-between">
          <div className="pl-status mono-label relative h-5 overflow-hidden text-[0.72rem]" aria-hidden="true">
            {lines.map((l, i) => (
              <span
                key={i}
                className="pl-line absolute left-0 top-0 whitespace-nowrap"
                style={{ transform: "translateY(110%)" }}
              >
                {l}
              </span>
            ))}
            <span className="invisible whitespace-nowrap">{lines[1]}</span>
          </div>
          <button
            type="button"
            onClick={() => skipRef.current()}
            data-cursor="interact"
            className="mono-label pointer-events-auto border border-[#EDE9DF]/40 px-3 py-2 text-[0.68rem] transition-colors hover:bg-[#D6F46A] hover:text-[#101F1C]"
          >
            {t("skip")} ↵
          </button>
        </div>

        <div className="pl-status flex items-end gap-4" aria-hidden="true">
          <div className="h-px flex-1 bg-[#EDE9DF]/20">
            <div ref={bar} className="h-px origin-left bg-[#FF6542]" style={{ transform: "scaleX(0)" }} />
          </div>
          <span className="mono-label text-[0.68rem] tabular-nums text-[#8E948C]">
            {String(done).padStart(2, "0")}/{String(STEPS).padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  );
}
