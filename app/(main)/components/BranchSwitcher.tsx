"use client";

import { useEffect, useRef, useState } from "react";
import OpeningStatus from "@/app/components/OpeningStatus";
import { fetchTenants, type Tenant } from "@/api/queries";
import { getTenantUrl } from "@/app/utils/domain";
import { useTenant } from "@/app/contexts/TenantContext";

/** Shared list of branches, fetched once per page */
export function useBranches() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  useEffect(() => {
    fetchTenants().then(setTenants);
  }, []);
  return tenants;
}

/**
 * One branch: name in its own colour, hours, address, phone.
 * Uses four subgrid rows so each field lines up with the same field of the
 * neighbouring branches; the parent <li> must be a subgrid spanning >= 4 rows.
 */
export function BranchEntry({ tenant, isCurrent }: { tenant: Tenant; isCurrent: boolean }) {
  return (
    <a
      href={getTenantUrl(tenant.domain)}
      className="group grid grid-rows-subgrid row-span-4 content-start"
      aria-current={isCurrent ? "true" : undefined}
    >
      <span className="flex flex-wrap items-baseline gap-x-3 mb-2">
        <span
          className="hs-title [overflow-wrap:anywhere] group-hover:opacity-70 transition-opacity duration-300"
          style={{ color: tenant.mainColor || "var(--pen)" }}
        >
          {tenant.name.toLowerCase()}
        </span>
        {isCurrent && <span className="hs-label">you are here</span>}
      </span>
      <span className="hs-ui block mb-1.5" style={{ color: "var(--ink-soft)" }}>
        <OpeningStatus branch={tenant} showHours />
      </span>
      <span className="block text-[0.9375rem] leading-snug" style={{ color: "var(--ink)" }}>
        {tenant.address}
      </span>
      <span className="block text-[0.9375rem]" style={{ color: "var(--ink-soft)" }}>
        {tenant.phone}
      </span>
    </a>
  );
}

/** "Homes ²" toggle with a full-width panel listing every branch */
export default function BranchSwitcher() {
  const tenants = useBranches();
  const { tenant: current } = useTenant();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="hs-ui hs-nav-link flex items-center gap-1.5"
        style={{ color: "var(--pen)" }}
        aria-expanded={open}
        aria-controls="branch-switcher"
      >
        Homes
        {tenants.length > 0 && <span className="hs-count">{tenants.length}</span>}
        <svg width="10" height="6" viewBox="0 0 20 12" aria-hidden="true" className="transition-transform duration-500" style={{ transform: open ? "rotate(180deg)" : "none" }}>
          <path d="M3 3l7 6 7-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div
        id="branch-switcher"
        className={`absolute left-0 right-0 top-full z-50 hs-paper border-b transition-[opacity,translate] duration-500 ${
          open ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2 pointer-events-none"
        }`}
        style={{ transitionTimingFunction: "var(--ease-out)", borderColor: "var(--line)" }}
      >
        <div className="hs-shell py-8 md:py-10 max-h-[calc(100dvh-var(--site-header-h,120px))] overflow-y-auto overscroll-contain">
          <p className="hs-label mb-6 lg:mb-0">Our homes</p>
          <ul className="hs-main grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-0">
            {tenants.map((t) => (
              <li key={t.id} className="grid grid-rows-subgrid row-span-4 pb-9 last:pb-0 sm:pb-9">
                <BranchEntry tenant={t} isCurrent={current?.id === t.id} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
