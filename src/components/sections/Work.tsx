"use client";

import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import { projects } from "@/data/projects";
import { ProjectPanel } from "./ProjectCard";
import { KineticText } from "@/components/motion/KineticText";
import { SectionTag } from "@/components/ui/SectionTag";
import { useNavActions } from "@/hooks/useNavActions";
import { useDesktop, useReducedMotion } from "@/hooks/useMedia";

gsap.registerPlugin(ScrollTrigger);

function Intro() {
  const t = useTranslations("work");
  return (
    <div className="flex h-full flex-col justify-between">
      <SectionTag index="03" label={t("eyebrow")} />
      <h2 id="work-title">
        <KineticText text={t("title")} as="span" reveal="scroll" proximity weights={[420, 700]} className="display block text-[clamp(4.5rem,17vw,18rem)]" />
      </h2>
      <p className="mono-label text-[0.66rem] text-muted">
        {String(projects.length).padStart(2, "0")} — {t("dragHint")} →
      </p>
    </div>
  );
}

function AllLink() {
  const t = useTranslations("work");
  const { goProjects } = useNavActions();
  const locale = useLocale();
  return (
    <a
      href={`/${locale}/projects`}
      onClick={(e) => {
        e.preventDefault();
        goProjects();
      }}
      data-cursor="view"
      className="group flex h-full flex-col justify-end gap-6 border-l border-fg/20 pl-8"
    >
      <span className="display text-[clamp(3rem,7vw,7rem)] transition-transform duration-500 group-hover:translate-x-3">{t("all")}</span>
      <ArrowUpRight size={48} aria-hidden="true" className="text-accent transition-transform duration-500 group-hover:translate-x-2 group-hover:-translate-y-2" />
    </a>
  );
}

export function Work() {
  const desktop = useDesktop();
  const reduce = useReducedMotion();
  const pinned = desktop && !reduce;
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pinned) return;
    const pinEl = pin.current;
    const trackEl = track.current;
    if (!pinEl || !trackEl) return;
    const ctx = gsap.context(() => {
      const distance = () => Math.max(0, trackEl.scrollWidth - window.innerWidth);
      gsap.to(trackEl, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: pinEl,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
    }, pinEl);
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 200);
    return () => {
      window.clearTimeout(id);
      ctx.revert();
    };
  }, [pinned]);

  if (pinned) {
    return (
      <section id="work" data-section="work" data-tone="dark" aria-labelledby="work-title">
        <div ref={pin} className="relative h-[100svh] overflow-hidden">
          <div ref={track} className="flex h-full w-max items-stretch gap-[6vw] px-8 pb-10 pt-28 will-change-transform">
            <div className="w-[min(46vw,42rem)] shrink-0">
              <Intro />
            </div>
            {projects.map((p) => (
              <div key={p.slug} className="flex w-[min(54vw,64svh*1.6)] shrink-0 items-center">
                <ProjectPanel project={p} variant="pinned" />
              </div>
            ))}
            <div className="w-[min(32vw,28rem)] shrink-0">
              <AllLink />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="work" data-section="work" data-tone="dark" className="py-24" aria-labelledby="work-title">
      <div className="mb-12 min-h-[40svh] px-5 md:px-8">
        <Intro />
      </div>
      <div className="snap-track md:gap-8">
        {projects.map((p) => (
          <div key={p.slug} className="md:!flex-[0_0_62%]">
            <ProjectPanel project={p} />
          </div>
        ))}
      </div>
      <div className="mt-14 h-40 px-5 md:px-8">
        <AllLink />
      </div>
    </section>
  );
}
