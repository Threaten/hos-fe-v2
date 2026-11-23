// Shared settings for the node tools: this kit's site.conf, the agent's state folder and the keyword list.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** site.conf as an object (KEY="value" lines; $HOME is expanded) */
export const conf = (() => {
  const out = {};
  try {
    for (const line of fs.readFileSync(path.join(KIT, "site.conf"), "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (!m) continue;
      let v = m[2].trim();
      if (/^".*"$/.test(v) || /^'.*'$/.test(v)) v = v.slice(1, -1);
      out[m[1]] = v.replace(/\$HOME|\$\{HOME\}/g, process.env.HOME ?? "");
    }
  } catch {}
  return out;
})();

export const HOME = process.env.SEO_AGENT_HOME || conf.DEFAULT_HOME || path.join(process.env.HOME ?? "", ".seo-agent");
export const STATE = path.join(HOME, "state");
export const SITE_URL = (process.env.SITE_URL || conf.DEFAULT_SITE_URL || "").replace(/\/$/, "");

/** state/<name>, created from the kit's default file the first time it is needed */
export function stateFile(name, defaultName) {
  const file = path.join(STATE, name);
  const fallback = path.join(KIT, defaultName);
  if (!fs.existsSync(file) && fs.existsSync(fallback)) {
    fs.mkdirSync(STATE, { recursive: true });
    fs.copyFileSync(fallback, file);
  }
  return file;
}

/** Target keywords from state/keywords.txt ("#" lines are comments) */
export function keywords() {
  try {
    return fs.readFileSync(stateFile("keywords.txt", "keywords.default.txt"), "utf8")
      .split("\n").map((l) => l.replace(/#.*/, "").trim()).filter(Boolean);
  } catch {
    return [];
  }
}

/** Lower case, no Vietnamese accents, one spelling for Ho Chi Minh City: for matching keywords in page text */
export function fold(text) {
  return String(text)
    .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/\b(tp\.?\s*hcm|tp\.?\s*ho chi minh|thanh pho ho chi minh|ho chi minh city|hcmc|sai gon|saigon)\b/g, "tphcm")
    .replace(/\b(?:district|dist\.?|q\.)\s*(\d{1,2})\b/g, "quan $1")
    .replace(/\s+/g, " ");
}
const LOCATION = /\b(tphcm|ha noi|hanoi|da nang|quan \d+|q\d+)\b/g;

/**
 * How often each target keyword appears in a text: accent variants count as one keyword;
 * "core" is the keyword without its place name ("hoc bartender co ban tphcm" → "hoc bartender co ban").
 */
export function keywordCounts(text, list = keywords()) {
  const body = fold(text);
  const count = (k) => (k ? body.split(k).length - 1 : 0);
  const out = {};
  for (const k of [...new Set(list.map(fold))]) {
    const core = k.replace(LOCATION, "").replace(/\s+/g, " ").trim();
    out[k] = core && core !== k ? `${count(k)} (without place: ${count(core)})` : count(k);
  }
  return out;
}
