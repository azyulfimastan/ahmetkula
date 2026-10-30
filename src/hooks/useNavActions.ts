"use client";

import { useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { useTransition } from "@/components/layout/PageTransition";
import { useSite } from "@/components/layout/SiteProvider";
import { scrollToTarget, type SectionId } from "@/lib/scroll";

let queued: SectionId | null = null;
export const queueSection = (id: SectionId | null) => {
  queued = id;
};
export const takeQueuedSection = () => {
  const v = queued;
  queued = null;
  return v;
};

/** Bölüme git / sayfalar arası geçiş / dil değiştirme gibi ortak gezinme eylemleri. */
export function useNavActions() {
  const pathname = usePathname();
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const { navigate } = useTransition();
  const { setMenuOpen } = useSite();

  const goSection = useCallback(
    (id: SectionId) => {
      setMenuOpen(false);
      if (pathname === "/") {
        scrollToTarget(id === "hero" ? 0 : `#${id}`);
        history.replaceState(null, "", `${location.pathname}${id === "hero" ? "" : `#${id}`}`);
      } else {
        queueSection(id);
        navigate("/", { label: id === "hero" ? "AK" : t(`nav.${id === "work" ? "work" : id}`) });
      }
    },
    [pathname, navigate, setMenuOpen, t],
  );

  const goProjects = useCallback(() => {
    setMenuOpen(false);
    navigate("/projects", { label: t("projects.title") });
  }, [navigate, setMenuOpen, t]);

  const goProject = useCallback(
    (slug: string, title: string) => {
      setMenuOpen(false);
      navigate(`/projects/${slug}`, { label: title });
    },
    [navigate, setMenuOpen],
  );

  const otherLocale = routing.locales.find((l) => l !== locale) as Locale;

  const switchLocale = useCallback(
    (next: Locale = otherLocale) => {
      setMenuOpen(false);
      if (next === locale) return;
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      navigate(`${pathname}${hash}`, { locale: next, label: next === "tr" ? "TÜRKÇE" : "ENGLISH" });
    },
    [locale, otherLocale, pathname, navigate, setMenuOpen],
  );

  return { goSection, goProjects, goProject, switchLocale, otherLocale, locale, pathname };
}
