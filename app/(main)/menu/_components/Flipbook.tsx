"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchTenants, getMenuSource, type Tenant } from "@/api/queries";
import { resolveBackendMediaUrl } from "@/app/utils/media";
import TenantFlipbook from "./TenantFlipbook";

const Flipbook = ({ initialBranch }: { initialBranch?: string }) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const initialBranchName = useMemo(() => {
    if (!initialBranch) return "";
    return decodeURIComponent(initialBranch.replace(/\+/g, " "));
  }, [initialBranch]);

  useEffect(() => {
    let cancelled = false;

    const loadTenants = async () => {
      try {
        const data = await fetchTenants();
        if (cancelled) return;

        setTenants(data);
        const initialTenant =
          data.find((tenant) => tenant.name === initialBranchName) ||
          data.find((tenant) => tenant.domain === initialBranchName) ||
          data[0];
        setSelectedTenantId(initialTenant?.id || "");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadTenants();

    return () => {
      cancelled = true;
    };
  }, [initialBranchName]);

  const selectedTenant = tenants.find((tenant) => tenant.id === selectedTenantId);

  const menu = getMenuSource(selectedTenant);
  const menuUrl = resolveBackendMediaUrl(menu.file);

  return (
    <div className="w-full min-h-screen flex flex-col items-center">
      <div className="shrink-0 hos-gutter pt-8 md:pt-14 flex flex-col items-center gap-4 text-center">
        <label htmlFor="menu-branch" className="hs-note">
          The menu at
        </label>
        <select
          id="menu-branch"
          value={selectedTenantId}
          onChange={(event) => setSelectedTenantId(event.target.value)}
          className="hs-hero lowercase text-[clamp(3rem,7vw,6.5rem)] pl-2 pr-[0.7em] bg-transparent appearance-none cursor-pointer outline-none text-center"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 12' fill='none' stroke='%23333' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 3l7 6 7-6'/%3E%3C/svg%3E\")",
            backgroundPosition: "right center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "0.4em",
          }}
        >
          {tenants.map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.name.toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      {isLoading && (
        <p className="hs-note mt-12 animate-pulse">Finding the menus…</p>
      )}

      {!isLoading && !selectedTenant && (
        <p className="hs-lead mt-12">No branches found.</p>
      )}

      {!isLoading && selectedTenant && !menuUrl && (
        <p className="hs-lead mt-12 text-center hos-gutter">
          This branch hasn&apos;t published its menu online yet.
        </p>
      )}

      {!isLoading && selectedTenant && menuUrl && (
        <TenantFlipbook
          key={selectedTenant.id}
          menuUrl={menuUrl}
          tenantName={selectedTenant.name}
          imagePages={menu.pages}
          showHeading={false}
        />
      )}
    </div>
  );
};

export default Flipbook;
