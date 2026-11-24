"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { format, langFromPath, translate, translateDeep, untranslate, type Lang } from "./translate";

/** The page's language, from its address: "/vi" is Vietnamese, everything else English */
export function useLang(): Lang {
  return langFromPath(usePathname());
}

/** t("Book a table") or t("opens {time}", { time }) in the page's language */
export function useT() {
  const lang = useLang();
  return (key: string, values?: Record<string, string>) => format(key, values, lang);
}

/** A CMS value (a branch, a guide, ...) in the page's language */
export function useTranslated<T>(value: T): T {
  const lang = useLang();
  return useMemo(() => translateDeep(value, lang), [value, lang]);
}

/** The browser tab title in each language, remembered at the first switch */
const titles: Partial<Record<Lang, string>> = {};

/**
 * Switch the home page between English ("/") and Vietnamese ("/vi") without loading a new
 * page: the address changes and every component re-reads its words, so nothing reloads,
 * re-animates or jumps. Elsewhere (or with a modifier key) the link works as a normal link.
 */
export function switchLanguageInPlace(e: React.MouseEvent<HTMLAnchorElement>, to: Lang): void {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const here = window.location.pathname.replace(/\/$/, "");
  const onHome = here === "" || here === "/home" || /\/vi$/.test(here);
  if (!onHome) return;
  e.preventDefault();
  const base = here.replace(/\/(vi|home)$/, "");
  window.history.pushState(null, "", to === "vi" ? `${base}/vi` : base || "/");
  // Both tab titles are remembered here; LangRoot shows the right one once the page has updated
  const from: Lang = to === "vi" ? "en" : "vi";
  titles[from] ??= document.title;
  titles[to] ??= to === "vi" ? translate(document.title, "vi") : untranslate(document.title);
}

/** The tab title for a language, once the visitor has switched language on this page */
export function titleFor(lang: Lang): string | undefined {
  return titles[lang];
}
