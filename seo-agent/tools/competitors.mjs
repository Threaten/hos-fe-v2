#!/usr/bin/env node
// Competitor research: what the pages that rank for our keywords (state/keywords.txt) do, compared with ours.
// It measures structure and signals (length, headings, FAQ, prices, schedules, reviews, schema...);
// it never copies their text into our site. Polite: obeys robots.txt, 2 s between requests,
// re-fetches a page at most once every 6 days.
//
//   node competitors.mjs fetch [--force]   refresh snapshots of every URL in state/competitors.txt
//   node competitors.mjs report            compare with our pages; writes state/competitors/report.md
//   node competitors.mjs page <url>        full extraction of one page (outline, FAQ, signals)
//
// state/competitors.txt: one URL per line, "# comments" allowed.
//   https://example.com/hoc-bartender            a page to track
//   site https://example.com                     homepage + up to 5 relevant pages from its sitemap (site.conf TOPIC_*)
import fs from "node:fs";
import path from "node:path";
import { STATE, SITE_URL, conf, keywords, keywordCounts, stateFile } from "./siteconf.mjs";

const LIST = stateFile("competitors.txt", "competitors.template.txt");
const DIR = path.join(STATE, "competitors");
const OURS = SITE_URL;
// Our pages to compare: state/our-pages.txt if present (one path or URL per line), else site.conf
const OUR_PAGES = (() => {
  try { return fs.readFileSync(path.join(STATE, "our-pages.txt"), "utf8").split("\n").map((l) => l.replace(/#.*/, "").trim()).filter(Boolean); }
  catch { return (conf.OUR_PAGES || "/").split(/\s+/).filter(Boolean); }
})();
const ourUrl = (p) => (/^https?:\/\//.test(p) ? p : OURS + p);
const UA = `Mozilla/5.0 (compatible; SEOResearch/1.0; +${SITE_URL})`;
const MAX_AGE_DAYS = 6;
// Sitemap pages worth studying, from words in their URL (site.conf TOPIC_*)
const toRe = (v) => (v ? new RegExp(v, "i") : null);
const [STRONG, MEDIUM, EXCLUDE] = [toRe(conf.TOPIC_STRONG), toRe(conf.TOPIC_MEDIUM), toRe(conf.TOPIC_EXCLUDE)];
const score = (u) => {
  const t = decodeURIComponent(u).toLowerCase();
  if (EXCLUDE?.test(t) && !STRONG?.test(t)) return 0;
  return (STRONG?.test(t) ? 3 : 0) + (MEDIUM?.test(t) ? 2 : 0) + (/hoc-|khoa-hoc|dao-tao|menu|thuc-don/.test(t) ? 1 : 0);
};
const KEYWORDS = keywords().slice(0, 12);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const decode = (s) =>
  s.replace(/&nbsp;|&#160;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;|&#x27;|&apos;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
const text = (html) => decode(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const clean = (u) => {
  const url = new URL(u);
  for (const k of [...url.searchParams.keys()]) if (/^(utm_|gad_|gbraid|gclid|fbclid|wbraid)/.test(k)) url.searchParams.delete(k);
  url.hash = "";
  return url.toString();
};
const slug = (u) => clean(u).replace(/^https?:\/\//, "").replace(/[^a-z0-9]+/gi, "_").slice(0, 120);

// ---------- polite fetching
const robotsCache = new Map();
async function allowed(u) {
  const { origin, pathname, search } = new URL(u);
  if (!robotsCache.has(origin)) {
    let rules = [];
    try {
      const res = await fetch(`${origin}/robots.txt`, { headers: { "user-agent": UA }, signal: AbortSignal.timeout(15000) });
      if (res.ok) {
        let applies = false, seenRule = false;
        for (const raw of (await res.text()).split("\n")) {
          const line = raw.replace(/#.*/, "").trim();
          const m = line.match(/^(user-agent|allow|disallow)\s*:\s*(.*)$/i);
          if (!m) continue;
          const [, field, value] = m;
          if (/user-agent/i.test(field)) {
            if (seenRule) { applies = false; seenRule = false; }
            if (value === "*" || /skillmix/i.test(value)) applies = true;
          } else {
            seenRule = true;
            if (applies && value) rules.push({ allow: /^allow/i.test(field), path: value });
          }
        }
      }
    } catch {}
    robotsCache.set(origin, rules);
  }
  const target = pathname + search;
  const toRe = (p) => new RegExp("^" + p.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\\\$$/, "$"));
  let best = null;
  for (const r of robotsCache.get(origin)) if (toRe(r.path).test(target) && (!best || r.path.length > best.path.length)) best = r;
  return !best || best.allow;
}

let lastRequest = 0;
async function get(u) {
  const wait = lastRequest + 2000 - Date.now();
  if (wait > 0) await sleep(wait);
  lastRequest = Date.now();
  const started = Date.now();
  const res = await fetch(u, { headers: { "user-agent": UA, "accept-language": "vi-VN,vi;q=0.9" }, redirect: "follow", signal: AbortSignal.timeout(40000) });
  const body = (await res.text()).slice(0, 3_000_000);
  return { status: res.status, finalUrl: res.url, ms: Date.now() - started, html: body };
}

// ---------- extraction
function jsonLd(html) {
  const out = { types: new Set(), faq: [], rating: null, prices: [] };
  const visit = (node) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(visit);
    const t = node["@type"];
    [].concat(t || []).forEach((x) => out.types.add(String(x)));
    if ([].concat(t || []).includes("FAQPage")) for (const q of [].concat(node.mainEntity || [])) if (q?.name) out.faq.push(text(String(q.name)));
    if (node.aggregateRating?.ratingValue) out.rating = { value: node.aggregateRating.ratingValue, count: node.aggregateRating.reviewCount || node.aggregateRating.ratingCount };
    if (node.price || node.lowPrice) out.prices.push(`${node.price || node.lowPrice} ${node.priceCurrency || ""}`.trim());
    for (const v of Object.values(node)) if (v && typeof v === "object") visit(v);
  };
  for (const m of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try { visit(JSON.parse(m[1].trim())); } catch {}
  }
  return { ...out, types: [...out.types] };
}

function extract(html, url) {
  const ld = jsonLd(html);
  const stripped = html.replace(/<(script|style|noscript|svg|template)[\s\S]*?<\/\1>/gi, " ").replace(/<!--[\s\S]*?-->/g, " ");
  const mainMatch = stripped.match(/<main[\s\S]*?<\/main>/i) || stripped.match(/<article[\s\S]*?<\/article>/i);
  const main = (mainMatch ? mainMatch[0] : stripped.replace(/<(header|footer|nav|aside)[\s\S]*?<\/\1>/gi, " "));
  const body = text(main);
  const lower = body.toLowerCase();
  const headings = [...main.matchAll(/<h([1-3])[^>]*>([\s\S]*?)<\/h\1>/gi)]
    .map((m) => ({ level: Number(m[1]), text: text(m[2]).slice(0, 140) }))
    .filter((h, i, all) => h.text && all.findIndex((x) => x.text === h.text) === i);
  const imgs = [...main.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const host = new URL(url).hostname.replace(/^www\./, "");
  const links = [...main.matchAll(/<a\b[^>]*href="([^"#]+)"/gi)].map((m) => m[1]);
  const internal = links.filter((l) => l.startsWith("/") || l.includes(host)).length;
  const samples = (re, n = 4) => [...new Set([...lower.matchAll(re)].map((m) => m[0].trim()))].slice(0, n);
  const questionHeadings = headings.filter((h) => /\?\s*$/.test(h.text)).map((h) => h.text);
  return {
    title: decode((html.match(/<title[^>]*>([^<]*)/i) || [])[1] || "").trim(),
    description: decode((html.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)/i) || html.match(/<meta[^>]+content=["']([^"']*)["'][^>]*name=["']description["']/i) || [])[1] || ""),
    words: body.split(" ").filter(Boolean).length,
    headings,
    faq: [...new Set([...ld.faq, ...questionHeadings])].slice(0, 25),
    schema: ld.types,
    rating: ld.rating,
    signals: {
      prices: [...ld.prices, ...samples(/\b\d{1,3}(?:[.,]\d{3})+\s*(?:đ|₫|vnđ|vnd)|\b\d+(?:[.,]\d+)?\s*(?:triệu|tr)\b|\b\d{3,}\s*k\b/g)],
      durations: samples(/\b\d+\s*(?:buổi|tuần|tháng|giờ)\b/g),
      schedule: samples(/lịch khai giảng|khai giảng[^.]{0,40}|ca sáng|ca chiều|ca tối|thứ\s*[2-7][^.]{0,25}/g, 3),
      certificate: /chứng chỉ|chứng nhận|bằng nghề/.test(lower),
      jobs: /việc làm|giới thiệu việc|cam kết (?:việc|đầu ra)|hỗ trợ việc/.test(lower),
      trialOrConsult: /học thử|tư vấn miễn phí|học miễn phí/.test(lower),
      recipes: samples(/\b\d+\+?\s*(?:món|công thức|loại cocktail|ly)\b/g, 3),
      testimonials: /cảm nhận|học viên nói|đánh giá của học viên|review/.test(lower),
      contact: { phone: /\b0\d{9}\b|\b0\d{2,3}[ .]\d{3}[ .]\d{3,4}\b|hotline/.test(lower), zalo: /zalo/.test(lower) },
    },
    media: {
      images: imgs.length,
      imagesWithAlt: imgs.filter((i) => /\balt=["'][^"']+["']/.test(i)).length,
      videos: (main.match(/youtube\.com\/embed|youtu\.be|<video\b|tiktok\.com\/embed/gi) || []).length,
      forms: (main.match(/<form\b/gi) || []).length,
    },
    links: { internal, external: links.length - internal },
    keywords: keywordCounts(body, KEYWORDS),
  };
}

// ---------- list handling
async function sitemapPages(site) {
  const origin = new URL(site).origin;
  const locs = async (u) => {
    try { const r = await get(u); return r.status === 200 ? [...r.html.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => decode(m[1])) : []; }
    catch { return []; }
  };
  let urls = await locs(`${origin}/sitemap.xml`);
  if (!urls.length) urls = await locs(`${origin}/sitemap_index.xml`);
  const nested = urls.filter((u) => /\.xml(\?|$)/.test(u));
  if (nested.length) {
    const pick = nested.filter((u) => /post|page|course|khoa|product/i.test(u)).slice(0, 4);
    urls = (await Promise.all((pick.length ? pick : nested.slice(0, 3)).map(locs))).flat();
  }
  const relevant = urls.map((u) => [u, score(u)]).filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).map(([u]) => u);
  return [origin + "/", ...relevant.slice(0, 5)];
}
async function targets() {
  if (!fs.existsSync(LIST)) { console.log(`No ${LIST}: add competitor URLs there, one per line.`); process.exit(0); }
  const out = [];
  for (const raw of fs.readFileSync(LIST, "utf8").split("\n")) {
    const line = raw.replace(/#.*/, "").trim();
    if (!line) continue;
    const site = line.match(/^site\s+(\S+)/i);
    if (site) out.push(...(await sitemapPages(site[1])));
    else if (/^https?:\/\//.test(line)) out.push(line.split(/\s+/)[0]);
  }
  return [...new Set(out.map(clean))];
}
const snapFile = (u) => path.join(DIR, `${slug(u)}.json`);
const readSnap = (u) => { try { return JSON.parse(fs.readFileSync(snapFile(u), "utf8")); } catch { return null; } };

// ---------- commands
async function cmdFetch(force) {
  fs.mkdirSync(DIR, { recursive: true });
  const list = await targets();
  let fresh = 0, skipped = 0, failed = 0;
  for (const u of list) {
    const old = readSnap(u);
    if (!force && old?.fetchedAt && Date.now() - Date.parse(old.fetchedAt) < MAX_AGE_DAYS * 864e5) { skipped++; continue; }
    if (!(await allowed(u))) { console.log(`robots.txt disallows ${u}: skipped`); continue; }
    try {
      const r = await get(u);
      const snap = { url: u, finalUrl: r.finalUrl, status: r.status, ms: r.ms, fetchedAt: new Date().toISOString(), ...(r.status === 200 ? extract(r.html, r.finalUrl) : {}) };
      if (old?.words && snap.words) snap.change = { wordsBefore: old.words, fetchedBefore: old.fetchedAt };
      fs.writeFileSync(snapFile(u), JSON.stringify(snap, null, 1));
      console.log(`${r.status} ${u}  ${snap.words ?? "-"} words`);
      fresh++;
    } catch (e) {
      console.log(`FAIL ${u}: ${e.message}`);
      failed++;
    }
  }
  console.log(`\n${fresh} fetched, ${skipped} still fresh (< ${MAX_AGE_DAYS} days), ${failed} failed. Next: node competitors.mjs report`);
}

const yes = (b) => (b ? "yes" : "-");
function line(p) {
  if (!p || p.status !== 200) return `  [${p?.status ?? "no data"}]`;
  const s = p.signals, m = p.media;
  return [
    `  ${p.words} words | H2 ${p.headings.filter((h) => h.level === 2).length} | FAQ ${p.faq.length} | schema: ${p.schema.join(",") || "-"}${p.rating ? ` | rating ${p.rating.value} (${p.rating.count ?? "?"})` : ""}`,
    `  price: ${s.prices.slice(0, 3).join(", ") || "-"} | durations: ${s.durations.join(", ") || "-"} | schedule: ${s.schedule.length ? "yes" : "-"} | certificate: ${yes(s.certificate)} | jobs: ${yes(s.jobs)} | trial/consult: ${yes(s.trialOrConsult)} | testimonials: ${yes(s.testimonials)}`,
    `  images ${m.images} (${m.imagesWithAlt} with alt) | videos ${m.videos} | forms ${m.forms} | links in ${p.links.internal}/out ${p.links.external} | recipes: ${s.recipes.join(", ") || "-"}`,
    `  keywords: ${Object.entries(p.keywords).filter(([, n]) => n && n !== "0 (without place: 0)").map(([k, n]) => `${k}: ${n}`).join(" | ") || "-"}`,
  ].join("\n");
}

async function cmdReport() {
  const list = await targets();
  const snaps = list.map(readSnap).filter(Boolean);
  if (!snaps.length) { console.log("No snapshots yet: run  node competitors.mjs fetch"); return; }
  const ours = [];
  for (const p of OUR_PAGES) {
    const u = ourUrl(p);
    try { const r = await get(u); ours.push({ url: u, status: r.status, ...(r.status === 200 ? extract(r.html, u) : {}) }); }
    catch (e) { ours.push({ url: u, status: `error ${e.message}` }); }
  }
  const ok = snaps.filter((s) => s.status === 200);
  const pct = (f) => `${Math.round((100 * ok.filter(f).length) / Math.max(ok.length, 1))}%`;
  const median = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
  const out = [];
  out.push(`# Competitor report ${new Date().toISOString().slice(0, 10)}`, "");
  out.push(`## How competitors compare (${ok.length} pages)`);
  out.push(`- median words: ${median(ok.map((s) => s.words))} (ours: ${ours.filter((o) => o.words).map((o) => `${o.url.replace(OURS, "") || "/"} ${o.words}`).join(", ")})`);
  out.push(`- show a price: ${pct((s) => s.signals.prices.length)} | schedule/intake: ${pct((s) => s.signals.schedule.length)} | certificate: ${pct((s) => s.signals.certificate)} | job support: ${pct((s) => s.signals.jobs)}`);
  out.push(`- FAQ: ${pct((s) => s.faq.length)} | FAQ schema: ${pct((s) => s.schema.includes("FAQPage"))} | Course schema: ${pct((s) => s.schema.includes("Course"))} | rating shown: ${pct((s) => s.rating)} | testimonials: ${pct((s) => s.signals.testimonials)} | video: ${pct((s) => s.media.videos)}`);
  out.push("", "## Our pages");
  for (const o of ours) out.push(`### ${o.url}`, `  T: ${o.title ?? ""}`, line(o), "");
  out.push("## Competitor pages (most words first)");
  for (const s of [...snaps].sort((a, b) => (b.words || 0) - (a.words || 0))) {
    out.push(`### ${s.url}  (fetched ${s.fetchedAt?.slice(0, 10)}${s.change ? `, was ${s.change.wordsBefore} words` : ""})`);
    if (s.status === 200) out.push(`  T: ${s.title}`, `  D: ${s.description}`);
    out.push(line(s));
    if (s.status === 200) {
      out.push("  outline: " + s.headings.filter((h) => h.level <= 3).slice(0, 30).map((h) => `${"#".repeat(h.level)} ${h.text}`).join(" / "));
      if (s.faq.length) out.push("  questions: " + s.faq.slice(0, 15).join(" / "));
    }
    out.push("");
  }
  fs.mkdirSync(DIR, { recursive: true });
  const file = path.join(DIR, "report.md");
  fs.writeFileSync(file, out.join("\n"));
  // Our pages as data too, for the CMS dashboard (sm-be SeoAgentCompetitors), next to the competitor snapshots.
  fs.writeFileSync(path.join(DIR, "ours.json"), JSON.stringify({ generatedAt: new Date().toISOString(), pages: ours }, null, 1));
  console.log(out.slice(0, 6).join("\n"));
  console.log(`\nFull report (outlines, questions, signals per page): ${file}`);
}

const [cmd, arg] = process.argv.slice(2);
if (cmd === "fetch") await cmdFetch(process.argv.includes("--force"));
else if (cmd === "report") await cmdReport();
else if (cmd === "page" && arg) {
  if (!(await allowed(arg))) { console.log("robots.txt disallows this page"); process.exit(0); }
  const r = await get(clean(arg));
  console.log(JSON.stringify({ url: arg, status: r.status, ...(r.status === 200 ? extract(r.html, r.finalUrl) : {}) }, null, 1));
} else {
  console.error("usage: competitors.mjs fetch [--force] | report | page <url>");
  process.exit(2);
}
