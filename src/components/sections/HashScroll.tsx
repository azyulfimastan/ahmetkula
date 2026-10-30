"use client";

import { useEffect } from "react";
import { useSite } from "@/components/layout/SiteProvider";
import { takeQueuedSection } from "@/hooks/useNavActions";
import { scrollToTarget, SECTION_IDS, type SectionId } from "@/lib/scroll";

/** Başka sayfadan bir bölüme gelindiğinde veya URL'de #hash varsa, intro bitince oraya kaydırır. */
export function HashScroll() {
  const { introDone } = useSite();

  useEffect(() => {
    if (!introDone) return;
    const queued = takeQueuedSection();
    const hash = window.location.hash.replace("#", "") as SectionId;
    const id = queued ?? (SECTION_IDS.includes(hash) ? hash : null);
    if (!id || id === "hero") return;
    const timer = window.setTimeout(() => scrollToTarget(`#${id}`), 450);
    return () => window.clearTimeout(timer);
  }, [introDone]);

  return null;
}
