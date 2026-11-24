"use client";

import type React from "react";
import { useEffect } from "react";
import { titleFor, useLang } from "./useT";

/** Marks the whole page with its language, and keeps the tab title in it after a switch */
export default function LangRoot({ className, children }: { className?: string; children: React.ReactNode }) {
  const lang = useLang();
  useEffect(() => {
    document.documentElement.lang = lang;
    const title = titleFor(lang);
    if (title) document.title = title;
  }, [lang]);
  return (
    <div lang={lang} className={className}>
      {children}
    </div>
  );
}
