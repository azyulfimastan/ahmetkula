"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { gsap } from "gsap";
import { X } from "lucide-react";
import { useSite } from "@/components/layout/SiteProvider";
import { useNavActions } from "@/hooks/useNavActions";
import { projects } from "@/data/projects";
import { tech, techCategories } from "@/data/tech";
import { siteConfig } from "@/config/site";
import { useReducedMotion } from "@/hooks/useMedia";
import type { Locale } from "@/i18n/routing";

type Line = { id: number; kind: "in" | "out" | "err"; text: string };

const VISIBLE = ["help", "about", "projects", "skills", "contact", "github", "whoami", "date", "theme", "play", "clear", "exit"];
const ALL = [...VISIBLE, "devmode", "lang"];

/**
 * Gizli terminal. Gerçek sistem komutu ÇALIŞTIRMAZ; yalnızca aşağıda tanımlı
 * güvenli komutları destekler.
 */
export function Terminal() {
  const { terminalOpen, setTerminalOpen, toggleTheme, setDevMode, devMode } = useSite();
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const { goSection, switchLocale } = useNavActions();
  const reduce = useReducedMotion();
  const [lines, setLines] = useState<Line[]>([]);
  const [value, setValue] = useState("");
  const history = useRef<string[]>([]);
  const hIndex = useRef(-1);
  const idRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const push = useCallback((kind: Line["kind"], text: string) => {
    setLines((l) => [...l, { id: ++idRef.current, kind, text }].slice(-300));
  }, []);

  // Açılış: hoş geldin satırı, odak ve animasyon
  useEffect(() => {
    if (!terminalOpen) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    setLines((l) => (l.length === 0 ? [{ id: ++idRef.current, kind: "out", text: t("terminal.welcome") }] : l));
    if (panel.current && !reduce) {
      gsap.fromTo(panel.current, { y: 40, autoAlpha: 0, scale: 0.97 }, { y: 0, autoAlpha: 1, scale: 1, duration: 0.45, ease: "expo.out" });
    }
    const id = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      window.clearTimeout(id);
      returnFocus.current?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terminalOpen]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [lines]);

  const run = useCallback(
    (raw: string) => {
      const input = raw.trim();
      push("in", input);
      if (!input) return;
      history.current.push(input);
      hIndex.current = -1;
      const [cmd, ...args] = input.split(/\s+/);
      const name = cmd.toLowerCase();

      switch (name) {
        case "help": {
          const rows = t.raw("terminal.help") as string[][];
          push("out", rows.map(([c, d]) => `${c.padEnd(10)} ${d}`).join("\n"));
          break;
        }
        case "about":
          push("out", t("terminal.about"));
          break;
        case "projects":
          push(
            "out",
            `${t("terminal.projectsHeader")}\n` +
              projects
                .map((p) => `${p.index}  ${p.title}${p.sample ? ` [${t("work.sample")}]` : ""}\n    ${p.tagline[locale]}`)
                .join("\n"),
          );
          break;
        case "skills": {
          const out = techCategories
            .map((c) => {
              const items = tech.filter((x) => x.category === c).map((x) => x.label);
              return items.length ? `${t(`toolbox.categories.${c}`)}: ${items.join(", ")}` : null;
            })
            .filter(Boolean)
            .join("\n");
          push("out", `${t("terminal.skillsHeader")}\n${out}`);
          break;
        }
        case "contact": {
          const c = siteConfig.contact;
          const none = t("terminal.contactNone");
          const extra = c.other.map((o) => `${o.label}: ${o.href}`);
          push(
            "out",
            [`${t("terminal.contactHeader")}`, `email    ${c.email || none}`, `github   ${c.github || none}`, `linkedin ${c.linkedin || none}`, ...extra].join("\n"),
          );
          break;
        }
        case "github":
          if (siteConfig.contact.github) {
            push("out", t("terminal.githubOpen"));
            window.open(siteConfig.contact.github, "_blank", "noopener,noreferrer");
          } else {
            push("err", t("terminal.githubNone"));
          }
          break;
        case "whoami": {
          const arr = t.raw("terminal.whoami") as string[];
          push("out", arr[Math.floor(Math.random() * arr.length)]);
          break;
        }
        case "date":
          push(
            "out",
            new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", {
              dateStyle: "full",
              timeStyle: "medium",
              timeZone: siteConfig.timeZone,
            }).format(new Date()),
          );
          break;
        case "theme": {
          const next = toggleTheme();
          push("out", t("terminal.theme", { name: t(`theme.${next}`) }));
          break;
        }
        case "play":
          push("out", t("terminal.play"));
          window.setTimeout(() => {
            setTerminalOpen(false);
            goSection("playground");
          }, 350);
          break;
        case "clear":
          setLines([]);
          break;
        case "exit":
          push("out", t("terminal.exit"));
          window.setTimeout(() => setTerminalOpen(false), 350);
          break;
        case "devmode":
          setDevMode(!devMode);
          push("out", t(devMode ? "terminal.devOff" : "terminal.devOn"));
          break;
        case "lang": {
          const target = args[0]?.toLowerCase();
          if (target === "tr" || target === "en") {
            push("out", t("terminal.lang", { name: target.toUpperCase() }));
            window.setTimeout(() => {
              setTerminalOpen(false);
              switchLocale(target);
            }, 350);
          } else push("err", t("terminal.unknownLang"));
          break;
        }
        case "sudo":
        case "rm":
        case "ls":
        case "cd":
          push("out", t("terminal.sudo"));
          break;
        default:
          push("err", t("terminal.notFound", { cmd: name }));
      }
    },
    [push, t, locale, toggleTheme, setTerminalOpen, goSection, setDevMode, devMode, switchLocale],
  );

  const complete = useMemo(
    () => (v: string) => {
      const q = v.trim().toLowerCase();
      if (!q || q.includes(" ")) return v;
      const matches = ALL.filter((c) => c.startsWith(q));
      return matches.length === 1 ? matches[0] : v;
    },
    [],
  );

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      run(value);
      setValue("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const h = history.current;
      if (h.length === 0) return;
      hIndex.current = hIndex.current === -1 ? h.length - 1 : Math.max(0, hIndex.current - 1);
      setValue(h[hIndex.current]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const h = history.current;
      if (hIndex.current === -1) return;
      hIndex.current += 1;
      if (hIndex.current >= h.length) {
        hIndex.current = -1;
        setValue("");
      } else setValue(h[hIndex.current]);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const c = complete(value);
      if (c !== value) setValue(c);
      else {
        const q = value.trim().toLowerCase();
        const m = ALL.filter((x) => x.startsWith(q));
        if (q && m.length > 1) push("out", m.join("  "));
      }
    } else if (e.key === "Escape") {
      setTerminalOpen(false);
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  if (!terminalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 p-3 sm:items-center sm:p-6"
      onMouseDown={(e) => e.target === e.currentTarget && setTerminalOpen(false)}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={t("terminal.title")}
        className="flex h-[min(78svh,34rem)] w-full max-w-3xl flex-col overflow-hidden border border-[#EDE9DF]/20 bg-[#0B1613] text-[#EDE9DF] shadow-2xl"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <div className="flex items-center justify-between border-b border-[#EDE9DF]/15 px-4 py-2.5">
          <span className="text-[0.78rem] text-[#D6F46A]">{t("terminal.title")}</span>
          <button
            type="button"
            onClick={() => setTerminalOpen(false)}
            aria-label={t("terminal.close")}
            className="grid h-7 w-7 place-items-center text-[#8E948C] hover:text-[#FF6542]"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div
          ref={scroller}
          data-lenis-prevent
          className="flex-1 overflow-y-auto px-4 py-3 text-[0.8rem] leading-relaxed"
          onClick={() => inputRef.current?.focus()}
          role="log"
          aria-live="polite"
        >
          {lines.map((l) => (
            <div
              key={l.id}
              className={`whitespace-pre-wrap break-words ${l.kind === "err" ? "text-[#FF6542]" : l.kind === "in" ? "text-[#D6F46A]" : "text-[#EDE9DF]/90"}`}
            >
              {l.kind === "in" ? `$ ${l.text}` : l.text}
            </div>
          ))}
        </div>

        <label className="flex items-center gap-2 border-t border-[#EDE9DF]/15 px-4 py-3 text-[0.82rem]">
          <span aria-hidden="true" className="text-[#D6F46A]">$</span>
          <span className="sr-only">{t("terminal.inputLabel")}</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKey}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            enterKeyHint="send"
            className="min-w-0 flex-1 bg-transparent text-[#EDE9DF] caret-[#FF6542] outline-none"
            style={{ fontSize: "max(16px, 0.82rem)" }}
          />
        </label>
      </div>
    </div>
  );
}
