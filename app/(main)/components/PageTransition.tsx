"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

interface PageTransitionProps {
  children: ReactNode;
}

/** Re-keys on route change so each page fades and rises in (styles in globals.css) */
export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="hos-page-enter">
      {children}
    </div>
  );
}
