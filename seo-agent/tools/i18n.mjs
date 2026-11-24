#!/usr/bin/env node
// The Vietnamese page (/vi) is the English home page with every text looked up in the
// frontend's app/i18n/vi.json ({ "English": "Vietnamese" }). This lists what to translate:
//   node i18n.mjs [<frontend dir>]   (default: the current directory)
// Prints JSON: { file, missing: [...English texts with no translation], stale: [...keys no longer used] }.
// "missing" covers fixed labels in the code (every t("...") call) and the CMS text shown on the
// home page of each branch whose Vietnamese page is switched on.
import fs from "node:fs";
import path from "node:path";
import { conf } from "./siteconf.mjs";

const FE = path.resolve(process.argv[2] || process.cwd());
const FILE = path.join(FE, "app/i18n/vi.json");
const API = (process.env.PAYLOAD_URL || conf.DEFAULT_PAYLOAD_URL || "").replace(/\/$/, "");

if (!fs.existsSync(FILE)) {
  console.error(`No ${FILE}: run this from the frontend folder or pass its path.`);
  process.exit(1);
}
const dict = JSON.parse(fs.readFileSync(FILE, "utf8"));

// Fixed labels: t("...") in the code, plus texts passed to t() through a variable: the menu bar
// (Navbar NAV_LINKS) and the opening status (app/utils/openingStatus.ts)
const ui = new Set(["Home", "About", "Menu", "Contact", "Open now", "Open", "Closed", "We'll be back soon", "until {time}", "opens {time}"]);
const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === "node_modules" || e.name.startsWith(".") ? [] : walk(p);
    return /\.(tsx?|jsx?)$/.test(e.name) ? [p] : [];
  });
const CALL = /\bt\(\s*(["'`])((?:\\.|(?!\1)[^\\])*)\1\s*[,)]/g;
for (const file of walk(path.join(FE, "app"))) {
  for (const m of fs.readFileSync(file, "utf8").matchAll(CALL)) {
    if (m[1] === "`" && m[2].includes("${")) continue;
    ui.add(m[2].replace(/\\(["'`\\])/g, "$1"));
  }
}

// CMS text shown on the home page (and its search title/description)
const cms = new Set();
const add = (v) => typeof v === "string" && v.trim() && cms.add(v.replace(/\r\n/g, "\n").trim());
let branches = [];
try {
  const res = await fetch(`${API}/api/tenants?depth=1&limit=100`);
  branches = (await res.json()).docs ?? [];
} catch (e) {
  console.error(`Could not read the branches from ${API}: ${e.message}`);
  process.exit(1);
}
for (const b of branches.filter((b) => b.vi?.enabled)) {
  ["heroSubtitle", "heroDescription", "shortAboutTitle", "shortAboutText", "galleryTitle", "galleryText"].forEach((k) => add(b[k]));
  add(b.topbarNotification?.enabled ? b.topbarNotification.message : null);
  add(b.meta?.title);
  add(b.meta?.description);
  for (const set of b.photoSets ?? []) {
    add(set.title);
    for (const p of set.photos ?? []) {
      add(p?.alt);
      add(p?.caption);
    }
  }
  const g = b.guide ?? {};
  [g.label, g.title, g.intro, g.faqTitle].forEach(add);
  for (const s of g.sections ?? []) [s.heading, s.body, s.linkLabel].forEach(add);
  for (const q of g.faq ?? []) [q.question, q.answer].forEach(add);
}

const needed = new Set([...ui, ...cms]);
const has = (k) => typeof dict[k] === "string" && dict[k].trim();
console.log(
  JSON.stringify(
    {
      file: FILE,
      branches: branches.filter((b) => b.vi?.enabled).map((b) => b.domain),
      missing: [...needed].filter((k) => !has(k)),
      stale: Object.keys(dict).filter((k) => !needed.has(k)),
    },
    null,
    2,
  ),
);
