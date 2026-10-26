import { fetchTenantServer } from "@/app/utils/tenantServer";
import { tenantSitemapEntries, toSitemapXml } from "@/app/utils/sitemapEntries";

/**
 * {branch}.houseofsenses.vn/sitemap.xml. The middleware rewrites the subdomain
 * request to /tenant/{branch}/sitemap.xml. A route handler is used because a
 * sitemap.ts inside the dynamic [tenant] segment receives no params in Next 16.
 */
export const revalidate = 3600;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tenant: string }> },
) {
  const { tenant: slug } = await params;
  const tenant = await fetchTenantServer(slug);
  if (!tenant) return new Response("Not found", { status: 404 });

  const updatedAt = (tenant as { updatedAt?: string }).updatedAt;
  return new Response(toSitemapXml(tenantSitemapEntries(tenant.domain, updatedAt)), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
