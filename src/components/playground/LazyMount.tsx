"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Çocuğu yalnızca görünür alana yaklaşınca mount eder (modül de o zaman indirilir). */
export function LazyMount({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || show) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [show]);

  return (
    <div ref={ref} className="h-full w-full">
      {show ? children : fallback}
    </div>
  );
}
