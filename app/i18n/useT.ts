"use client";

import { usePathname } from "next/navigation";
import { format, langFromPath, type Lang } from "./translate";

/** The page's language, from its address: "/vi" is Vietnamese, everything else English */
export function useLang(): Lang {
  return langFromPath(usePathname());
}

/** t("Book a table") or t("opens {time}", { time }) in the page's language */
export function useT() {
  const lang = useLang();
  return (key: string, values?: Record<string, string>) => format(key, values, lang);
}
