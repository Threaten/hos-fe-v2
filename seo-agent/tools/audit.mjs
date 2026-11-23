#!/usr/bin/env node
// On-page SEO snapshot of the live site, one line per URL in the sitemap.
// Usage: node audit.mjs [https://site]          whole site (default: SITE in site.conf)
//        node audit.mjs page https://site/x     one page in detail
// Keyword counts use state/keywords.txt.
import { SITE_URL, keywords, keywordCounts } from "./siteconf.mjs";
const KEYWORDS = keywords();

const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
const strip = (s) => decode(s.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

async function inspect(url) {
  const started = Date.now();
  const res = await fetch(url, { redirect: "manual", headers: { "user-agent": "SEOAgent/1.0" } });
  const html = await res.text();
  const clean = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, "");
  const main = (clean.match(/<main[\s\S]*?<\/main>/) ?? [clean])[0];
  const body = strip(main).toLowerCase();
  const imgs = [...clean.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  const ld = [...html.matchAll(/"@type":\s*(\[[^\]]*\]|"[^"]+")/g)].map((m) => m[1].replace(/["[\]]/g, ""));
  return {
    url,
    status: res.status,
    ms: Date.now() - started,
    title: decode((html.match(/<title>([^<]*)/) ?? [])[1] ?? ""),
    description: decode((html.match(/<meta name="description" content="([^"]*)/) ?? [])[1] ?? ""),
    canonical: (html.match(/<link rel="canonical" href="([^"]*)/) ?? [])[1] ?? "",
    noindex: /<meta name="robots" content="[^"]*noindex/.test(html),
    h1: [...clean.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => strip(m[1])),
    h2: [...clean.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => strip(m[1])),
    words: body.split(" ").filter(Boolean).length,
    keywords: keywordCounts(body, KEYWORDS),
    imagesMissingAlt: imgs.filter((i) => !/\balt="[^"]+"/.test(i)).length,
    images: imgs.length,
    internalLinks: [...main.matchAll(/href="(\/[^"#]*)"/g)].length,
    schema: [...new Set(ld.flatMap((t) => t.split(",")).map((t) => t.trim()))],
  };
}

const [mode, arg] = process.argv.slice(2);
if (mode === "page") {
  console.log(JSON.stringify(await inspect(arg), null, 2));
} else {
  const site = (mode ?? SITE_URL).replace(/\/$/, "");
  const xml = await (await fetch(`${site}/sitemap.xml`)).text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  console.log(`${urls.length} URLs in ${site}/sitemap.xml\n`);
  for (const url of urls) {
    try {
      const r = await inspect(url);
      const kw = Object.entries(r.keywords).filter(([, n]) => n && n !== "0 (without place: 0)").map(([k, n]) => `${k}: ${n}`).join(" | ");
      const flags = [
        r.status !== 200 && `STATUS ${r.status}`,
        r.noindex && "NOINDEX",
        r.h1.length !== 1 && `H1x${r.h1.length}`,
        (r.title.length < 30 || r.title.length > 65) && `title ${r.title.length}ch`,
        (r.description.length < 70 || r.description.length > 165) && `desc ${r.description.length}ch`,
        r.imagesMissingAlt && `${r.imagesMissingAlt} img no alt`,
        r.words < 600 && `thin ${r.words}w`,
      ].filter(Boolean);
      console.log(`${url.replace(site, "") || "/"}  [${r.status} ${r.ms}ms ${r.words}w]`);
      console.log(`  T: ${r.title}`);
      console.log(`  D: ${r.description}`);
      console.log(`  H1: ${r.h1.join(" | ")}`);
      console.log(`  kw: ${kw || "-"}   schema: ${r.schema.join(",") || "-"}`);
      if (flags.length) console.log(`  !! ${flags.join(", ")}`);
    } catch (error) {
      console.log(`${url}  ERROR ${error.message}`);
    }
  }
}
