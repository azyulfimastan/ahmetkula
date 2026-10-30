"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { gsap } from "gsap";
import { useTranslations } from "next-intl";
import { useSite } from "@/components/layout/SiteProvider";
import { useReducedMotion } from "@/hooks/useMedia";
import { sceneState } from "@/lib/sceneState";
import { lineFragment, surfaceFragment, vertexShader } from "./shaders";

type Quality = "high" | "low";

type Control = {
  rotX: number;
  rotY: number;
  velY: number;
  tx: number;
  ty: number;
  mx: number;
  my: number;
  dragging: boolean;
  impulse: number;
  form: number;
};

const FORMS: [number, number, number][] = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];

const rgb = (r: number, g: number, b: number) => new THREE.Vector3(r / 255, g / 255, b / 255);

function paletteFor(theme: "forest" | "ivory", alt: boolean) {
  if (theme === "ivory") {
    return {
      base: rgb(216, 205, 186),
      rim: alt ? rgb(88, 110, 8) : rgb(214, 62, 28),
      a: rgb(23, 32, 29),
      b: alt ? rgb(214, 62, 28) : rgb(23, 32, 29),
    };
  }
  return {
    base: rgb(22, 40, 36),
    rim: alt ? rgb(214, 244, 106) : rgb(255, 101, 66),
    a: alt ? rgb(255, 101, 66) : rgb(214, 244, 106),
    b: rgb(237, 233, 223),
  };
}

function buildGeometry(seg: number, rings: number) {
  const count = (seg + 1) * (rings + 1);
  const uvs = new Float32Array(count * 2);
  const pos = new Float32Array(count * 3);
  for (let j = 0; j <= rings; j++) {
    for (let i = 0; i <= seg; i++) {
      const k = j * (seg + 1) + i;
      uvs[k * 2] = i / seg;
      uvs[k * 2 + 1] = j / rings;
    }
  }
  const tri: number[] = [];
  for (let j = 0; j < rings; j++) {
    for (let i = 0; i < seg; i++) {
      const a = j * (seg + 1) + i;
      const b = a + 1;
      const c = a + seg + 1;
      const d = c + 1;
      tri.push(a, c, b, b, c, d);
    }
  }
  const surface = new THREE.BufferGeometry();
  surface.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  surface.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  surface.setIndex(tri);

  const lineIdx: number[] = [];
  const ringStep = Math.max(2, Math.round(rings / 26));
  for (let j = 0; j <= rings; j += ringStep) {
    for (let i = 0; i < seg; i++) {
      const a = j * (seg + 1) + i;
      lineIdx.push(a, a + 1);
    }
  }
  const merStep = Math.max(2, Math.round(seg / 28));
  for (let i = 0; i < seg; i += merStep) {
    for (let j = 0; j < rings; j++) {
      const a = j * (seg + 1) + i;
      lineIdx.push(a, a + seg + 1);
    }
  }
  const lines = new THREE.BufferGeometry();
  lines.setAttribute("position", surface.getAttribute("position"));
  lines.setAttribute("uv", surface.getAttribute("uv"));
  lines.setIndex(lineIdx);
  return { surface, lines };
}

function Sculpture({ ctl, quality, reduce }: { ctl: React.RefObject<Control>; quality: Quality; reduce: boolean }) {
  const { theme, palette } = useSite();
  const group = useRef<THREE.Group>(null);
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);

  const [seg, rings] = quality === "high" ? [168, 64] : [96, 40];
  const geo = useMemo(() => buildGeometry(seg, rings), [seg, rings]);

  const shared = useMemo(
    () => ({
      uTime: { value: 0 },
      uForm: { value: new THREE.Vector3(1, 0, 0) },
      uImpulse: { value: 0 },
      uMouse: { value: new THREE.Vector2() },
      uScroll: { value: 0 },
    }),
    [],
  );

  const target = paletteFor(theme, palette === "alt");
  const surfaceMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader: surfaceFragment,
        uniforms: { ...shared, uBase: { value: target.base.clone() }, uRim: { value: target.rim.clone() } },
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shared],
  );
  const lineMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader: lineFragment,
        uniforms: { ...shared, uLineA: { value: target.a.clone() }, uLineB: { value: target.b.clone() } },
        transparent: true,
        depthWrite: false,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shared],
  );

  useEffect(
    () => () => {
      geo.surface.dispose();
      geo.lines.dispose();
      surfaceMat.dispose();
      lineMat.dispose();
    },
    [geo, surfaceMat, lineMat],
  );

  // Tema değişince renkler yumuşakça geçer
  useEffect(() => {
    const t = paletteFor(theme, palette === "alt");
    const u1 = surfaceMat.uniforms;
    const u2 = lineMat.uniforms;
    const tw = gsap.to(
      {},
      {
        duration: reduce ? 0 : 0.8,
        onUpdate: function () {
          const k = this.progress();
          u1.uBase.value.lerp(t.base, k);
          u1.uRim.value.lerp(t.rim, k);
          u2.uLineA.value.lerp(t.a, k);
          u2.uLineB.value.lerp(t.b, k);
          invalidate();
        },
      },
    );
    return () => {
      tw.kill();
    };
  }, [theme, palette, surfaceMat, lineMat, reduce, invalidate]);

  useFrame((state, delta) => {
    const c = ctl.current;
    if (!c || !group.current) return;
    const dt = Math.min(delta, 0.05);
    shared.uTime.value += reduce ? 0 : dt;

    c.impulse *= Math.pow(0.04, dt);
    shared.uImpulse.value = c.impulse;
    shared.uScroll.value = sceneState.scroll;

    if (c.dragging) {
      c.velY *= 0.9;
    } else {
      c.rotY += c.velY * dt * 60;
      c.velY *= Math.pow(0.08, dt);
      if (!reduce) c.rotY += dt * 0.18;
    }
    const wantX = c.ty * 0.35;
    const wantY = c.tx * 0.55;
    c.rotX += (wantX - c.rotX) * Math.min(1, dt * 3);
    group.current.rotation.x = c.rotX;
    group.current.rotation.y = c.rotY + wantY * 0.5;
    group.current.rotation.z = 0.08;

    const mx = c.mx;
    const my = c.my;
    shared.uMouse.value.set(mx * (size.width / size.height) * 1.6, my * 1.4);

    // Scroll: obje farklı hızda yukarı kayar ve küçülür
    const s = Math.max(0.55, 1 - sceneState.scroll * 0.35);
    const base = Math.min(1.2, Math.max(0.62, size.height / 820)) * (size.width < 768 ? 0.88 : 1);
    group.current.scale.setScalar(base * s);
    group.current.position.y = sceneState.scroll * 1.2;
    group.current.position.x = size.width > 1100 ? 0.55 : 0;

    if (reduce && (c.dragging || c.impulse > 0.01 || Math.abs(c.velY) > 0.001)) state.invalidate();
  });

  return (
    <group ref={group}>
      <mesh geometry={geo.surface} material={surfaceMat} frustumCulled={false} />
      <lineSegments geometry={geo.lines} material={lineMat} frustumCulled={false} />
    </group>
  );
}

export default function HeroScene({ quality: initialQuality }: { quality: Quality }) {
  const t = useTranslations("hero");
  const reduce = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [quality, setQuality] = useState<Quality>(initialQuality);
  const [dpr, setDpr] = useState(initialQuality === "high" ? 2 : 1.25);
  const ctl = useRef<Control>({ rotX: 0, rotY: 0.6, velY: 0, tx: 0, ty: 0, mx: 0, my: 0, dragging: false, impulse: 0, form: 0 });
  const drag = useRef({ x: 0, y: 0, t: 0, moved: 0, id: -1 });
  const lastMove = useRef({ x: 0, y: 0, t: 0 });

  // Görünür değilken render durur
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Fare konumu / hız → rotasyon ve fiziksel tepki
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = -(((e.clientY - r.top) / r.height) * 2 - 1);
      const c = ctl.current;
      c.tx = Math.max(-1.2, Math.min(1.2, nx));
      c.ty = Math.max(-1.2, Math.min(1.2, -ny));
      c.mx = Math.max(-1.5, Math.min(1.5, nx));
      c.my = Math.max(-1.5, Math.min(1.5, ny));
      const now = performance.now();
      const dx = e.clientX - lastMove.current.x;
      const dy = e.clientY - lastMove.current.y;
      const dtm = Math.max(8, now - lastMove.current.t);
      const speed = Math.hypot(dx, dy) / dtm; // px/ms
      lastMove.current = { x: e.clientX, y: e.clientY, t: now };
      if (speed > 1.1 && e.pointerType === "mouse") c.impulse = Math.min(1, Math.max(c.impulse, speed / 4));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    const burst = () => {
      ctl.current.impulse = 1;
      ctl.current.velY += 0.35;
    };
    window.addEventListener("ak:burst", burst);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("ak:burst", burst);
    };
  }, []);

  const morph = () => {
    const c = ctl.current;
    c.form = (c.form + 1) % FORMS.length;
    c.impulse = 1;
    c.velY += 0.25;
    window.dispatchEvent(new CustomEvent("ak:morph", { detail: FORMS[c.form] }));
  };

  // Biçim geçişi: uniform'a event ile ulaş (Canvas içinde dinle)
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    drag.current = { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0, id: e.pointerId };
    ctl.current.dragging = true;
    (e.currentTarget as HTMLDivElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!ctl.current.dragging || drag.current.id !== e.pointerId) return;
    const dx = e.clientX - drag.current.x;
    drag.current.x = e.clientX;
    drag.current.moved += Math.abs(dx) + Math.abs(e.clientY - drag.current.y);
    drag.current.y = e.clientY;
    ctl.current.rotY += dx * 0.009;
    ctl.current.velY = dx * 0.009 * 0.6;
    ctl.current.impulse = Math.min(1, ctl.current.impulse + Math.abs(dx) * 0.004);
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current.id !== e.pointerId) return;
    ctl.current.dragging = false;
    drag.current.id = -1;
    if (drag.current.moved < 6 && performance.now() - drag.current.t < 450) morph();
  };

  return (
    <div
      ref={wrap}
      role="img"
      aria-label={t("sculptureLabel")}
      tabIndex={0}
      data-cursor="drag"
      className="absolute inset-0 touch-pan-y outline-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          morph();
        } else if (e.key === "ArrowLeft") ctl.current.velY -= 0.12;
        else if (e.key === "ArrowRight") ctl.current.velY += 0.12;
      }}
    >
      <Canvas
        flat
        dpr={dpr}
        frameloop={!visible ? "never" : reduce ? "demand" : "always"}
        camera={{ position: [0, 0, 5.6], fov: 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ pointerEvents: "none" }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <PerformanceMonitor
          onDecline={() => {
            setDpr(1);
            setQuality("low");
          }}
        />
        <FormTween />
        <Sculpture ctl={ctl} quality={quality} reduce={reduce} />
      </Canvas>
    </div>
  );
}

/** "ak:morph" olayını dinleyip uniform'ları GSAP ile yumuşakça geçirir. */
function FormTween() {
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const onMorph = (e: Event) => {
      const [x, y, z] = (e as CustomEvent<[number, number, number]>).detail;
      scene.traverse((o) => {
        const m = (o as THREE.Mesh).material as THREE.ShaderMaterial | undefined;
        const v = m?.uniforms?.uForm?.value as THREE.Vector3 | undefined;
        if (v) gsap.to(v, { x, y, z, duration: 1.4, ease: "expo.out", overwrite: "auto" });
      });
    };
    window.addEventListener("ak:morph", onMorph);
    return () => window.removeEventListener("ak:morph", onMorph);
  }, [scene]);
  return null;
}
