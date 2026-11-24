import dictionary from "./vi.json";

/**
 * The Vietnamese version of the site is the English site with every piece of text
 * looked up in `vi.json` ({ "English text": "Vietnamese text" }). The SEO agent keeps
 * the file complete (seo-agent/tools/i18n.mjs lists what is missing); text without a
 * translation stays in English. Keys may hold placeholders: "opens {time}" matches
 * "opens 16:00" and gives "mở cửa lúc {time}" with the value filled in.
 */
export type Lang = "en" | "vi";

const exact = new Map<string, string>();
/** Every key as written, placeholders included, for format() */
const templates = new Map<string, string>();
const patterns: Array<{ re: RegExp; names: string[]; to: string }> = [];

for (const [from, to] of Object.entries(dictionary as Record<string, string>)) {
  if (!to?.trim()) continue;
  templates.set(from, to);
  const names: string[] = [];
  if (/\{\w+\}/.test(from)) {
    const source = from
      .split(/(\{\w+\})/)
      .map((part) => {
        const m = part.match(/^\{(\w+)\}$/);
        if (m) {
          names.push(m[1]);
          return "(.+?)";
        }
        return part.replace(/[.*+?^$()|[\]\\{}]/g, "\\$&");
      })
      .join("");
    patterns.push({ re: new RegExp(`^${source}$`), names, to });
  } else {
    exact.set(normalize(from), to);
  }
}

function normalize(text: string) {
  return text.replace(/\r\n/g, "\n").trim();
}

/** The Vietnamese for an English text, or the text itself when there is none */
export function translate(text: string, lang: Lang = "vi"): string {
  if (lang !== "vi" || !text?.trim()) return text;
  const key = normalize(text);
  const hit = exact.get(key);
  if (hit) return hit;
  for (const p of patterns) {
    const m = key.match(p.re);
    if (m) return p.names.reduce((out, name, i) => out.replaceAll(`{${name}}`, m[i + 1]), p.to);
  }
  return text;
}

/** Text with placeholders filled in: format("opens {time}", { time: "16:00" }, "vi") */
export function format(key: string, values: Record<string, string> = {}, lang: Lang = "en"): string {
  const template = lang === "vi" ? templates.get(key) ?? key : key;
  return Object.entries(values).reduce((out, [k, v]) => out.replaceAll(`{${k}}`, v), template);
}

/** Text fields of a branch that people read; everything else (names, links, numbers) is left alone */
const SKIP = new Set(["id", "name", "domain", "slug", "url", "filename", "mainColor", "status", "openingHours", "address", "phone", "email", "facebook", "instagram", "tiktok", "youtube", "createdAt", "updatedAt", "linkHref", "mimeType", "menuText"]);

/** A copy of a branch (or any CMS object) with every translatable string in Vietnamese */
export function translateDeep<T>(value: T, lang: Lang = "vi"): T {
  if (lang !== "vi" || value == null) return value;
  if (typeof value === "string") return translate(value, lang) as T;
  if (Array.isArray(value)) return value.map((v) => translateDeep(v, lang)) as T;
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = SKIP.has(k) ? v : translateDeep(v, lang);
    }
    return out as T;
  }
  return value;
}

/** "/vi" (and "/tenant/<branch>/vi" in development) is the Vietnamese page */
export function langFromPath(pathname?: string | null): Lang {
  return /(^|\/)vi\/?$/.test(pathname ?? "") ? "vi" : "en";
}
