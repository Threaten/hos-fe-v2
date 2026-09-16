import type { Tenant } from "@/types/payload";

/** Resolves a tenant's public subdomain or path URL depending on environment. */
export function getTenantUrl(slug: string): string {
  if (typeof window === "undefined") {
    return `/t/${slug}`;
  }
  const { protocol, hostname, port, pathname } = window.location;

  // Local development
  if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
    // If the browser is accessing via /t/[slug] path routing
    if (pathname.startsWith("/t/")) {
      return `/t/${slug}`;
    }
    // Subdomain routing on localhost (e.g. slug.localhost:3000)
    return `${protocol}//${slug}.localhost${port ? `:${port}` : ""}`;
  }

  // Production: use subdomain
  const parts = hostname.split(".");
  const baseDomain = parts.length >= 2 ? parts.slice(-2).join(".") : hostname;
  return `${protocol}//${slug}.${baseDomain}`;
}

/** Formats tenant status into a human-readable label. */
export function tenantStatusLabel(status?: string | null): string {
  if (!status) return "";
  if (status === "closed") return "Closed";
  if (status === "temporarily-closed" || status === "temporarily_closed") {
    return "Temporarily closed";
  }
  return "";
}

export function tenantBranchLabel(
  tenant: Pick<Tenant, "name" | "status">,
): string {
  const status = tenantStatusLabel(tenant.status);
  return status ? `${tenant.name} (${status})` : tenant.name;
}

/** Returns status label if closed/temporarily closed, or opening hours. */
export function tenantHoursOrStatus(
  tenant: Pick<Tenant, "status" | "openingHours">,
): string {
  return tenantStatusLabel(tenant.status) || tenant.openingHours?.trim() || "";
}
