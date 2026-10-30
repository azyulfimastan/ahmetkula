"use client";

import { createElement, useEffect, useLayoutEffect, useRef, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "@/components/layout/SiteProvider";
import { useFinePointer, useReducedMotion } from "@/hooks/useMedia";

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_WEIGHTS: [number, number] = [420, 700];

type Props = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  className?: string;
  style?: CSSProperties;
  /** Harflerin imleç yakınlığına tepki vermesi */
  proximity?: boolean;
  /** İmleç yakınlığında ağırlık aralığı */
  weights?: [far: number, near: number];
  radius?: number;
  /** Giriş animasyonu: "intro" = preloader bitince, "scroll" = görünür olunca, "none" */
  reveal?: "intro" | "scroll" | "none";
  delay?: number;
  stagger?: number;
};

/**
 * Harf bazlı kinetik tipografi: maskeli giriş + (isteğe bağlı) imleç yakınlığına tepki veren
 * değişken font ağırlığı. Ekran okuyucular için tam metin aria-label ile verilir.
 */
export function KineticText({
  text,
  as = "span",
  className,
  style,
  proximity = false,
  weights = DEFAULT_WEIGHTS,
  radius = 260,
  reveal = "none",
  delay = 0,
  stagger = 0.035,
}: Props) {
  const root = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const { introDone } = useSite();
  const played = useRef(false);

  const words = text.split(" ");

  // Başlangıç gizleme (boyamadan önce)
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || reveal === "none" || reduce) return;
    gsap.set(el.querySelectorAll(".kchar"), { yPercent: 115, rotate: 6 });
  }, [reveal, reduce]);

  // Giriş
  useEffect(() => {
    const el = root.current;
    if (!el || reveal === "none" || reduce || played.current) return;
    const chars = el.querySelectorAll(".kchar");
    const play = () => {
      played.current = true;
      gsap.to(chars, { yPercent: 0, rotate: 0, duration: 1, ease: "expo.out", stagger, delay });
    };
    if (reveal === "intro") {
      if (introDone) play();
      return;
    }
    const st = ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: play });
    return () => st.kill();
  }, [reveal, reduce, introDone, delay, stagger]);

  // İmleç yakınlığı
  useEffect(() => {
    const el = root.current;
    if (!el || !proximity || reduce || !fine) return;
    const glyphs = Array.from(el.querySelectorAll<HTMLElement>(".kchar"));
    let target = glyphs.map(() => 0);
    let cur = glyphs.map(() => 0);
    let raf = 0;
    let visible = true;
    let pointer: { x: number; y: number } | null = null;

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(el);

    const loop = () => {
      raf = 0;
      let active = false;
      for (let i = 0; i < glyphs.length; i++) {
        cur[i] += (target[i] - cur[i]) * 0.14;
        if (Math.abs(target[i] - cur[i]) > 0.002) active = true;
        const w = weights[0] + (weights[1] - weights[0]) * cur[i];
        glyphs[i].style.setProperty("--w", w.toFixed(0));
        glyphs[i].style.transform = `translate3d(0, ${(-cur[i] * 0.06).toFixed(3)}em, 0)`;
      }
      if (active) raf = requestAnimationFrame(loop);
    };

    const compute = () => {
      if (!visible || !pointer) return;
      for (let i = 0; i < glyphs.length; i++) {
        const r = glyphs[i].getBoundingClientRect();
        const d = Math.hypot(pointer.x - (r.left + r.width / 2), pointer.y - (r.top + r.height / 2));
        target[i] = Math.max(0, 1 - d / radius) ** 1.6;
      }
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      pointer = { x: e.clientX, y: e.clientY };
      compute();
    };
    const onLeave = () => {
      pointer = null;
      target = target.map(() => 0);
      if (!raf) raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    // başlangıç ağırlığı
    glyphs.forEach((g) => g.style.setProperty("--w", String(weights[0])));
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      cur = [];
    };
  }, [proximity, reduce, fine, weights, radius]);

  return createElement(
    as as string,
    { ref: root, className, style, "aria-label": text },
    <span aria-hidden="true">
      {words.map((w, wi) => (
        <span key={wi}>
          <span className="inline-block whitespace-nowrap">
            {Array.from(w).map((ch, ci) => (
              <span key={ci} className="kmask">
                <span className="glyph kchar">{ch}</span>
              </span>
            ))}
          </span>
          {wi < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>,
  );
}
