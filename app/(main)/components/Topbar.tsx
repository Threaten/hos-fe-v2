"use client";
import { useState, useRef, useEffect } from "react";
import OpeningStatus from "@/app/components/OpeningStatus";
import { fetchTenants, type Tenant } from "@/api/queries";
import { getTenantUrl } from "@/app/utils/domain";
import { useTenant } from "@/app/contexts/TenantContext";

export default function Topbar() {
  const [open, setOpen] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const { tenant: currentTenant } = useTenant();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTenants().then(setTenants);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const notification = currentTenant?.topbarNotification;
  const hasNotification = notification?.enabled && notification?.message;

  return (
    <div className="w-full bg-paper" ref={rootRef}>
      {hasNotification && (
        <div
          className="w-full flex items-center justify-center py-2 hos-gutter text-center text-[14px] leading-[1.3]"
          style={{ backgroundColor: "var(--color-main)", color: "var(--color-on-main)" }}
        >
          {notification.message}
        </div>
      )}

      {/* Branch switcher */}
      <div
        className="relative w-full h-[34px] border-b hos-gutter flex items-center justify-center"
        style={{ borderColor: "var(--color-line)" }}
      >
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 text-[14px] leading-none transition-opacity duration-300 hover:opacity-70"
          style={{ color: "var(--color-ink)" }}
          aria-expanded={open}
          aria-controls="branch-switcher"
        >
          <span>Our locations</span>
          <span className="hidden md:inline" style={{ color: "var(--color-ink-muted)" }}>
            {tenants.map((t) => t.name.toLowerCase()).join(" · ")}
          </span>
          <svg
            width="9"
            height="6"
            viewBox="0 0 9 6"
            aria-hidden="true"
            className="transition-transform duration-300"
            style={{ transform: open ? "rotate(180deg)" : "none" }}
          >
            <path d="M.5.75 4.5 4.75 8.5.75" fill="none" stroke="currentColor" />
          </svg>
        </button>

        <div
          id="branch-switcher"
          className={`absolute left-0 right-0 top-full z-50 bg-paper border-b transition-opacity duration-300 ${
            open ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
          }`}
          style={{ borderColor: "var(--color-line)" }}
        >
          <ul className="hos-gutter py-6 md:py-8 grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(260px,340px))] md:justify-center gap-x-[22px] gap-y-6">
            {tenants.map((tenant) => {
              const isCurrent = currentTenant?.id === tenant.id;
              return (
                <li key={tenant.id}>
                  <a
                    href={getTenantUrl(tenant.domain)}
                    className="group block"
                    aria-current={isCurrent ? "true" : undefined}
                  >
                    <span
                      className="block font-serif text-[1.75rem] leading-none mb-2 hos-link group-hover:decoration-current"
                      style={{ color: tenant.mainColor || "var(--color-main)" }}
                    >
                      {tenant.name.toLowerCase()}
                      {isCurrent && (
                        <span className="font-sans text-[13px] align-middle ml-2" style={{ color: "var(--color-ink-muted)" }}>
                          you are here
                        </span>
                      )}
                    </span>
                    <OpeningStatus
                      branch={tenant}
                      showHours
                      className="text-[14px] leading-[1.3] mb-1.5"
                    />
                    {tenant.address && (
                      <span className="block text-[15px] leading-[1.3]" style={{ color: "var(--color-ink)" }}>
                        {tenant.address}
                      </span>
                    )}
                    {tenant.phone && (
                      <span className="block text-[15px] leading-[1.3]" style={{ color: "var(--color-ink)" }}>
                        T: {tenant.phone}
                      </span>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
