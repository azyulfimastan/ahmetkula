"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { KineticText } from "@/components/motion/KineticText";
import { Magnetic } from "@/components/motion/Magnetic";
import { HeroLoader } from "@/components/three/HeroLoader";
import { useNavActions } from "@/hooks/useNavActions";
import { useSite } from "@/components/layout/SiteProvider";
import { useFinePointer, useReducedMotion } from "@/hooks/useMedia";
import { sceneState } from "@/lib/sceneState";
import { ArrowDownRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function Hero() {
  const t = useTranslations("hero");
  const { goSection } = useNavActions();
  const { introDone, toast } = useSite();
  const t2 = useTranslations("easter");
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const title = useRef<HTMLDivElement>(null);
  const line1 = useRef<HTMLDivElement>(null);
  const line2 = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const info = useRef<HTMLDivElement>(null);

  // Scroll: tipografi ve 3D obje farklı hızlarda hareket eder
  useEffect(() => {
    const el = root.current;
    if (!el || reduce) {
      sceneState.scroll = 0;
      return;
    }
    const ctx = gsap.context(() => {
      const st = { trigger: el, start: "top top", end: "bottom top", scrub: 0.6 };
      gsap.to(line1.current, { yPercent: -18, xPercent: -4, ease: "none", scrollTrigger: st });
      gsap.to(line2.current, { yPercent: -42, xPercent: 6, ease: "none", scrollTrigger: st });
      gsap.to(scene.current, { yPercent: 14, ease: "none", scrollTrigger: st });
      gsap.to(info.current, { yPercent: -30, autoAlpha: 0.0, ease: "none", scrollTrigger: { ...st, end: "70% top" } });
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom top",
        onUpdate: (self) => {
          sceneState.scroll = self.progress;
        },
      });
    }, el);
    return () => {
      ctx.revert();
      sceneState.scroll = 0;
    };
  }, [reduce]);

  // Giriş: alt bilgi satırları
  useEffect(() => {
    const el = info.current;
    if (!el || reduce) return;
    const items = el.querySelectorAll(".hero-in");
    if (!introDone) {
      gsap.set(items, { autoAlpha: 0, y: 24 });
      return;
    }
    gsap.to(items, { autoAlpha: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.08, delay: 0.5 });
  }, [introDone, reduce]);

  const dotHint = () => {
    const msgs = t2.raw("hidden") as string[];
    toast(msgs[0]);
  };

  return (
    <section ref={root} id="hero" data-section="hero" data-tone="dark" className="relative min-h-[100svh] overflow-hidden" aria-labelledby="hero-title">
      {/* İnce hareketli doku çizgileri */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "linear-gradient(rgb(var(--fg)) 1px, transparent 1px)", backgroundSize: "100% 56px" }} />

      <div ref={scene} className="absolute inset-0 z-0">
        <HeroLoader />
      </div>

      <div className="pointer-events-none relative z-10 flex min-h-[100svh] flex-col justify-between px-5 pb-8 pt-28 md:px-8">
        <h1 id="hero-title" className="sr-only">
          Ahmet Kula — Software Engineer, Creative Developer
        </h1>

        <div ref={title} aria-hidden="true" className="select-none">
          <div ref={line1} className="will-change-transform">
            <KineticText
              text="AHMET"
              as="div"
              proximity
              reveal="intro"
              className="display block text-[clamp(4.6rem,26vw,31rem)]"
            />
          </div>
          <div ref={line2} className="will-change-transform md:ml-[14vw]">
            <span className="display block text-[clamp(4.6rem,26vw,31rem)]">
              <KineticText text="KULA" proximity reveal="intro" delay={0.25} />
              <button
                type="button"
                onClick={dotHint}
                tabIndex={-1}
                aria-hidden="true"
                className="pointer-events-auto inline-block text-accent"
                data-cursor="interact"
              >
                .
              </button>
            </span>
          </div>
        </div>

        <div ref={info} className="grid items-end gap-8 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="hero-in mono-label text-[0.74rem] leading-relaxed">
              <span className="block">{t("role1")}</span>
              <span className="block text-accent">{t("role2")}</span>
            </p>
            <p className="hero-in mt-4 max-w-md font-display text-[clamp(1.1rem,2.1vw,1.55rem)] leading-snug">{t("tagline")}</p>
            <p className="hero-in mono-label mt-3 text-[0.66rem] text-muted">{t("vibe")}</p>
          </div>

          <div className="pointer-events-auto flex flex-wrap gap-3 md:col-span-4 md:col-start-8 md:justify-end">
            <Magnetic>
              <button
                type="button"
                onClick={() => goSection("work")}
                data-cursor-snap
                className="hero-in mono-label inline-flex items-center gap-2 bg-accent px-6 py-4 text-[0.74rem] text-forest transition-transform hover:-translate-y-0.5"
                style={{ color: "#101F1C" }}
              >
                {t("explore")}
                <ArrowDownRight size={15} aria-hidden="true" />
              </button>
            </Magnetic>
            <Magnetic>
              <button
                type="button"
                onClick={() => goSection("contact")}
                data-cursor-snap
                className="hero-in mono-label inline-flex items-center gap-2 border border-fg/50 px-6 py-4 text-[0.74rem] transition-colors hover:border-signal hover:text-signal"
              >
                {t("contact")}
              </button>
            </Magnetic>
          </div>

          <p className="hero-in mono-label pointer-events-none hidden text-[0.62rem] text-muted md:col-span-1 md:block md:text-right" aria-hidden="true">
            {t("scroll")}
          </p>
        </div>

        <p className="hero-in mono-label pointer-events-none absolute right-5 top-28 hidden max-w-[11rem] text-right text-[0.62rem] text-muted md:right-8 lg:block" aria-hidden="true">
          {fine ? t("dragHint") : t("dragHintTouch")}
        </p>
      </div>
    </section>
  );
}
