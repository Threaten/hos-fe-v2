"use client";

import React, { useState, useEffect } from "react";
import OpeningStatus from "@/app/components/OpeningStatus";
import { fetchTenants, type Tenant } from "@/api/queries";
import { getTenantUrl } from "@/app/utils/domain";
import { useTenant } from "@/app/contexts/TenantContext";
import Wordmark from "./Wordmark";
import { buildSocials } from "./InstagramEmbed";

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  facebook: (
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  ),
  instagram: (
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  ),
  tiktok: (
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  ),
  youtube: (
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  ),
};

const Footer: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [expanded, setExpanded] = useState(false);
  const { tenant: currentTenant } = useTenant();

  useEffect(() => {
    fetchTenants().then(setTenants);
  }, []);

  return (
    <footer
      className="w-full bg-paper hos-gutter pt-14 md:pt-[69px] pb-10 md:pb-[52px] border-t"
      style={{ color: "var(--color-ink)", borderColor: "var(--color-line)" }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-y-12 gap-x-12">
        <a
          href="https://houseofsenses.vn"
          className="self-start text-[3rem] md:text-[clamp(3.5rem,6vw,5.6rem)] transition-opacity duration-300 hover:opacity-80"
          aria-label="House of Senses"
        >
          <Wordmark name="House of Senses" />
        </a>

        {/* Every branch, collapsible so the footer stays short as branches are added */}
        <section aria-labelledby="footer-locations">
          <h2 id="footer-locations">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              aria-controls="footer-locations-list"
              className="group w-full flex items-center justify-between gap-6 py-3 border-b text-left"
              style={{ borderColor: "var(--color-line)" }}
            >
              <span className="font-serif text-[clamp(1.75rem,3vw,2.5rem)] leading-none" style={{ color: "var(--color-main)" }}>
                Our locations
                {tenants.length > 0 && (
                  <span className="font-sans text-[15px] align-middle ml-3" style={{ color: "var(--color-ink-muted)" }}>
                    {tenants.length}
                  </span>
                )}
              </span>
              <svg
                width="18"
                height="11"
                viewBox="0 0 18 11"
                aria-hidden="true"
                className="shrink-0 transition-transform duration-500"
                style={{
                  transform: expanded ? "rotate(180deg)" : "none",
                  transitionTimingFunction: "var(--ease-out)",
                  color: "var(--color-main)",
                }}
              >
                <path d="M1 1.5 9 9.5l8-8" fill="none" stroke="currentColor" strokeWidth="1.25" />
              </svg>
            </button>
          </h2>
          <div
            id="footer-locations-list"
            className="grid transition-[grid-template-rows,opacity] duration-500"
            style={{
              gridTemplateRows: expanded ? "1fr" : "0fr",
              opacity: expanded ? 1 : 0,
              transitionTimingFunction: "var(--ease-out)",
            }}
            inert={!expanded}
          >
            <div className="overflow-hidden">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 pt-6">
              {tenants.map((tenant) => {
                const isCurrent = currentTenant?.id === tenant.id;
                const socials = buildSocials(tenant);
                return (
                  <li key={tenant.id}>
                    <address className="not-italic">
                      <a
                        href={getTenantUrl(tenant.domain)}
                        className="hos-link font-serif text-[1.75rem] leading-none"
                        style={{ color: tenant.mainColor || "var(--color-main)" }}
                        aria-current={isCurrent ? "true" : undefined}
                      >
                        {tenant.name.toLowerCase()}
                      </a>
                      {isCurrent && (
                        <span className="ml-2 text-[13px]" style={{ color: "var(--color-ink-muted)" }}>
                          you are here
                        </span>
                      )}
                      <div className="mt-2 text-[15px] md:text-[16px] leading-[1.35]">
                        {tenant.address && <p>{tenant.address}</p>}
                        <OpeningStatus
                          branch={tenant}
                          showDetail
                          showHours
                          className="my-1"
                        />
                        {tenant.phone && (
                          <p>
                            T:{" "}
                            <a href={`tel:${tenant.phone.replace(/\s+/g, "")}`} className="hos-link">
                              {tenant.phone}
                            </a>
                          </p>
                        )}
                        {tenant.email && (
                          <p>
                            <a href={`mailto:${tenant.email}`} className="hos-link break-all">
                              {tenant.email}
                            </a>
                          </p>
                        )}
                      </div>
                      {socials.length > 0 && (
                        <div className="flex gap-3 mt-3">
                          {socials.map((social) => (
                            <a
                              key={social.key}
                              href={social.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="transition-opacity duration-300 hover:opacity-60"
                              aria-label={`${tenant.name} on ${social.label}`}
                            >
                              <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                {SOCIAL_ICONS[social.key]}
                              </svg>
                            </a>
                          ))}
                        </div>
                      )}
                    </address>
                  </li>
                );
              })}
            </ul>
            </div>
          </div>
        </section>
      </div>

      <div
        className="mt-14 md:mt-[69px] pt-5 border-t flex flex-col sm:flex-row sm:justify-between gap-1 text-[14px]"
        style={{ borderColor: "var(--color-line)", color: "var(--color-ink-muted)" }}
      >
        <p>
          &copy; {new Date().getFullYear()} by{" "}
          <a href="https://houseofsenses.vn" className="hos-link">
            House Of Senses
          </a>
        </p>
        <p>All rights reserved</p>
      </div>
    </footer>
  );
};

export default Footer;
