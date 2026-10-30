"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLeft, ArrowUpRight, GitBranch } from "lucide-react";
import { ContourArt } from "@/components/ui/ContourArt";
import { KineticText } from "@/components/motion/KineticText";
import { SectionTag } from "@/components/ui/SectionTag";
import { useNavActions } from "@/hooks/useNavActions";
import { useReducedMotion } from "@/hooks/useMedia";
import type { Locale } from "@/i18n/routing";
import type { Project } from "@/types";

gsap.registerPlugin(ScrollTrigger);

export function ProjectDetail({ project, next }: { project: Project; next: Project }) {
  const t = useTranslations("project");
  const w = useTranslations("work");
  const locale = useLocale() as Locale;
  const reduce = useReducedMotion();
  const { goProjects, goProject } = useNavActions();
  const root = useRef<HTMLElement>(null);
  const img = project.images?.[0];

  useEffect(() => {
    const el = root.current;
    if (!el || reduce) return;
    const ctx = gsap.context(() => {
      gsap.to(".case-visual-inner", { yPercent: -10, ease: "none", scrollTrigger: { trigger: ".case-visual", start: "top bottom", end: "bottom top", scrub: true } });
      gsap.fromTo(
        ".case-block",
        { y: 40, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 1, ease: "expo.out", stagger: 0.12, scrollTrigger: { trigger: ".case-body", start: "top 80%", once: true } },
      );
    }, el);
    return () => ctx.revert();
  }, [reduce]);

  const blocks: [string, string][] = [
    [t("challenge"), project.challenge[locale]],
    [t("approach"), project.approach[locale]],
    [t("outcome"), project.outcome[locale]],
  ];
  const { github, demo } = project.links;

  return (
    <article ref={root}>
      <section data-tone="dark" className="px-5 pb-16 pt-32 md:px-8 md:pt-44">
        <div className="mx-auto max-w-[1700px]">
          <button type="button" onClick={goProjects} data-cursor-snap className="mono-label mb-10 inline-flex items-center gap-2 text-[0.68rem] text-muted hover:text-fg">
            <ArrowLeft size={14} aria-hidden="true" /> {t("back")}
          </button>
          <SectionTag index={project.index} label={project.sample ? w("sample") : w("eyebrow")} />
          <h1 className="mt-8">
            <KineticText text={project.title} reveal="intro" proximity className="display block text-[clamp(3.6rem,17vw,19rem)]" />
          </h1>
          <p className="mt-6 max-w-2xl text-[clamp(1.2rem,2.4vw,2rem)] font-display">{project.tagline[locale]}</p>
          {project.sample && (
            <p role="note" className="mono-label mt-8 max-w-2xl border border-lime/60 bg-lime/10 p-4 text-[0.68rem] leading-relaxed">
              {t("sampleNotice")}
            </p>
          )}
          <ul className="mt-8 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <li key={tag} className="mono-label border border-fg/30 px-3 py-1.5 text-[0.64rem]">
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section data-tone="dark" className="case-visual relative mx-5 h-[62svh] overflow-hidden bg-ink md:mx-8" aria-label={t("visualLabel")}>
        <div className="case-visual-inner absolute inset-[-10%]">
          {img ? (
            <Image src={img.src} alt={img.alt[locale]} width={img.width} height={img.height} priority sizes="100vw" className="h-full w-full object-cover" />
          ) : (
            <ContourArt seed={project.visual.seed} kind={project.visual.kind} tone={project.visual.tone} className="h-full w-full" title={t("visualLabel")} />
          )}
        </div>
      </section>

      <section data-tone="light" className="case-body px-5 py-24 md:px-8 md:py-40">
        <div className="mx-auto grid max-w-[1700px] gap-14 md:grid-cols-12">
          <div className="case-block md:col-span-4">
            <h2 className="mono-label text-[0.68rem] text-muted">{t("overview")}</h2>
            <p className="mt-4 text-[clamp(1.1rem,1.8vw,1.5rem)] leading-relaxed">{project.summary[locale]}</p>
          </div>
          <div className="space-y-12 md:col-span-7 md:col-start-6">
            {blocks.map(([label, text]) => (
              <div key={label} className="case-block border-t border-fg/25 pt-5">
                <h2 className="display text-[clamp(1.8rem,3.4vw,3.2rem)] text-accent">{label}</h2>
                <p className="mt-4 max-w-[60ch] text-[clamp(1rem,1.4vw,1.2rem)] leading-relaxed">{text}</p>
              </div>
            ))}
            <div className="case-block border-t border-fg/25 pt-5">
              <h2 className="mono-label text-[0.68rem] text-muted">{t("links")}</h2>
              {github || demo ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  {github && (
                    <a href={github} target="_blank" rel="noopener noreferrer" data-cursor-snap className="mono-label inline-flex items-center gap-2 border border-fg px-4 py-3 text-[0.68rem] hover:bg-fg hover:text-bg">
                      <GitBranch size={14} aria-hidden="true" /> {w("github")}
                    </a>
                  )}
                  {demo && (
                    <a href={demo} target="_blank" rel="noopener noreferrer" data-cursor-snap className="mono-label inline-flex items-center gap-2 bg-accent px-4 py-3 text-[0.68rem] text-bg">
                      {w("demo")} <ArrowUpRight size={14} aria-hidden="true" />
                    </a>
                  )}
                </div>
              ) : (
                <p className="mt-4 text-muted">{t("noLinks")}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section data-tone="coral" className="px-5 py-24 md:px-8 md:py-36">
        <a
          href={`/${locale}/projects/${next.slug}`}
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
            e.preventDefault();
            goProject(next.slug, next.title);
          }}
          data-cursor="view"
          className="group mx-auto block max-w-[1700px]"
        >
          <span className="mono-label text-[0.68rem]">{t("next")} — {next.index}</span>
          <span className="display mt-4 block text-[clamp(3.4rem,15vw,17rem)] transition-transform duration-500 group-hover:translate-x-4">{next.title}</span>
        </a>
      </section>
    </article>
  );
}
