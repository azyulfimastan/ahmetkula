"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import { KineticText } from "@/components/motion/KineticText";
import { Magnetic } from "@/components/motion/Magnetic";
import { SectionTag } from "@/components/ui/SectionTag";
import { siteConfig } from "@/config/site";
import { useReducedMotion } from "@/hooks/useMedia";

type Channel = { id: string; label: string; href: string };

export function Contact() {
  const t = useTranslations("contact");
  const reduce = useReducedMotion();
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const chip = useRef<HTMLSpanElement>(null);
  const c = siteConfig.contact;

  const channels: Channel[] = [
    { id: "github", label: t("github"), href: c.github },
    { id: "linkedin", label: t("linkedin"), href: c.linkedin },
    ...c.other.map((o) => ({ id: o.label, label: o.label, href: o.href })),
  ];

  const copy = async () => {
    if (!c.email) return;
    try {
      await navigator.clipboard.writeText(c.email);
      setState("copied");
    } catch {
      // Eski tarayıcılar için geri dönüş
      try {
        const ta = document.createElement("textarea");
        ta.value = c.email;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        ta.remove();
        setState(ok ? "copied" : "failed");
      } catch {
        setState("failed");
      }
    }
    if (chip.current && !reduce) gsap.fromTo(chip.current, { scale: 0.7, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.5, ease: "back.out(3)" });
    window.setTimeout(() => setState("idle"), 2200);
  };

  return (
    <section id="contact" data-section="contact" data-tone="coral" className="relative min-h-[100svh] px-5 pb-10 pt-28 md:px-8 md:pt-40" aria-labelledby="contact-title">
      <div className="mx-auto flex min-h-[calc(100svh-9rem)] max-w-[1700px] flex-col justify-between gap-16">
        <div>
          <SectionTag index="06" label={t("eyebrow")} />
          <h2 id="contact-title" className="mt-10">
            <KineticText
              text={t("title")}
              as="span"
              reveal="scroll"
              proximity
              weights={[420, 720]}
              radius={300}
              className="display block text-[clamp(3rem,11.5vw,14rem)]"
            />
          </h2>
        </div>

        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="mono-label mb-4 text-[0.66rem] text-muted">{t("email")}</p>
            <div className="flex flex-wrap items-center gap-4">
              {c.email ? (
                <>
                  <a href={`mailto:${c.email}`} data-cursor-snap className="display break-all text-[clamp(1.4rem,3.2vw,3rem)] underline decoration-1 underline-offset-8 hover:decoration-2">
                    {c.email}
                  </a>
                  <Magnetic>
                    <button
                      type="button"
                      onClick={copy}
                      data-cursor-snap
                      className="mono-label inline-flex items-center gap-2 border border-fg px-4 py-3 text-[0.68rem] transition-colors hover:bg-fg hover:text-bg"
                    >
                      {state === "copied" ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                      <span ref={chip} aria-live="polite">
                        {state === "copied" ? t("copied") : state === "failed" ? t("copyFailed") : t("copyEmail")}
                      </span>
                    </button>
                  </Magnetic>
                </>
              ) : (
                <p className="display text-[clamp(1.4rem,3.2vw,3rem)] opacity-50">{t("soon")}</p>
              )}
            </div>
          </div>

          <div className="md:col-span-5 md:col-start-8">
            <p className="mono-label mb-4 text-[0.66rem] text-muted">{t("channels")}</p>
            <ul className="divide-y divide-fg/30 border-y border-fg/30">
              {channels.map((ch) => (
                <li key={ch.id}>
                  {ch.href ? (
                    <a
                      href={ch.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="link"
                      className="group flex items-center justify-between py-4"
                    >
                      <span className="display text-[clamp(1.6rem,3vw,2.6rem)] transition-transform duration-500 group-hover:translate-x-2">{ch.label}</span>
                      <ArrowUpRight aria-hidden="true" size={26} className="transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1" />
                    </a>
                  ) : (
                    <div className="flex items-center justify-between py-4 opacity-45" aria-disabled="true">
                      <span className="display text-[clamp(1.6rem,3vw,2.6rem)]">{ch.label}</span>
                      <span className="mono-label text-[0.62rem]">{t("soon")}</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
