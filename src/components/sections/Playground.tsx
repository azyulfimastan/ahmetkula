"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { KineticText } from "@/components/motion/KineticText";
import { SectionTag } from "@/components/ui/SectionTag";
import { LazyMount } from "@/components/playground/LazyMount";

const ParticleTypography = dynamic(() => import("@/components/playground/ParticleTypography"), { ssr: false });
const GenerativeCanvas = dynamic(() => import("@/components/playground/GenerativeCanvas"), { ssr: false });
const PhysicsSandbox = dynamic(() => import("@/components/playground/PhysicsSandbox"), { ssr: false });

function Panel({ n, title, hint, className, children }: { n: string; title: string; hint?: string; className?: string; children: React.ReactNode }) {
  const t = useTranslations("playground");
  return (
    <figure className={`flex flex-col border border-[#EDE9DF]/15 bg-[#0B1613] text-[#EDE9DF] ${className ?? ""}`}>
      <figcaption className="mono-label flex items-center justify-between gap-4 border-b border-[#EDE9DF]/15 px-3 py-2.5 text-[0.62rem]">
        <span>
          <span className="mr-3 text-[#FF6542]">{n}</span>
          {title}
        </span>
        {hint && <span className="hidden text-[#8E948C] sm:inline">{hint}</span>}
      </figcaption>
      <div className="min-h-0 flex-1">
        <LazyMount fallback={<p className="mono-label grid h-full place-items-center text-[0.62rem] text-[#8E948C]">{t("loading")}</p>}>{children}</LazyMount>
      </div>
    </figure>
  );
}

export function Playground() {
  const t = useTranslations("playground");
  return (
    <section id="playground" data-section="playground" data-tone="dark" className="relative px-5 py-28 md:px-8 md:py-44" aria-labelledby="playground-title">
      <div className="mx-auto max-w-[1700px]">
        <SectionTag index="05" label={t("eyebrow")} />
        <h2 id="playground-title" className="mt-10">
          <KineticText text={t("title")} as="span" reveal="scroll" proximity weights={[420, 700]} className="display block text-[clamp(3.4rem,15vw,17rem)]" />
        </h2>
        <p className="mt-6 max-w-xl text-[clamp(1.1rem,2vw,1.6rem)] font-display">{t("subtitle")}</p>
        <p className="mono-label mt-3 max-w-xl text-[0.62rem] text-muted md:hidden">{t("touchNote")}</p>

        <div className="mt-16 grid gap-5 lg:grid-cols-2">
          <Panel n="01" title={t("particle.title")} hint={t("particle.hint")} className="h-[clamp(20rem,58svh,40rem)] lg:col-span-2">
            <ParticleTypography label={t("particle.label")} />
          </Panel>
          <Panel n="02" title={t("art.title")} hint={t("art.hint")} className="h-[clamp(24rem,62svh,40rem)]">
            <GenerativeCanvas />
          </Panel>
          <Panel n="03" title={t("physics.title")} hint={t("physics.hint")} className="h-[clamp(24rem,62svh,40rem)]">
            <PhysicsSandbox />
          </Panel>
        </div>
      </div>
    </section>
  );
}
