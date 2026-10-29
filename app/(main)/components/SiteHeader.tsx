"use client";

import { ReactNode, useEffect, useRef } from "react";

/**
 * Sticky site header (topbar + navbar) that stays above page content and
 * overlays. Publishes its live height as --site-header-h so fixed overlays
 * (modals, lightbox) can start below it instead of covering it.
 */
export default function SiteHeader({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;
    const update = () => root.style.setProperty("--site-header-h", `${el.offsetHeight}px`);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.removeProperty("--site-header-h");
    };
  }, []);

  return (
    <header ref={ref} className="sticky top-0 z-[60]">
      {children}
    </header>
  );
}
