"use client";

import { useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import Matter from "matter-js";

const COLORS = ["#FF6542", "#D6F46A", "#EDE9DF", "#D8CDBA"];
const INK = "#101F1C";

type Meta = { color: string; glyph?: string; w?: number; h?: number };

export default function PhysicsSandbox() {
  const t = useTranslations("playground.physics");
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const resetRef = useRef<() => void>(() => {});

  useEffect(() => {
    const el = wrap.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const { Engine, World, Bodies, Mouse, MouseConstraint, Events } = Matter;

    let engine: Matter.Engine | null = null;
    let mouseC: Matter.MouseConstraint | null = null;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let visible = false;
    let acc = 0;
    let last = 0;

    const setup = () => {
      if (engine) {
        World.clear(engine.world, false);
        Engine.clear(engine);
      }
      const r = el.getBoundingClientRect();
      w = Math.max(1, Math.floor(r.width));
      h = Math.max(1, Math.floor(r.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.floor(w * dpr);
      cv.height = Math.floor(h * dpr);
      cv.style.width = `${w}px`;
      cv.style.height = `${h}px`;

      engine = Engine.create({ gravity: { x: 0, y: 1 } });
      const T = 120;
      World.add(engine.world, [
        Bodies.rectangle(w / 2, h + T / 2, w + T * 2, T, { isStatic: true }),
        Bodies.rectangle(-T / 2, h / 2, T, h * 3, { isStatic: true }),
        Bodies.rectangle(w + T / 2, h / 2, T, h * 3, { isStatic: true }),
        Bodies.rectangle(w / 2, -h * 1.2, w + T * 2, T, { isStatic: true }),
      ]);

      const u = Math.max(26, Math.min(w, h) / 9);
      const rnd = (a: number, b: number) => a + Math.random() * (b - a);
      const pick = (i: number) => COLORS[i % COLORS.length];
      const items: Matter.Body[] = [];
      const glyphs = ["A", "K", "{ }", "</>", "0", "1", "AK", "=>"];
      glyphs.forEach((g, i) => {
        const gw = u * (g.length > 1 ? 0.9 + g.length * 0.55 : 1.5);
        const gh = u * 1.5;
        const b = Bodies.rectangle(rnd(u * 2, w - u * 2), rnd(-h * 0.6, -u), gw, gh, {
          chamfer: { radius: 6 },
          restitution: 0.35,
          friction: 0.3,
          angle: rnd(-1, 1),
        });
        (b as Matter.Body & { meta: Meta }).meta = { color: pick(i), glyph: g, w: gw, h: gh };
        items.push(b);
      });
      for (let i = 0; i < 4; i++) {
        const b = Bodies.circle(rnd(u, w - u), rnd(-h * 0.8, -u), u * rnd(0.55, 0.9), { restitution: 0.55, friction: 0.1 });
        (b as Matter.Body & { meta: Meta }).meta = { color: pick(i + 1) };
        items.push(b);
      }
      [3, 5, 6, 3].forEach((sides, i) => {
        const b = Bodies.polygon(rnd(u, w - u), rnd(-h * 0.9, -u), sides, u * rnd(0.7, 1), { restitution: 0.3, friction: 0.4 });
        (b as Matter.Body & { meta: Meta }).meta = { color: pick(i + 2) };
        items.push(b);
      });
      for (let i = 0; i < 3; i++) {
        const b = Bodies.rectangle(rnd(u, w - u), rnd(-h, -u), u * rnd(1, 2.2), u * rnd(0.5, 0.9), { restitution: 0.25, angle: rnd(0, 3) });
        (b as Matter.Body & { meta: Meta }).meta = { color: pick(i + 3) };
        items.push(b);
      }
      World.add(engine.world, items);

      const mouse = Mouse.create(cv);
      mouse.pixelRatio = dpr;
      // Sayfa kaydırmasını ele geçirme
      const m = mouse as Matter.Mouse & { mousewheel: EventListener };
      cv.removeEventListener("wheel", m.mousewheel);
      cv.removeEventListener("mousewheel", m.mousewheel);
      cv.removeEventListener("DOMMouseScroll", m.mousewheel);
      mouseC = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.18, damping: 0.1, render: { visible: false } } });
      World.add(engine.world, mouseC);
      Events.on(mouseC, "startdrag", () => (cv.style.cursor = "grabbing"));
      Events.on(mouseC, "enddrag", () => (cv.style.cursor = ""));
    };

    const roundRect = (x: number, y: number, ww: number, hh: number, r: number) => {
      ctx.beginPath();
      ctx.roundRect(x, y, ww, hh, r);
    };

    const draw = () => {
      if (!engine) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      for (const b of Matter.Composite.allBodies(engine.world)) {
        const meta = (b as Matter.Body & { meta?: Meta }).meta;
        if (!meta) continue;
        ctx.save();
        ctx.translate(b.position.x, b.position.y);
        ctx.rotate(b.angle);
        ctx.fillStyle = meta.color;
        if (meta.glyph && meta.w && meta.h) {
          roundRect(-meta.w / 2, -meta.h / 2, meta.w, meta.h, 6);
          ctx.fill();
          ctx.fillStyle = INK;
          ctx.font = `700 ${meta.h * 0.55}px "JetBrains Mono Variable", ui-monospace, monospace`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(meta.glyph, 0, 2);
        } else if (b.circleRadius) {
          ctx.beginPath();
          ctx.arc(0, 0, b.circleRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = INK;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(b.circleRadius, 0);
          ctx.stroke();
        } else {
          // vertices dünya koordinatlarında; döndürmeyi geri al
          const vs = b.vertices;
          ctx.rotate(-b.angle);
          ctx.beginPath();
          ctx.moveTo(vs[0].x - b.position.x, vs[0].y - b.position.y);
          for (let i = 1; i < vs.length; i++) ctx.lineTo(vs[i].x - b.position.x, vs[i].y - b.position.y);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
    };

    const loop = (now: number) => {
      raf = 0;
      if (!visible || !engine) return;
      if (!last) last = now;
      acc += Math.min(50, now - last);
      last = now;
      while (acc >= 1000 / 60) {
        Engine.update(engine, 1000 / 60);
        acc -= 1000 / 60;
      }
      draw();
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!raf && visible) {
        last = 0;
        raf = requestAnimationFrame(loop);
      }
    };

    setup();
    resetRef.current = () => {
      setup();
      start();
    };

    let lastW = w;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      if (Math.abs(r.width - lastW) > 40) {
        lastW = r.width;
        setup();
        start();
      }
    });
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
    });
    io.observe(el);

    return () => {
      ro.disconnect();
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      if (engine) {
        World.clear(engine.world, false);
        Engine.clear(engine);
      }
    };
  }, []);

  const reset = useCallback(() => resetRef.current(), []);

  return (
    <div className="flex h-full w-full flex-col">
      <div ref={wrap} className="relative min-h-0 flex-1">
        <canvas ref={canvas} role="img" aria-label={t("label")} data-cursor="drag" className="absolute inset-0 block touch-none" />
        <p className="mono-label pointer-events-none absolute bottom-3 left-3 text-[0.6rem] text-[#8E948C]">{t("hint")}</p>
      </div>
      <div className="mono-label flex justify-end border-t border-[#EDE9DF]/15 px-3 py-2.5 text-[0.62rem]">
        <button type="button" onClick={reset} className="border border-[#EDE9DF]/30 px-3 py-1.5 text-[#EDE9DF] hover:border-[#FF6542] hover:text-[#FF6542]">
          {t("reset")}
        </button>
      </div>
    </div>
  );
}
