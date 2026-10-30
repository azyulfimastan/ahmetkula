"use client";

import { useSyncExternalStore } from "react";

function useMedia(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export function useReducedMotion() {
  return useMedia("(prefers-reduced-motion: reduce)");
}
export function useFinePointer() {
  return useMedia("(hover: hover) and (pointer: fine)");
}
export function useDesktop() {
  return useMedia("(min-width: 1024px)");
}
export function useForcedColors() {
  return useMedia("(forced-colors: active)");
}
