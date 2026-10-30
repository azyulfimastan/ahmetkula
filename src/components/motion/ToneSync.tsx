"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "@/components/layout/SiteProvider";
import { resolveTone, rgbToVar, type Tone, type ToneColors } from "@/lib/tones";
import { useReducedMotion } from "@/hooks/useMedia";

gsap.registerPlugin(ScrollTrigger);

const KEYS = ["bg", "fg", "muted", "accent", "signal"] as const;

const flatten = (c: ToneColors) => KEYS.flatMap((k) => c[k]);
const unflatten = (f: number[]): ToneColors => {
  const out = {} as ToneColors;
  KEYS.forEach((k, i) => {
    out[k] = [f[i * 3], f[i * 3 + 1], f[i * 3 + 2]];
  });
  return out;
};

function writeVars(c: ToneColors) {
  const s = document.documentElement.style;
  for (const k of KEYS) s.setProperty(`--${k}`, rgbToVar(c[k]));
}

/**
 * Scroll sırasında [data-tone] bölümlerine göre sayfa renklerini akıcı biçimde dönüştürür.
 * Tema veya palet değişince mevcut tonu yeniden hedefler.
 */
export function ToneSync() {
  const { theme, palette } = useSite();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const tone = useRef<Tone>("dark");
  const current = useRef<number[]>(flatten(resolveTone("dark", "forest", "default")));
  const tween = useRef<gsap.core.Tween | null>(null);
  const themeRef = useRef({ theme, palette, reduce });
  themeRef.current = { theme, palette, reduce };

  const go = useCallback((immediate = false) => {
    const { theme: th, palette: pal, reduce: rm } = themeRef.current;
    const target = flatten(resolveTone(tone.current, th, pal));
    tween.current?.kill();
    if (immediate || rm) {
      current.current = target;
      writeVars(unflatten(target));
      return;
    }
    const from = [...current.current];
    const p = { t: 0 };
    tween.current = gsap.to(p, {
      t: 1,
      duration: 0.8,
      ease: "power2.inOut",
      onUpdate: () => {
        const next = from.map((v, i) => v + (target[i] - v) * p.t);
        current.current = next;
        writeVars(unflatten(next));
      },
    });
  }, []);

  // Tema / palet değişimi
  useEffect(() => {
    go();
  }, [theme, palette, go]);

  // Sayfa değişiminde bölümleri yeniden tara
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-tone]"));
    if (els.length === 0) {
      tone.current = "dark";
      go();
      return;
    }
    const first = els[0].dataset.tone as Tone;
    tone.current = first;
    go(true);

    const triggers = els.map((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: "top 55%",
        end: "bottom 55%",
        refreshPriority: -1,
        onToggle: (self) => {
          if (!self.isActive) return;
          const t = el.dataset.tone as Tone;
          if (t && t !== tone.current) {
            tone.current = t;
            go();
          }
        },
      }),
    );
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => {
      window.clearTimeout(id);
      triggers.forEach((t) => t.kill());
    };
  }, [pathname, go]);

  return null;
}
