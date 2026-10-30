"use client";

import { useEffect } from "react";
import { useSite } from "./SiteProvider";

/** Açılış animasyonu kaldırıldı: site doğrudan açılır, giriş durumu hemen "tamam" olur. */
export function Preloader() {
  const { setIntroDone } = useSite();
  useEffect(() => {
    setIntroDone(true);
  }, [setIntroDone]);
  return null;
}
