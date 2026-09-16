import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { fetchTenantByDomain, fetchTenants } from "@/lib/data";
import { buildTenantTheme, themeCssVars } from "@/lib/theme";
import { TenantShell } from "@/components/tenant/TenantShell";

export default async function TenantLayout({
  children,
  params,
}: LayoutProps<"/t/[tenant]">) {
  const { tenant: slug } = await params;
  const [tenant, allBranches] = await Promise.all([
    fetchTenantByDomain(slug),
    fetchTenants(),
  ]);

  if (!tenant) notFound();

  const theme = buildTenantTheme(tenant.mainColor);
  const style = themeCssVars(theme) as CSSProperties;

  return (
    <TenantShell tenant={tenant} allBranches={allBranches} style={style}>
      {children}
    </TenantShell>
  );
}
