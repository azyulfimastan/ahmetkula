"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { KineticText } from "@/components/motion/KineticText";
import { SectionTag } from "@/components/ui/SectionTag";
import { tech, techCategories } from "@/data/tech";
import { useFinePointer, useReducedMotion } from "@/hooks/useMedia";
import type { Locale } from "@/i18n/routing";

type Body = { el: HTMLElement; ox: number; oy: number; vx: number; vy: number; hx: number; hy: number; dragging: boolean };

/**
 * Etiketler normal akışta (erişilebilir butonlar) durur; fizik yalnızca transform ofsetidir.
 * İmleç yaklaşınca iterler, sürüklenip bırakılan etiket yeni konumuna yerleşir.
 */
export function Toolbox() {
  const t = useTranslations("toolbox");
  const locale = useLocale() as Locale;
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const area = useRef<HTMLDivElement>(null);
  const bodies = useRef<Map<string, Body>>(new Map());
  const [selected, setSelected] = useState<string | null>(null);
  const sel = tech.find((x) => x.id === selected);

  useEffect(() => {
    const root = area.current;
    if (!root || reduce) return;
    const map = bodies.current;
    map.clear();
    root.querySelectorAll<HTMLElement>("[data-tag]").forEach((el) => {
      map.set(el.dataset.tag!, { el, ox: 0, oy: 0, vx: 0, vy: 0, hx: 0, hy: 0, dragging: false });
    });

    let pointer: { x: number; y: number } | null = null;
    let raf = 0;
    let visible = false;
    let last = performance.now();

    const step = (now: number) => {
      raf = 0;
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      let active = false;
      map.forEach((b) => {
        if (b.dragging) return;
        const r = b.el.getBoundingClientRect();
        // Doğal merkez = mevcut merkez - mevcut ofset
        const cx = r.left + r.width / 2 - b.ox;
        const cy = r.top + r.height / 2 - b.oy;
        let fx = (b.hx - b.ox) * 55;
        let fy = (b.hy - b.oy) * 55;
        if (pointer && fine) {
          const dx = cx + b.ox - pointer.x;
          const dy = cy + b.oy - pointer.y;
          const d = Math.hypot(dx, dy);
          const R = 150;
          if (d < R && d > 0.01) {
            const k = (1 - d / R) ** 2 * 5200;
            fx += (dx / d) * k;
            fy += (dy / d) * k;
          }
        }
        b.vx = (b.vx + fx * dt) * 0.86;
        b.vy = (b.vy + fy * dt) * 0.86;
        b.ox += b.vx * dt;
        b.oy += b.vy * dt;
        if (Math.abs(b.vx) + Math.abs(b.vy) > 0.2 || Math.abs(b.hx - b.ox) + Math.abs(b.hy - b.oy) > 0.2) active = true;
        b.el.style.transform = `translate3d(${b.ox.toFixed(2)}px, ${b.oy.toFixed(2)}px, 0)`;
      });
      if (active && visible) raf = requestAnimationFrame(step);
    };
    const kick = () => {
      if (!raf && visible) {
        last = performance.now();
        raf = requestAnimationFrame(step);
      }
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) kick();
    });
    io.observe(root);

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      pointer = { x: e.clientX, y: e.clientY };
      kick();
    };
    const onLeave = () => {
      pointer = null;
      kick();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerleave", onLeave);

    // Sürükleme
    const cleanups: (() => void)[] = [];
    map.forEach((b) => {
      let startX = 0;
      let startY = 0;
      let baseX = 0;
      let baseY = 0;
      let moved = 0;
      const down = (e: PointerEvent) => {
        b.dragging = true;
        startX = e.clientX;
        startY = e.clientY;
        baseX = b.ox;
        baseY = b.oy;
        moved = 0;
        b.el.setPointerCapture(e.pointerId);
        b.el.style.zIndex = "5";
      };
      const mv = (e: PointerEvent) => {
        if (!b.dragging) return;
        b.ox = baseX + e.clientX - startX;
        b.oy = baseY + e.clientY - startY;
        moved = Math.hypot(e.clientX - startX, e.clientY - startY);
        b.el.style.transform = `translate3d(${b.ox}px, ${b.oy}px, 0)`;
      };
      const up = (e: PointerEvent) => {
        if (!b.dragging) return;
        b.dragging = false;
        b.el.releasePointerCapture?.(e.pointerId);
        b.el.style.zIndex = "";
        // Bırakılan konum yeni "ev" olur
        b.hx = b.ox;
        b.hy = b.oy;
        b.el.dataset.moved = moved > 5 ? "1" : "0";
        kick();
      };
      b.el.addEventListener("pointerdown", down);
      b.el.addEventListener("pointermove", mv);
      b.el.addEventListener("pointerup", up);
      b.el.addEventListener("pointercancel", up);
      cleanups.push(() => {
        b.el.removeEventListener("pointerdown", down);
        b.el.removeEventListener("pointermove", mv);
        b.el.removeEventListener("pointerup", up);
        b.el.removeEventListener("pointercancel", up);
        b.el.style.transform = "";
      });
    });

    return () => {
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      cleanups.forEach((c) => c());
      if (raf) cancelAnimationFrame(raf);
    };
  }, [fine, reduce]);

  return (
    <section id="toolbox" data-section="toolbox" data-tone="light" className="relative px-5 py-28 md:px-8 md:py-44" aria-labelledby="toolbox-title">
      <div className="mx-auto max-w-[1700px]">
        <SectionTag index="04" label={t("eyebrow")} />
        <h2 id="toolbox-title" className="mt-10">
          <KineticText text={t("title")} as="span" reveal="scroll" proximity weights={[450, 700]} className="display block text-[clamp(3.2rem,12vw,13rem)]" />
        </h2>
        <p className="mt-6 max-w-xl text-[clamp(1.1rem,2vw,1.6rem)] font-display">{t("subtitle")}</p>
        <p className="mono-label mt-2 text-[0.66rem] text-muted">{t("hint")}</p>

        <div ref={area} className="mt-16 grid gap-x-10 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
          {techCategories.map((cat) => {
            const items = tech.filter((x) => x.category === cat);
            if (items.length === 0) return null;
            return (
              <div key={cat}>
                <h3 className="mono-label mb-4 flex items-center gap-3 text-[0.68rem] text-muted">
                  <span aria-hidden="true" className="h-px w-6 bg-fg/40" />
                  {t(`categories.${cat}`)}
                </h3>
                <ul className="flex flex-wrap gap-2.5">
                  {items.map((x) => (
                    <li key={x.id}>
                      <button
                        type="button"
                        data-tag={x.id}
                        data-cursor="drag"
                        aria-pressed={selected === x.id}
                        onClick={(e) => {
                          if (e.currentTarget.dataset.moved === "1") {
                            e.currentTarget.dataset.moved = "0";
                            return;
                          }
                          setSelected(selected === x.id ? null : x.id);
                        }}
                        className={`touch-none select-none border px-4 py-2.5 font-display text-[clamp(1rem,1.6vw,1.35rem)] transition-colors ${
                          selected === x.id ? "border-accent bg-accent text-bg" : "border-fg/40 hover:border-fg"
                        }`}
                        style={{ borderRadius: "999px" }}
                      >
                        {x.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-16 min-h-[5.5rem] border-t border-fg/25 pt-6" aria-live="polite">
          <p className="mono-label text-[0.62rem] text-muted">{t("selected")}</p>
          <p className="mt-2 text-[clamp(1.1rem,2vw,1.6rem)]">
            {sel ? (
              <>
                <span className="display mr-3 text-accent">{sel.label}</span>
                {sel.note[locale]}
              </>
            ) : (
              <span className="text-muted">{t("none")}</span>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
