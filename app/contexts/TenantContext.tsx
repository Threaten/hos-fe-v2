"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import { fetchTenantBySlug, type Tenant } from "@/api/queries";
import { getCurrentSubdomain } from "@/app/utils/domain";

interface TenantContextType {
  tenant: Tenant | null;
  loading: boolean;
  setTenant: (tenant: Tenant | null) => void;
}

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  loading: true,
  setTenant: () => {},
});

export function TenantProvider({
  children,
  initialTenant = null,
}: {
  children: React.ReactNode;
  /** Tenant fetched on the server, so the first HTML already names the branch */
  initialTenant?: Tenant | null;
}) {
  const [tenant, setTenant] = useState<Tenant | null>(initialTenant);
  const [loading, setLoading] = useState(!initialTenant);
  const params = useParams();
  const pathname = usePathname();

  useEffect(() => {
    const loadTenant = async () => {
      if (!initialTenant) setLoading(true);

      // Check if we're on /tenant/[slug] route
      const tenantSlug = Array.isArray(params?.tenant)
        ? params.tenant[0]
        : params?.tenant;

      if (tenantSlug && typeof tenantSlug === "string") {
        const data = await fetchTenantBySlug(tenantSlug);
        setTenant((prev) => data ?? prev);
        setLoading(false);
        return;
      }

      // Check if we're on a subdomain
      const subdomain = getCurrentSubdomain();
      if (subdomain && subdomain !== "www" && subdomain !== "admin") {
        const data = await fetchTenantBySlug(subdomain);
        setTenant((prev) => data ?? prev);
        setLoading(false);
        return;
      }

      // No tenant context (keep a tenant the server already resolved)
      setTenant(initialTenant);
      setLoading(false);
    };

    loadTenant();
  }, [params?.tenant, pathname]);

  return (
    <TenantContext.Provider value={{ tenant, loading, setTenant }}>
      {tenant?.mainColor && (
        <style>{`:root { --color-main: ${tenant.mainColor}; }`}</style>
      )}
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within TenantProvider");
  }
  return context;
}
