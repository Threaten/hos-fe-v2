"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * Re-keys on route change so each page fades and rises in (styles in globals.css).
 * A page and its Vietnamese version (/vi) share a key: switching language swaps the
 * words in place, with no animation, reloaded photos or reopened pop-up.
 */
export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const page = pathname.replace(/\/vi\/?$/, "") || "/";
  return (
    <div key={page} className="hos-page-enter">
      {children}
    </div>
  );
}
