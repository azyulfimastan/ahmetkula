"use client";

import { useEffect, useRef } from "react";

/** Sağ kenarda ince, gerçek scroll ilerlemesini gösteren dikey çizgi. */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (bar.current) bar.current.style.transform = `scaleY(${p})`;
      if (label.current) label.current.textContent = String(Math.round(p * 100)).padStart(2, "0");
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed bottom-6 right-4 z-40 hidden h-32 w-px bg-fg/20 md:block"
    >
      <div ref={bar} className="h-full w-px origin-top bg-accent" style={{ transform: "scaleY(0)" }} />
      <span ref={label} className="mono-label absolute -left-2 -top-6 text-[0.6rem] text-muted">
        00
      </span>
    </div>
  );
}
