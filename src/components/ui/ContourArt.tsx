import { seeded } from "@/lib/utils";

type Kind = "rings" | "lines" | "grid" | "waves";
type Tone = "coral" | "lime" | "ivory";

const STROKE: Record<Tone, string> = {
  coral: "#FF6542",
  lime: "#D6F46A",
  ivory: "#EDE9DF",
};

/**
 * Deterministik, üretken SVG kapak çizimi. Gerçek proje görseli olmadığında kullanılır;
 * stok görsel yerine sitenin kendi dilinde bir yüzey üretir.
 */
export function ContourArt({
  seed,
  kind,
  tone,
  className,
  title,
}: {
  seed: number;
  kind: Kind;
  tone: Tone;
  className?: string;
  title?: string;
}) {
  const rnd = seeded(seed);
  const c = STROKE[tone];
  const W = 800;
  const H = 1000;
  const els: React.ReactNode[] = [];

  if (kind === "rings") {
    const cx = 300 + rnd() * 200;
    const cy = 380 + rnd() * 240;
    for (let i = 0; i < 34; i++) {
      const r = 20 + i * 17;
      const wob = 6 + rnd() * 26;
      const n = 90;
      const pts: string[] = [];
      const ph = rnd() * 6.28;
      for (let k = 0; k <= n; k++) {
        const a = (k / n) * Math.PI * 2;
        const rr = r + Math.sin(a * 3 + ph + i * 0.35) * wob + Math.cos(a * 5 - i * 0.2) * wob * 0.4;
        pts.push(`${(cx + Math.cos(a) * rr * 1.1).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`);
      }
      els.push(<polyline key={i} points={pts.join(" ")} fill="none" stroke={c} strokeWidth={1.2} opacity={0.25 + (i / 34) * 0.75} />);
    }
  } else if (kind === "lines") {
    for (let i = 0; i < 46; i++) {
      const y0 = (i / 46) * H;
      const amp = 20 + rnd() * 80;
      const ph = rnd() * 6;
      const pts: string[] = [];
      for (let x = 0; x <= W; x += 16) pts.push(`${x},${(y0 + Math.sin(x / 90 + ph) * amp + Math.sin(x / 33 + i) * 6).toFixed(1)}`);
      els.push(<polyline key={i} points={pts.join(" ")} fill="none" stroke={c} strokeWidth={i % 7 === 0 ? 2.4 : 1} opacity={i % 7 === 0 ? 1 : 0.5} />);
    }
  } else if (kind === "grid") {
    const cols = 12;
    const rows = 15;
    for (let r = 0; r < rows; r++) {
      for (let k = 0; k < cols; k++) {
        const x = 40 + k * 64;
        const y = 50 + r * 62;
        const s = 4 + rnd() * 22;
        els.push(<rect key={`${r}-${k}`} x={x} y={y} width={s} height={s} fill={rnd() > 0.82 ? c : "none"} stroke={c} strokeWidth={1} opacity={0.35 + rnd() * 0.65} />);
      }
    }
  } else {
    for (let i = 0; i < 28; i++) {
      const pts: string[] = [];
      const ph = rnd() * 6.28;
      const f = 0.006 + rnd() * 0.012;
      for (let x = 0; x <= W; x += 10) {
        const y = 500 + Math.sin(x * f + ph) * (60 + i * 11) * Math.cos(x * 0.003 + i * 0.2);
        pts.push(`${x},${y.toFixed(1)}`);
      }
      els.push(<polyline key={i} points={pts.join(" ")} fill="none" stroke={c} strokeWidth={1.1} opacity={0.3 + (i / 28) * 0.7} />);
    }
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      preserveAspectRatio="xMidYMid slice"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {els}
    </svg>
  );
}
