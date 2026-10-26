import type { MetadataRoute } from "next";
import { SITE_URL } from "@/app/utils/tenantServer";

/** houseofsenses.vn/robots.txt (branch subdomains are served by app/tenant/[tenant]/robots.txt) */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/tenant/", "/diagnostics"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
