import { tenantSiteUrl } from "@/app/utils/tenantServer";

/** {branch}.houseofsenses.vn/robots.txt, pointing crawlers at that branch's sitemap */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tenant: string }> },
) {
  const { tenant: slug } = await params;
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /tenant/",
    "",
    `Sitemap: ${tenantSiteUrl(slug)}/sitemap.xml`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
