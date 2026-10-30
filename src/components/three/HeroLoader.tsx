"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ContourArt } from "@/components/ui/ContourArt";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false, loading: () => null });

type Mode = "pending" | "high" | "low" | "none";

function detect(): Mode {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2");
    if (!gl) return "none";
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const cores = navigator.hardwareConcurrency || 4;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
    return coarse && (cores <= 4 || mem <= 3) ? "low" : coarse ? "low" : "high";
  } catch {
    return "none";
  }
}

/** WebGL2 yoksa statik, çizgisel bir heykel çizimi gösterir. */
export function HeroLoader() {
  const t = useTranslations("hero");
  const [mode, setMode] = useState<Mode>("pending");

  useEffect(() => {
    setMode(detect());
  }, []);

  if (mode === "pending") return null;
  if (mode === "none") {
    return (
      <div role="img" aria-label={t("fallback")} className="absolute inset-0 flex items-center justify-center opacity-70">
        <ContourArt seed={7} kind="rings" tone="coral" className="h-[80%] w-auto max-w-full" />
      </div>
    );
  }
  return <HeroScene quality={mode} />;
}
