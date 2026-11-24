"use client";

import type React from "react";
import { useLang } from "./useT";

/** Marks the whole page with its language (the root <html> stays "en") */
export default function LangRoot({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div lang={useLang()} className={className}>
      {children}
    </div>
  );
}
