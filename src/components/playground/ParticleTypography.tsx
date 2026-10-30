"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useMedia";

const COLORS = ["#EDE9DF", "#FF6542", "#D6F46A"];

type Field = {
  n: number;
  x: Float32Array;
  y: Float32Array;
  ox: Float32Array;
  oy: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  group: number[]; // her renk grubunun bitiş indeksi
  size: number;
};

function build(w: number, h: number, dpr: number): Field {
  const off = document.createElement("canvas");
  off.width = Math.max(1, Math.floor(w * dpr));
  off.height = Math.max(1, Math.floor(h * dpr));
  const c = off.getContext("2d", { willReadFrequently: true })!;
  c.fillStyle = "#fff";
  c.textAlign = "center";
  c.textBaseline = "middle";
  const family = '"Space Grotesk Variable", "Space Grotesk", system-ui, sans-serif';
  const two = w < 560;
  const lines = two ? ["AHMET", "KULA"] : ["AHMET KULA"];
  c.font = `700 100px ${family}`;
  const maxLine = Math.max(...lines.map((l) => c.measureText(l).width));
  const fs = Math.min(((w * dpr * 0.9) / maxLine) * 100, (h * dpr * (two ? 0.4 : 0.62)) / 1);
  c.font = `700 ${fs}px ${family}`;
  const lh = fs * 0.92;
  lines.forEach((l, i) => c.fillText(l, (w * dpr) / 2, (h * dpr) / 2 + (i - (lines.length - 1) / 2) * lh));

  const img = c.getImageData(0, 0, off.width, off.height).data;
  const cap = w < 560 ? 2200 : 5200;
  let gap = Math.max(2, Math.round((w < 560 ? 4 : 3) * dpr));
  let pts: number[] = [];
  for (;;) {
    pts = [];
    for (let yy = 0; yy < off.height; yy += gap) {
      for (let xx = 0; xx < off.width; xx += gap) {
        if (img[(yy * off.width + xx) * 4 + 3] > 140) pts.push(xx / dpr, yy / dpr);
      }
    }
    if (pts.length / 2 <= cap) break;
    gap += 1;
  }
  const n = pts.length / 2;
  const f: Field = {
    n,
    x: new Float32Array(n),
    y: new Float32Array(n),
    ox: new Float32Array(n),
    oy: new Float32Array(n),
    vx: new Float32Array(n),
    vy: new Float32Array(n),
    group: [],
    size: Math.max(1.6, (gap / dpr) * 0.78),
  };
  // Renk gruplarına göre sırala (çizimde tek fillStyle değişimi)
  const idx = Array.from({ length: n }, (_, i) => i);
  const col = idx.map((i) => {
    const r = ((i * 2654435761) >>> 0) / 4294967296;
    return r < 0.78 ? 0 : r < 0.9 ? 1 : 2;
  });
  idx.sort((a, b) => col[a] - col[b]);
  idx.forEach((src, i) => {
    f.ox[i] = pts[src * 2];
    f.oy[i] = pts[src * 2 + 1];
    f.x[i] = f.ox[i] + (Math.random() - 0.5) * w * 0.4;
    f.y[i] = f.oy[i] + (Math.random() - 0.5) * h * 0.6;
  });
  let c0 = 0;
  for (let g = 0; g < 3; g++) {
    while (c0 < n && col[idx[c0]] === g) c0++;
    f.group.push(c0);
  }
  return f;
}

export default function ParticleTypography({ label }: { label: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = wrap.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let field: Field | null = null;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let visible = false;
    const pointer = { x: -9999, y: -9999, active: false, touch: false };
    let burst: { x: number; y: number; t: number } | null = null;

    const draw = () => {
      if (!field) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      let start = 0;
      for (let g = 0; g < 3; g++) {
        ctx.fillStyle = COLORS[g];
        for (let i = start; i < field.group[g]; i++) ctx.fillRect(field.x[i], field.y[i], field.size, field.size);
        start = field.group[g];
      }
    };

    const tick = () => {
      raf = 0;
      if (!field || !visible) return;
      const f = field;
      const R = pointer.touch ? 80 : 110;
      const now = performance.now();
      for (let i = 0; i < f.n; i++) {
        let ax = (f.ox[i] - f.x[i]) * 0.045;
        let ay = (f.oy[i] - f.y[i]) * 0.045;
        if (pointer.active) {
          const dx = f.x[i] - pointer.x;
          const dy = f.y[i] - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < R * R) {
            const d = Math.sqrt(d2) || 1;
            const k = (1 - d / R) ** 2 * 5.5;
            ax += (dx / d) * k;
            ay += (dy / d) * k;
          }
        }
        if (burst && now - burst.t < 90) {
          const dx = f.x[i] - burst.x;
          const dy = f.y[i] - burst.y;
          const d = Math.hypot(dx, dy) || 1;
          if (d < 260) {
            const k = (1 - d / 260) * 22;
            ax += (dx / d) * k;
            ay += (dy / d) * k;
          }
        }
        f.vx[i] = (f.vx[i] + ax) * 0.88;
        f.vy[i] = (f.vy[i] + ay) * 0.88;
        f.x[i] += f.vx[i];
        f.y[i] += f.vy[i];
      }
      draw();
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (reduce) return;
      if (!raf && visible) raf = requestAnimationFrame(tick);
    };

    const resize = () => {
      const r = el.getBoundingClientRect();
      w = Math.max(1, Math.floor(r.width));
      h = Math.max(1, Math.floor(r.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.floor(w * dpr);
      cv.height = Math.floor(h * dpr);
      cv.style.width = `${w}px`;
      cv.style.height = `${h}px`;
      field = build(w, h, dpr);
      if (reduce && field) {
        field.x.set(field.ox);
        field.y.set(field.oy);
      }
      draw();
      start();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(el);
    // Font yüklenince yeniden kur
    document.fonts?.ready.then(resize).catch(() => undefined);

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
    });
    io.observe(el);

    const local = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
    };
    const move = (e: PointerEvent) => {
      pointer.touch = e.pointerType === "touch";
      pointer.active = true;
      local(e);
      start();
    };
    const leave = () => {
      pointer.active = false;
    };
    const down = (e: PointerEvent) => {
      local(e);
      pointer.touch = e.pointerType === "touch";
      burst = { x: pointer.x, y: pointer.y, t: performance.now() };
      start();
    };
    cv.addEventListener("pointermove", move);
    cv.addEventListener("pointerleave", leave);
    cv.addEventListener("pointerup", (e) => e.pointerType === "touch" && leave());
    cv.addEventListener("pointercancel", leave);
    cv.addEventListener("pointerdown", down);

    return () => {
      ro.disconnect();
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      cv.removeEventListener("pointermove", move);
      cv.removeEventListener("pointerleave", leave);
      cv.removeEventListener("pointercancel", leave);
      cv.removeEventListener("pointerdown", down);
    };
  }, [reduce]);

  return (
    <div ref={wrap} className="relative h-full w-full">
      <canvas ref={canvas} role="img" aria-label={label} data-cursor="interact" className="absolute inset-0 block touch-pan-y" />
    </div>
  );
}
