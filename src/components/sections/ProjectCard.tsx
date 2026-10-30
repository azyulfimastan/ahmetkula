"use client";

import { useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ContourArt } from "@/components/ui/ContourArt";
import { useNavActions } from "@/hooks/useNavActions";
import { useFinePointer, useReducedMotion } from "@/hooks/useMedia";
import type { Locale } from "@/i18n/routing";
import type { Project } from "@/types";
import Image from "next/image";

/**
 * Dev, sinematik proje paneli. Hover'da görsel imleci takip eder, maske biçim değiştirir.
 * Dokunmatikte ilk dokunuş maskeyi açar, ikinci dokunuş vaka çalışmasına gider.
 */
export function ProjectPanel({ project, variant = "stack" }: { project: Project; variant?: "pinned" | "stack" }) {
  const t = useTranslations("work");
  const locale = useLocale() as Locale;
  const { goProject } = useNavActions();
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);
  const art = useRef<HTMLDivElement>(null);
  const touched = useRef(false);

  const move = (e: React.PointerEvent) => {
    if (!fine || reduce || !art.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    gsap.to(art.current, { x: x * -22, y: y * -22, scale: 1.08, duration: 0.8, ease: "power3.out", overwrite: "auto" });
  };
  const leave = () => {
    if (!art.current) return;
    gsap.to(art.current, { x: 0, y: 0, scale: 1, duration: 1, ease: "power3.out", overwrite: "auto" });
  };

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    // Dokunmatik: ilk dokunuş maskeyi/etkileşimi açar
    if (!fine && ref.current && ref.current.dataset.touchActive !== "true") {
      ref.current.dataset.touchActive = "true";
      touched.current = true;
      return;
    }
    goProject(project.slug, project.title);
  };

  const img = project.images?.[0];

  return (
    <a
      ref={ref}
      href={`/${locale}/projects/${project.slug}`}
      onClick={onClick}
      onPointerMove={move}
      onPointerLeave={leave}
      data-cursor="view"
      className="group relative block h-full w-full"
      aria-label={`${project.title} — ${t("view")}`}
    >
      <div className={`relative w-full overflow-hidden ${variant === "pinned" ? "h-[48svh]" : "aspect-[4/5] md:aspect-[16/11]"}`}>
        <div className="mask-shift absolute inset-0 bg-ink">
          <div ref={art} className="absolute inset-[-6%] will-change-transform">
            {img ? (
              <Image src={img.src} alt={img.alt[locale]} width={img.width} height={img.height} sizes="(min-width: 1024px) 70vw, 90vw" className="h-full w-full object-cover" />
            ) : (
              <ContourArt seed={project.visual.seed} kind={project.visual.kind} tone={project.visual.tone} className="h-full w-full" />
            )}
          </div>
        </div>
        <span className="mono-label absolute left-4 top-4 text-[0.66rem] text-ivory mix-blend-difference">{project.index}</span>
        {project.sample && (
          <span className="mono-label absolute right-4 top-4 bg-lime px-2 py-1 text-[0.6rem]" style={{ color: "#101F1C" }}>
            {t("sample")}
          </span>
        )}
      </div>

      <div className="relative mt-5 flex flex-col gap-3 md:mt-6">
        <h3 className={`display text-[clamp(2.6rem,8vw,8.5rem)] ${variant === "pinned" ? "lg:text-[clamp(3rem,6.4vw,7rem)]" : ""} transition-transform duration-500 ease-out group-hover:translate-x-3`}>{project.title}</h3>
        <p className="max-w-[44ch] text-muted">{project.tagline[locale]}</p>
        <ul className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <li key={tag} className="mono-label border border-fg/30 px-2.5 py-1 text-[0.6rem]">
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </a>
  );
}
