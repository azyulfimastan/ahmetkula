"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { KineticText } from "@/components/motion/KineticText";
import { SectionTag } from "@/components/ui/SectionTag";
import { AKMark } from "@/components/ui/Logo";
import { siteConfig } from "@/config/site";
import { useReducedMotion } from "@/hooks/useMedia";

gsap.registerPlugin(ScrollTrigger);

type Point = { label: string; text: string };

export function About() {
  const t = useTranslations("about");
  const reduce = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(0);
  const points = t.raw("points") as Point[];
  const tags = t.raw("tags") as string[];
  const { portrait } = siteConfig;

  useEffect(() => {
    const el = root.current;
    if (!el || reduce) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".v-line").forEach((line, i) => {
        gsap.fromTo(
          line,
          { scaleY: 0 },
          { scaleY: 1, ease: "none", transformOrigin: "top", scrollTrigger: { trigger: el, start: "top 70%", end: `bottom ${60 + i * 10}%`, scrub: 0.5 } },
        );
      });
      gsap.fromTo(
        ".about-fade",
        { y: 36, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 1, ease: "expo.out", stagger: 0.12, scrollTrigger: { trigger: ".about-copy", start: "top 80%", once: true } },
      );
      // Portre: maske açılışı + hafif parallax
      gsap.fromTo(
        ".portrait-mask",
        { clipPath: "inset(100% 0% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut", scrollTrigger: { trigger: ".portrait-wrap", start: "top 80%", once: true } },
      );
      gsap.to(".portrait-inner", { yPercent: -8, ease: "none", scrollTrigger: { trigger: ".portrait-wrap", start: "top bottom", end: "bottom top", scrub: true } });
      gsap.to(".about-mark", { rotate: 90, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    }, el);
    return () => ctx.revert();
  }, [reduce]);

  return (
    <section ref={root} id="about" data-section="about" data-tone="light" className="relative overflow-hidden px-5 py-28 md:px-8 md:py-44" aria-labelledby="about-title">
      {/* Hareketli dikey çizgiler */}
      {[12, 41, 73, 94].map((left, i) => (
        <div key={left} aria-hidden="true" className="pointer-events-none absolute inset-y-0 w-px" style={{ left: `${left}%` }}>
          <div className="v-line h-full w-px bg-fg/20" style={{ opacity: 1 - i * 0.15 }} />
        </div>
      ))}

      <div className="relative mx-auto max-w-[1700px]">
        <SectionTag index="02" label={t("eyebrow")} />

        <h2 id="about-title" className="mt-10">
          <KineticText text={t("title1")} as="span" reveal="scroll" proximity weights={[500, 700]} radius={200} className="display block max-w-[18ch] text-[clamp(2.6rem,9vw,9.5rem)]" />
          <KineticText text={t("title2")} as="span" reveal="scroll" delay={0.2} className="display mt-3 block max-w-[22ch] text-[clamp(1.5rem,4.6vw,4.6rem)] text-accent" />
        </h2>

        <div className="mt-20 grid gap-14 md:mt-28 md:grid-cols-12">
          <div className="about-copy md:col-span-6 md:col-start-6">
            <p className="about-fade text-[clamp(1.1rem,1.8vw,1.55rem)] leading-relaxed">{t("intro")}</p>

            <ul className="about-fade mt-8 flex flex-wrap gap-2" aria-label="tags">
              {tags.map((tag) => (
                <li key={tag} className="mono-label border border-fg/30 px-3 py-1.5 text-[0.66rem]">
                  {tag}
                </li>
              ))}
            </ul>

            {/* İnteraktif bilgi parçaları */}
            <div className="about-fade mt-14">
              <p className="mono-label mb-3 text-[0.66rem] text-muted">{t("pointsLabel")}</p>
              <ul className="divide-y divide-fg/20 border-y border-fg/20">
                {points.map((p, i) => (
                  <li key={p.label}>
                    <button
                      type="button"
                      aria-expanded={open === i}
                      onClick={() => setOpen(i)}
                      onMouseEnter={() => setOpen(i)}
                      data-cursor="interact"
                      className="flex w-full items-baseline justify-between gap-6 py-5 text-left"
                    >
                      <span className="display text-[clamp(1.8rem,4vw,3.4rem)]" style={{ color: open === i ? "rgb(var(--accent))" : undefined }}>
                        {p.label}
                      </span>
                      <span className="mono-label text-[0.62rem] text-muted">0{i + 1}</span>
                    </button>
                    <div className="grid transition-[grid-template-rows] duration-500 ease-out" style={{ gridTemplateRows: open === i ? "1fr" : "0fr" }}>
                      <p className="overflow-hidden text-[1rem] text-muted">
                        <span className="block pb-5">{p.text}</span>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Portre / tipografik alternatif */}
          <div className="portrait-wrap md:order-first md:col-span-4 md:col-start-1 md:row-start-1">
            <div className="portrait-mask relative aspect-[4/5] overflow-hidden bg-fg/10" style={{ clipPath: "polygon(0 0, 100% 0, 100% 88%, 82% 100%, 0 100%)" }}>
              <div className="portrait-inner absolute inset-[-8%]">
                {portrait.enabled ? (
                  <Image src={portrait.src} alt={t("portraitAlt")} width={portrait.width} height={portrait.height} sizes="(min-width: 768px) 33vw, 90vw" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-6 text-fg" role="img" aria-label={t("fallbackLabel")}>
                    <span className="display text-[clamp(8rem,22vw,20rem)] opacity-90">AK</span>
                  </div>
                )}
              </div>
              <span className="mono-label absolute bottom-3 left-3 text-[0.6rem] text-muted">{portrait.enabled ? "AK/PORTRAIT" : t("fallbackLabel")}</span>
            </div>
            <div className="mt-6 flex items-center gap-4">
              <AKMark size={44} className="about-mark" />
              <p className="display text-[clamp(1.2rem,2vw,1.8rem)]">{t("mantra")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
