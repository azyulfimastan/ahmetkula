"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import { usePathname as useRawPathname } from "next/navigation";
import { useLocale } from "next-intl";
import { gsap } from "gsap";
import { useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { useReducedMotion } from "@/hooks/useMedia";

type NavOptions = { label?: string; locale?: Locale; replace?: boolean };

type Ctx = {
  navigate: (href: string, opts?: NavOptions) => void;
};

const TransitionCtx = createContext<Ctx | null>(null);

export function useTransition() {
  const v = useContext(TransitionCtx);
  if (!v) throw new Error("useTransition must be used inside <PageTransitionProvider>");
  return v;
}

/** Sinematik perde geçişi: altı tipografik etiketli kapanır, yeni sayfa yüklenince açılır. */
export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const raw = useRawPathname();
  const reduce = useReducedMotion();
  const veil = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLSpanElement>(null);
  const pending = useRef(false);
  const fallback = useRef<number | null>(null);
  const busy = useRef(false);

  const reveal = useCallback(() => {
    const el = veil.current;
    if (!el || !pending.current) return;
    pending.current = false;
    if (fallback.current) window.clearTimeout(fallback.current);
    gsap.to(el, {
      clipPath: "inset(0% 0% 100% 0%)",
      duration: 0.8,
      ease: "power4.inOut",
      delay: 0.1,
      onComplete: () => {
        el.style.visibility = "hidden";
        busy.current = false;
      },
    });
    if (text.current) gsap.to(text.current, { yPercent: -110, duration: 0.5, ease: "power3.in" });
  }, []);

  // Rota değişti → perdeyi aç
  useEffect(() => {
    if (pending.current) {
      const id = window.setTimeout(reveal, 120);
      return () => window.clearTimeout(id);
    }
  }, [raw, reveal]);

  const navigate = useCallback(
    (href: string, opts: NavOptions = {}) => {
      const go = () => {
        if (opts.replace || opts.locale) router.replace(href, { locale: opts.locale });
        else router.push(href);
      };
      const el = veil.current;
      if (reduce || !el || busy.current) {
        go();
        return;
      }
      busy.current = true;
      pending.current = true;
      if (text.current) text.current.textContent = opts.label ?? "";
      el.style.visibility = "visible";
      gsap.set(el, { clipPath: "inset(100% 0% 0% 0%)" });
      if (text.current) gsap.set(text.current, { yPercent: 110 });
      gsap
        .timeline({ onComplete: go })
        .to(el, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.65, ease: "power4.inOut" })
        .to(text.current, { yPercent: 0, duration: 0.5, ease: "power3.out" }, "-=0.25");
      // Rota aynı kalırsa (ör. sadece hash) perdenin takılı kalmasını önle
      fallback.current = window.setTimeout(reveal, 2600);
    },
    [reduce, router, reveal],
  );

  const value = useMemo(() => ({ navigate }), [navigate]);

  return (
    <TransitionCtx.Provider value={value}>
      {children}
      <div
        ref={veil}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[110] flex items-center justify-center overflow-hidden bg-coral text-forest"
        style={{ visibility: "hidden", clipPath: "inset(100% 0% 0% 0%)" }}
      >
        <span className="mask-line px-6">
          <span
            ref={text}
            className="display mask-inner block text-center text-[clamp(2.5rem,12vw,10rem)]"
          />
        </span>
      </div>
    </TransitionCtx.Provider>
  );
}

type TLProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  label?: string;
  children: ReactNode;
};

/** Sayfa geçişli iç bağlantı. Gerçek <a> olduğu için sağ tık / yeni sekme çalışır. */
export function TransitionLink({ href, label, children, onClick, ...rest }: TLProps) {
  const { navigate } = useTransition();
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    navigate(href, { label });
  };
  const locale = useLocale();
  return (
    <a href={`/${locale}${href === "/" ? "" : href}`} onClick={handle} {...rest}>
      {children}
    </a>
  );
}
