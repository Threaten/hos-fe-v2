import type { MetadataRoute } from "next";
import { TENANT_PAGES } from "@/app/utils/seo";
import { tenantSiteUrl } from "@/app/utils/tenantServer";

/** Branch pages to list, most important first */
const PAGE_PRIORITY: Record<string, number> = {
  "": 1.0,
  menu: 0.9,
  reservation: 0.9,
  about: 0.7,
  contact: 0.7,
  gallery: 0.6,
};

/** Sitemap entries for one branch (indexable pages only) */
export function tenantSitemapEntries(
  domain: string,
  updatedAt?: string,
): MetadataRoute.Sitemap {
  const base = tenantSiteUrl(domain);
  const lastModified = updatedAt ? new Date(updatedAt) : undefined;
  return Object.entries(PAGE_PRIORITY)
    .filter(([path]) => !path || !TENANT_PAGES[path]?.noIndex)
    .map(([path, priority]) => ({
      url: path ? `${base}/${path}` : `${base}/`,
      ...(lastModified ? { lastModified } : {}),
      priority,
    }));
}

const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Serialise entries as sitemap XML (for route handlers that can't use sitemap.ts) */
export function toSitemapXml(entries: MetadataRoute.Sitemap): string {
  const urls = entries
    .map((e) => {
      const lastmod = e.lastModified
        ? `<lastmod>${new Date(e.lastModified).toISOString()}</lastmod>`
        : "";
      const priority = e.priority != null ? `<priority>${e.priority.toFixed(1)}</priority>` : "";
      return `<url><loc>${escapeXml(e.url)}</loc>${lastmod}${priority}</url>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}
