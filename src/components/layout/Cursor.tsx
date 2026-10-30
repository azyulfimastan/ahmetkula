"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { useFinePointer, useForcedColors, useReducedMotion } from "@/hooks/useMedia";

type Mode = "dot" | "link" | "view" | "drag" | "interact";

/**
 * Özel cursor. Yalnızca ince imleç (fare/trackpad) cihazlarda, azaltılmış hareket ve
 * yüksek kontrast (forced-colors) modunda devre dışıdır; bu durumlarda sistem imleci kalır.
 */
export function Cursor() {
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const forced = useForcedColors();
  const enabled = fine && !reduce && !forced;
  const t = useTranslations("cursor");
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("dot");

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("has-custom-cursor");
    const ringEl = ring.current;
    const dotEl = dot.current;
    if (!ringEl || !dotEl) return;

    const rx = gsap.quickTo(ringEl, "x", { duration: 0.45, ease: "power3.out" });
    const ry = gsap.quickTo(ringEl, "y", { duration: 0.45, ease: "power3.out" });
    const dx = gsap.quickTo(dotEl, "x", { duration: 0.08, ease: "none" });
    const dy = gsap.quickTo(dotEl, "y", { duration: 0.08, ease: "none" });
    let snap: HTMLElement | null = null;
    let last = { x: -100, y: -100 };
    let shown = false;

    const apply = () => {
      let tx = last.x;
      let ty = last.y;
      if (snap) {
        const r = snap.getBoundingClientRect();
        // %30 manyetik çekim
        tx += (r.left + r.width / 2 - tx) * 0.3;
        ty += (r.top + r.height / 2 - ty) * 0.3;
      }
      rx(tx);
      ry(ty);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      last = { x: e.clientX, y: e.clientY };
      if (!shown) {
        shown = true;
        gsap.set([ringEl, dotEl], { x: e.clientX, y: e.clientY, autoAlpha: 1 });
      }
      dx(e.clientX);
      dy(e.clientY);
      apply();
    };

    const onOver = (e: Event) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        "[data-cursor], a, button, [role='button'], input, textarea",
      );
      if (!target) {
        snap = null;
        setMode("dot");
        return;
      }
      const kind = target.dataset.cursor as Mode | undefined;
      setMode(kind ?? "link");
      snap = target.dataset.cursorSnap !== undefined ? target : null;
    };

    const onDown = () => gsap.to(ringEl, { scale: 0.85, duration: 0.15 });
    const onUp = () => gsap.to(ringEl, { scale: 1, duration: 0.3, ease: "back.out(3)" });
    const onLeave = () => gsap.to([ringEl, dotEl], { autoAlpha: 0, duration: 0.2 });
    const onEnter = () => gsap.to([ringEl, dotEl], { autoAlpha: 1, duration: 0.2 });

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.documentElement.addEventListener("pointerenter", onEnter);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.removeEventListener("pointerenter", onEnter);
    };
  }, [enabled]);

  if (!enabled) return null;

  const labelled = mode === "view" || mode === "drag" || mode === "interact";
  const size = labelled ? 92 : mode === "link" ? 56 : 0;
  const label = mode === "view" ? t("view") : mode === "drag" ? t("drag") : mode === "interact" ? t("interact") : "";

  return (
    <>
      <div
        ref={ring}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[130]"
        style={{ opacity: 0 }}
      >
        <div
          className="mono-label flex items-center justify-center rounded-full text-center text-[0.58rem] transition-[width,height,background-color,border-color,opacity] duration-300 ease-out"
          style={{
            width: size,
            height: size,
            marginLeft: -size / 2,
            marginTop: -size / 2,
            backgroundColor: labelled ? "rgb(var(--signal))" : "transparent",
            color: "rgb(16 31 28)",
            border: labelled ? "none" : "1px solid rgb(var(--fg) / 0.7)",
            opacity: size === 0 ? 0 : 1,
          }}
        >
          {label}
        </div>
      </div>
      <div
        ref={dot}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[131]"
        style={{ opacity: 0 }}
      >
        <div
          className="-ml-[3px] -mt-[3px] h-[6px] w-[6px] rounded-full transition-opacity duration-200"
          style={{ background: "rgb(var(--fg))", opacity: labelled ? 0 : 1 }}
        />
      </div>
    </>
  );
}
