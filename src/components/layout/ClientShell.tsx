"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { SiteProvider } from "./SiteProvider";
import { PageTransitionProvider } from "./PageTransition";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { ToneSync } from "@/components/motion/ToneSync";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { Cursor } from "./Cursor";
import { Preloader } from "./Preloader";
import { Header } from "./Header";
import { Toasts } from "./Toasts";
import { CommandPalette } from "./CommandPalette";
import { Terminal } from "@/components/terminal/Terminal";
import { DevGrid, GlobalKeys, KonamiOverlay } from "./EasterEggs";

function Inner({ children }: { children: ReactNode }) {
  const t = useTranslations("a11y");
  return (
    <>
      <a href="#main" className="skip-link">
        {t("skip")}
      </a>
      <SmoothScroll />
      <ToneSync />
      <GlobalKeys />
      <Header />
      <div id="main" tabIndex={-1} className="outline-none">
        {children}
      </div>
      <ScrollProgress />
      <div className="grain" aria-hidden="true" />
      <CommandPalette />
      <Terminal />
      <KonamiOverlay />
      <DevGrid />
      <Toasts />
      <Cursor />
      <Preloader />
    </>
  );
}

export function ClientShell({ children }: { children: ReactNode }) {
  return (
    <SiteProvider>
      <PageTransitionProvider>
        <Inner>{children}</Inner>
      </PageTransitionProvider>
    </SiteProvider>
  );
}
