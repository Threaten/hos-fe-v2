import { API_URL } from "@/app/utils/constants";
import type { HomeInformation, Tenant } from "@/api/queries";
import { resolveBackendMediaUrl } from "@/app/utils/media";

/**
 * Server-side tenant fetches. Layouts, pages, metadata and sitemaps all call
 * these with identical URLs, so Next dedupes them into one request per render.
 */

export const SITE_DOMAIN = "houseofsenses.vn";
export const SITE_URL = `https://${SITE_DOMAIN}`;

export async function fetchTenantServer(slug: string): Promise<Tenant | null> {
  try {
    const res = await fetch(
      `${API_URL}/api/tenants?where[domain][equals]=${encodeURIComponent(slug)}&depth=2&limit=1`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json?.docs?.[0] ?? null;
  } catch {
    return null;
  }
}

export type TenantSummary = Pick<
  Tenant,
  "id" | "name" | "domain" | "address" | "phone" | "email" | "mainColor" | "status" | "openingHours"
> & { updatedAt?: string };

export async function fetchTenantsServer(): Promise<TenantSummary[]> {
  try {
    const res = await fetch(`${API_URL}/api/tenants?depth=0&limit=100`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json?.docs ?? []) as TenantSummary[];
  } catch {
    return [];
  }
}

/** Public URL of a branch site, e.g. https://red-space.houseofsenses.vn */
export function tenantSiteUrl(domain: string): string {
  return `https://${domain}.${SITE_DOMAIN}`;
}

/** "red space" → "Red Space" for titles and structured data */
export function displayName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Group home information via REST. REST keys are the CMS field labels
 * ("Catch Phrase 1", "quote(s)"), so map them to the GraphQL-shaped type.
 */
export async function fetchHomeInformationServer(): Promise<HomeInformation | null> {
  try {
    const res = await fetch(`${API_URL}/api/globals/home-information?depth=1`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const j = await res.json();
    return {
      name: j.name,
      logo: j.logo?.url ? { url: resolveBackendMediaUrl(j.logo) } : null,
      CatchPhrase1: j["Catch Phrase 1"] ?? j.CatchPhrase1 ?? "",
      CatchPhrase2: j["Catch Phrase 2"] ?? j.CatchPhrase2 ?? "",
      quote_s_: j["quote(s)"] ?? j.quote_s_ ?? [],
      BackgroundImage_forMobile_: j["Background Image (for Mobile)"]?.url
        ? { url: j["Background Image (for Mobile)"].url }
        : null,
    };
  } catch {
    return null;
  }
}
