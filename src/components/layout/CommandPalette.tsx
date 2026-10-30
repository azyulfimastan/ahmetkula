"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { useSite } from "./SiteProvider";
import { useNavActions } from "@/hooks/useNavActions";
import { siteConfig } from "@/config/site";
import { scrollToTarget } from "@/lib/scroll";

type Item = { id: string; label: string; run: () => void };

/** Ctrl/Cmd + K ile açılan komut paleti. */
export function CommandPalette() {
  const t = useTranslations();
  const { paletteOpen, setPaletteOpen, setTerminalOpen, toggleTheme, toast } = useSite();
  const { goSection, goProjects, switchLocale, pathname } = useNavActions();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const items = useMemo<Item[]>(() => {
    const close = () => setPaletteOpen(false);
    const list: Item[] = [
      { id: "work", label: t("palette.items.work"), run: () => goSection("work") },
      { id: "projectsPage", label: t("palette.items.projectsPage"), run: goProjects },
      { id: "about", label: t("palette.items.about"), run: () => goSection("about") },
      { id: "playground", label: t("palette.items.playground"), run: () => goSection("playground") },
      { id: "contact", label: t("palette.items.contact"), run: () => goSection("contact") },
      { id: "terminal", label: t("palette.items.terminal"), run: () => setTerminalOpen(true) },
      { id: "language", label: t("palette.items.language"), run: () => switchLocale() },
      {
        id: "theme",
        label: t("palette.items.theme"),
        run: () => {
          const next = toggleTheme();
          toast(t("theme.changed", { name: t(`theme.${next}`) }));
        },
      },
      { id: "top", label: t("palette.items.top"), run: () => (pathname === "/" ? goSection("hero") : scrollToTarget(0)) },
    ];
    if (siteConfig.contact.github) {
      list.push({ id: "github", label: t("palette.items.github"), run: () => window.open(siteConfig.contact.github, "_blank", "noopener,noreferrer") });
    }
    return list.map((i) => ({
      ...i,
      run: () => {
        close();
        i.run();
      },
    }));
  }, [t, goSection, goProjects, switchLocale, setTerminalOpen, setPaletteOpen, toggleTheme, toast, pathname]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? items.filter((i) => i.label.toLowerCase().includes(s)) : items;
  }, [items, q]);

  useEffect(() => {
    if (!paletteOpen) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    setQ("");
    setActive(0);
    const id = window.setTimeout(() => input.current?.focus(), 20);
    return () => {
      window.clearTimeout(id);
      returnFocus.current?.focus?.();
    };
  }, [paletteOpen]);

  useEffect(() => setActive(0), [q]);

  if (!paletteOpen) return null;

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (filtered.length ? (a + 1) % filtered.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (filtered.length ? (a - 1 + filtered.length) % filtered.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[active]?.run();
    } else if (e.key === "Escape") {
      setPaletteOpen(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center bg-black/55 p-4 pt-[14svh]"
      onMouseDown={(e) => e.target === e.currentTarget && setPaletteOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("palette.label")}
        className="w-full max-w-xl overflow-hidden border border-[#EDE9DF]/20 bg-[#0B1613] text-[#EDE9DF] shadow-2xl"
      >
        <input
          ref={input}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKey}
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-list"
          aria-activedescendant={filtered[active] ? `pal-${filtered[active].id}` : undefined}
          aria-label={t("palette.label")}
          placeholder={t("palette.placeholder")}
          className="w-full border-b border-[#EDE9DF]/15 bg-transparent px-5 py-4 text-[#EDE9DF] caret-[#FF6542] outline-none placeholder:text-[#8E948C]"
          style={{ fontFamily: "var(--font-mono)", fontSize: "max(16px, 0.9rem)" }}
        />
        <ul id="palette-list" role="listbox" data-lenis-prevent className="max-h-[50svh] overflow-y-auto py-2">
          {filtered.length === 0 && <li className="px-5 py-4 text-sm text-[#8E948C]">{t("palette.empty")}</li>}
          {filtered.map((i, idx) => (
            <li
              key={i.id}
              id={`pal-${i.id}`}
              role="option"
              aria-selected={idx === active}
              onMouseEnter={() => setActive(idx)}
              onClick={i.run}
              className={`cursor-pointer px-5 py-2.5 text-sm ${idx === active ? "bg-[#D6F46A] text-[#101F1C]" : ""}`}
            >
              {i.label}
            </li>
          ))}
        </ul>
        <div className="mono-label border-t border-[#EDE9DF]/15 px-5 py-2 text-[0.62rem] text-[#8E948C]">{t("palette.hint")}</div>
      </div>
    </div>
  );
}
