import type Lenis from "lenis";

let instance: Lenis | null = null;

export function setLenis(l: Lenis | null) {
  instance = l;
}

export function getLenis() {
  return instance;
}

export const SECTION_IDS = ["hero", "about", "work", "toolbox", "playground", "contact"] as const;
export type SectionId = (typeof SECTION_IDS)[number];

/** Lenis varsa onunla, yoksa yerel scroll ile bir bölüme/konuma kaydır. */
export function scrollToTarget(target: string | number, offset = 0) {
  if (typeof window === "undefined") return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (instance) {
    instance.scrollTo(target as never, { offset, duration: reduce ? 0 : 1.4, immediate: reduce });
    return;
  }
  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: reduce ? "auto" : "smooth" });
    return;
  }
  const el = document.querySelector(target);
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
  }
}
