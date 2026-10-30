"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { PaletteName, Theme } from "@/lib/tones";

type Toast = { id: number; message: string };

type SiteState = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => Theme;
  palette: PaletteName;
  togglePalette: () => PaletteName;
  terminalOpen: boolean;
  setTerminalOpen: (v: boolean) => void;
  paletteOpen: boolean;
  setPaletteOpen: (v: boolean) => void;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  introDone: boolean;
  setIntroDone: (v: boolean) => void;
  devMode: boolean;
  setDevMode: (v: boolean) => void;
  toasts: Toast[];
  toast: (message: string) => void;
  konamiAt: number;
  fireKonami: () => void;
};

const Ctx = createContext<SiteState | null>(null);

export function useSite() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSite must be used inside <SiteProvider>");
  return v;
}

function readStored<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    if (v && (allowed as readonly string[]).includes(v)) return v as T;
  } catch {
    /* depolama kapalı olabilir */
  }
  return fallback;
}

export function SiteProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("forest");
  const [palette, setPalette] = useState<PaletteName>("default");
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [devMode, setDevModeState] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [konamiAt, setKonamiAt] = useState(0);
  const toastId = useRef(0);
  const devTimer = useRef<number | null>(null);
  const themeRef = useRef<Theme>("forest");
  const paletteRef = useRef<PaletteName>("default");

  // Kayıtlı tercihleri yükle (html attribute'ları inline script ile zaten ayarlandı).
  useEffect(() => {
    const t = readStored<Theme>("ak-theme", ["forest", "ivory"], "forest");
    const p = readStored<PaletteName>("ak-palette", ["default", "alt"], "default");
    themeRef.current = t;
    paletteRef.current = p;
    setThemeState(t);
    setPalette(p);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  useEffect(() => {
    document.documentElement.dataset.palette = palette;
  }, [palette]);
  useEffect(() => {
    document.documentElement.dataset.dev = devMode ? "true" : "false";
  }, [devMode]);

  const setTheme = useCallback((t: Theme) => {
    themeRef.current = t;
    setThemeState(t);
    try {
      localStorage.setItem("ak-theme", t);
    } catch {
      /* yok say */
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const next: Theme = themeRef.current === "forest" ? "ivory" : "forest";
    setTheme(next);
    return next;
  }, [setTheme]);

  const togglePalette = useCallback(() => {
    const next: PaletteName = paletteRef.current === "default" ? "alt" : "default";
    paletteRef.current = next;
    setPalette(next);
    try {
      localStorage.setItem("ak-palette", next);
    } catch {
      /* yok say */
    }
    return next;
  }, []);

  const toast = useCallback((message: string) => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-2), { id, message }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
  }, []);

  const setDevMode = useCallback((v: boolean) => {
    if (devTimer.current) window.clearTimeout(devTimer.current);
    setDevModeState(v);
    if (v) devTimer.current = window.setTimeout(() => setDevModeState(false), 8000);
  }, []);

  const fireKonami = useCallback(() => setKonamiAt(Date.now()), []);

  // Menü / terminal / palet açıkken arka plan kaydırmasını Lenis'e bırakma
  const overlayOpen = menuOpen || terminalOpen || paletteOpen;
  useEffect(() => {
    document.documentElement.classList.toggle("lenis-stopped", overlayOpen);
    return () => document.documentElement.classList.remove("lenis-stopped");
  }, [overlayOpen]);

  const value = useMemo<SiteState>(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      palette,
      togglePalette,
      terminalOpen,
      setTerminalOpen,
      paletteOpen,
      setPaletteOpen,
      menuOpen,
      setMenuOpen,
      introDone,
      setIntroDone,
      devMode,
      setDevMode,
      toasts,
      toast,
      konamiAt,
      fireKonami,
    }),
    [theme, setTheme, toggleTheme, palette, togglePalette, terminalOpen, paletteOpen, menuOpen, introDone, devMode, setDevMode, toasts, toast, konamiAt, fireKonami],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
