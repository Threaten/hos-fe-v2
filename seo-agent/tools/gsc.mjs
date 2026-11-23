#!/usr/bin/env node
// Google Search Console (read-only) with a service-account key: real Google positions for our keywords.
// Usage: node gsc.mjs queries [days=28]      top queries + target keywords with clicks, impressions, position
//        node gsc.mjs pages [days=28]        top pages
//        node gsc.mjs inspect <url>          is this URL indexed? last crawl, canonical
// Needs GSC_KEY_FILE and GSC_SITE (e.g. sc-domain:example.com) in the agent's env file.
import crypto from "node:crypto";
import fs from "node:fs";

const { GSC_KEY_FILE, GSC_SITE } = process.env;
if (!GSC_KEY_FILE || !GSC_SITE || !fs.existsSync(GSC_KEY_FILE)) {
  console.log("Search Console is not configured (GSC_KEY_FILE / GSC_SITE). Skip ranking data this run.");
  process.exit(0);
}
import { keywords } from "./siteconf.mjs";
const TARGETS = keywords().map((k) => k.toLowerCase());

async function token() {
  const key = JSON.parse(fs.readFileSync(GSC_KEY_FILE, "utf8"));
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
    iss: key.client_email,
    scope: "https://www.googleapis.com/auth/webmasters.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })}`;
  const signature = crypto.sign("RSA-SHA256", Buffer.from(unsigned), key.private_key).toString("base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${signature}` }),
  });
  const json = await res.json();
  if (!json.access_token) throw new Error(`Google auth failed: ${JSON.stringify(json)}`);
  return json.access_token;
}

async function call(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { authorization: `Bearer ${await token()}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json));
  return json;
}

const day = (offset) => new Date(Date.now() - offset * 864e5).toISOString().slice(0, 10);
const analytics = (dimensions, days, extra = {}) =>
  call(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE)}/searchAnalytics/query`, {
    startDate: day(Number(days) + 3),
    endDate: day(3),
    dimensions,
    rowLimit: 250,
    ...extra,
  });
const row = (r) => `${r.keys.join(" | ")}  clicks=${r.clicks} impr=${r.impressions} ctr=${(r.ctr * 100).toFixed(1)}% pos=${r.position.toFixed(1)}`;

const [cmd = "queries", arg] = process.argv.slice(2);
if (cmd === "queries") {
  const days = arg ?? 28;
  const { rows = [] } = await analytics(["query"], days);
  console.log(TARGETS.length ? `Target keywords, last ${days} days (position 1-10 = page 1):` : "No target keywords yet (state/keywords.txt is empty): showing what people already find us for.");
  for (const target of TARGETS) {
    const hit = rows.find((r) => r.keys[0].toLowerCase() === target);
    console.log(hit ? `  ${row(hit)}` : `  ${target}  (no impressions yet)`);
  }
  const words = [...new Set(TARGETS.flatMap((k) => k.split(/\s+/)).filter((w) => w.length > 3))];
  if (words.length) {
    console.log(`\nQueries sharing words with the targets:`);
    rows.filter((r) => words.some((w) => r.keys[0].includes(w)) && !TARGETS.includes(r.keys[0])).slice(0, 60).forEach((r) => console.log(`  ${row(r)}`));
  }
  console.log(`\nTop queries overall:`);
  rows.slice(0, 25).forEach((r) => console.log(`  ${row(r)}`));
} else if (cmd === "pages") {
  const { rows = [] } = await analytics(["page"], arg ?? 28);
  rows.slice(0, 50).forEach((r) => console.log(`  ${row(r)}`));
} else if (cmd === "inspect") {
  const json = await call("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", {
    inspectionUrl: arg,
    siteUrl: GSC_SITE,
  });
  const r = json.inspectionResult?.indexStatusResult ?? {};
  console.log(JSON.stringify({ verdict: r.verdict, coverage: r.coverageState, lastCrawl: r.lastCrawlTime, googleCanonical: r.googleCanonical, robots: r.robotsTxtState, indexing: r.indexingState }, null, 2));
} else {
  console.error("usage: gsc.mjs queries|pages [days] | inspect <url>");
  process.exit(2);
}
