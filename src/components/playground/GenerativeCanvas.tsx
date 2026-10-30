"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

const BG = "#0B1613";
const PALETTE = [
  { id: "coral", value: "#FF6542" },
  { id: "lime", value: "#D6F46A" },
  { id: "ivory", value: "#EDE9DF" },
  { id: "sand", value: "#D8CDBA" },
];

export default function GenerativeCanvas() {
  const t = useTranslations("playground.art");
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState<string>("auto");
  const [drawn, setDrawn] = useState(false);
  const colorRef = useRef(color);
  colorRef.current = color;

  const clear = useCallback(() => {
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.restore();
    setDrawn(false);
  }, []);

  const save = useCallback(() => {
    const cv = canvas.current;
    if (!cv) return;
    cv.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ahmet-kula-art.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1500);
    }, "image/png");
  }, []);

  useEffect(() => {
    const el = wrap.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let dpr = 1;

    const resize = () => {
      const r = el.getBoundingClientRect();
      const w = Math.max(1, Math.floor(r.width));
      const h = Math.max(1, Math.floor(r.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const keep = document.createElement("canvas");
      keep.width = cv.width;
      keep.height = cv.height;
      keep.getContext("2d")?.drawImage(cv, 0, 0);
      cv.width = Math.floor(w * dpr);
      cv.height = Math.floor(h * dpr);
      cv.style.width = `${w}px`;
      cv.style.height = `${h}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, cv.width, cv.height);
      if (keep.width > 1) ctx.drawImage(keep, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    let last: { x: number; y: number; t: number } | null = null;
    let phase = 0;
    let autoIdx = 0;
    let autoT = 0;

    const stroke = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      const x = (e.clientX - r.left) * dpr;
      const y = (e.clientY - r.top) * dpr;
      const now = performance.now();
      if (!last) {
        last = { x, y, t: now };
        return;
      }
      const dx = x - last.x;
      const dy = y - last.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 1) return;
      const v = Math.min(8, dist / dpr / Math.max(4, now - last.t)); // px/ms
      if (colorRef.current === "auto" && now - autoT > 700) {
        autoT = now;
        autoIdx = (autoIdx + 1) % PALETTE.length;
      }
      const col = colorRef.current === "auto" ? PALETTE[autoIdx].value : colorRef.current;
      const nx = -dy / dist;
      const ny = dx / dist;
      phase += dist * 0.02;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = col;

      // Yavaş: kalın, yumuşak çizgi — Hızlı: ince, dalgalı çoklu teller
      const width = Math.max(1, (16 - v * 2.2) * dpr);
      ctx.globalAlpha = 0.9;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(x, y);
      ctx.stroke();

      const strands = 1 + Math.floor(v * 1.2);
      for (let s = 1; s <= strands; s++) {
        const off = Math.sin(phase + s) * (6 + v * 14) * s * dpr * 0.6;
        ctx.globalAlpha = 0.5 / s + 0.1;
        ctx.lineWidth = Math.max(1, dpr * (1.4 - Math.min(1, v / 8)));
        ctx.beginPath();
        ctx.moveTo(last.x + nx * off, last.y + ny * off);
        ctx.quadraticCurveTo(last.x + dx / 2 + nx * off * 1.6, last.y + dy / 2 + ny * off * 1.6, x + nx * off, y + ny * off);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      last = { x, y, t: now };
      setDrawn(true);
    };

    const onMove = (e: PointerEvent) => {
      // Fare: üzerinde gezinmek yeter. Dokunmatik/kalem: basılı sürükleme.
      if (e.pointerType === "mouse" || e.buttons > 0) stroke(e);
    };
    const reset = () => {
      last = null;
    };
    cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerdown", (e) => {
      last = null;
      stroke(e);
    });
    cv.addEventListener("pointerup", reset);
    cv.addEventListener("pointerleave", reset);
    cv.addEventListener("pointercancel", reset);

    return () => {
      ro.disconnect();
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerup", reset);
      cv.removeEventListener("pointerleave", reset);
      cv.removeEventListener("pointercancel", reset);
    };
  }, []);

  return (
    <div className="flex h-full w-full flex-col">
      <div ref={wrap} className="relative min-h-0 flex-1">
        <canvas ref={canvas} role="img" aria-label={t("label")} data-cursor="interact" className="absolute inset-0 block touch-none" />
        {!drawn && (
          <p className="mono-label pointer-events-none absolute inset-0 grid place-items-center text-[0.68rem] text-[#8E948C]">{t("hint")}</p>
        )}
      </div>
      <div className="mono-label flex flex-wrap items-center gap-2 border-t border-[#EDE9DF]/15 px-3 py-2.5 text-[0.62rem] text-[#EDE9DF]">
        <span className="mr-1 text-[#8E948C]">{t("color")}</span>
        <button
          type="button"
          aria-pressed={color === "auto"}
          onClick={() => setColor("auto")}
          className={`border px-2 py-1 ${color === "auto" ? "border-[#D6F46A] text-[#D6F46A]" : "border-[#EDE9DF]/30"}`}
        >
          {t("auto")}
        </button>
        {PALETTE.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-label={p.id}
            aria-pressed={color === p.value}
            onClick={() => setColor(p.value)}
            className="h-6 w-6 border"
            style={{ background: p.value, borderColor: color === p.value ? "#fff" : "transparent", outline: color === p.value ? "1px solid #fff" : "none", outlineOffset: 2 }}
          />
        ))}
        <span className="flex-1" />
        <button type="button" onClick={clear} className="border border-[#EDE9DF]/30 px-3 py-1.5 hover:border-[#FF6542] hover:text-[#FF6542]">
          {t("clear")}
        </button>
        <button type="button" onClick={save} className="bg-[#D6F46A] px-3 py-1.5 text-[#101F1C] hover:bg-[#FF6542]">
          {t("save")}
        </button>
      </div>
    </div>
  );
}
