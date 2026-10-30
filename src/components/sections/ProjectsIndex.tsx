"use client";

import { useLocale, useTranslations } from "next-intl";
import { projects } from "@/data/projects";
import { ContourArt } from "@/components/ui/ContourArt";
import { KineticText } from "@/components/motion/KineticText";
import { SectionTag } from "@/components/ui/SectionTag";
import { useNavActions } from "@/hooks/useNavActions";
import type { Locale } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";

export function ProjectsIndex() {
  const t = useTranslations("projects");
  const w = useTranslations("work");
  const locale = useLocale() as Locale;
  const { goProject, goSection } = useNavActions();

  return (
    <section data-tone="dark" className="min-h-[100svh] px-5 pb-24 pt-32 md:px-8 md:pt-44" aria-labelledby="projects-title">
      <div className="mx-auto max-w-[1700px]">
        <button type="button" onClick={() => goSection("hero")} data-cursor-snap className="mono-label mb-10 inline-flex items-center gap-2 text-[0.68rem] text-muted hover:text-fg">
          <ArrowLeft size={14} aria-hidden="true" /> {t("back")}
        </button>
        <SectionTag index="03" label={w("eyebrow")} />
        <h1 id="projects-title" className="mt-8">
          <KineticText text={t("title")} reveal="intro" proximity className="display block text-[clamp(4.5rem,20vw,22rem)]" />
        </h1>
        <p className="mt-6 max-w-xl text-[clamp(1.1rem,2vw,1.6rem)]">{t("intro")}</p>

        <ul className="mt-16 border-t border-fg/25">
          {projects.map((p) => (
            <li key={p.slug} className="border-b border-fg/25">
              <a
                href={`/${locale}/projects/${p.slug}`}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                  e.preventDefault();
                  goProject(p.slug, p.title);
                }}
                data-cursor="view"
                className="group grid items-center gap-6 py-8 md:grid-cols-12 md:py-10"
              >
                <span className="mono-label text-[0.68rem] text-muted md:col-span-1">{p.index}</span>
                <span className="display text-[clamp(2.4rem,7vw,7.5rem)] transition-transform duration-500 group-hover:translate-x-4 md:col-span-6">{p.title}</span>
                <span className="text-muted md:col-span-3">
                  {p.tagline[locale]}
                  {p.sample && <span className="mono-label ml-3 bg-lime px-2 py-1 text-[0.58rem]" style={{ color: "#101F1C" }}>{w("sample")}</span>}
                </span>
                <span className="relative hidden h-24 overflow-hidden bg-ink md:col-span-2 md:block">
                  <ContourArt seed={p.visual.seed} kind={p.visual.kind} tone={p.visual.tone} className="h-full w-full transition-transform duration-700 group-hover:scale-110" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
