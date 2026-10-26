import type { MetadataRoute } from "next";
import { SITE_URL, fetchTenantsServer } from "@/app/utils/tenantServer";
import { tenantSitemapEntries } from "@/app/utils/sitemapEntries";

export const revalidate = 3600; // regenerate every hour

/**
 * houseofsenses.vn/sitemap.xml: the group home plus every branch's pages.
 * Listing subdomain URLs here is accepted by Google when the whole domain is
 * verified as one Search Console Domain property.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const branches = await fetchTenantsServer();
  const latest = branches
    .map((b) => b.updatedAt)
    .filter(Boolean)
    .sort()
    .at(-1);

  return [
    { url: `${SITE_URL}/`, ...(latest ? { lastModified: new Date(latest) } : {}), priority: 1 },
    ...branches.flatMap((b) => tenantSitemapEntries(b.domain, b.updatedAt)),
  ];
}
