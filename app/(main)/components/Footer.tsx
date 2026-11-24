"use client";

import React, { useState } from "react";
import Link from "next/link";
import OpeningStatus from "@/app/components/OpeningStatus";
import { useTenant } from "@/app/contexts/TenantContext";
import { mapsEmbedUrl, mapsUrl } from "@/app/utils/maps";
import SocialIcons from "./SocialIcons";
import { BranchEntry, useBranches } from "./BranchSwitcher";
import { ArrowRight } from "./Icons";
import ReservationLink from "./ReservationLink";
import { useLang, useT } from "@/app/i18n/useT";


/** Wordmark, map and contacts for this branch, then every other home */
const Footer: React.FC = () => {
  const tenants = useBranches();
  const [expanded, setExpanded] = useState(false);
  const { tenant } = useTenant();
  const name = (tenant?.name ?? "House of Senses").toLowerCase();
  const t = useT();
  const lang = useLang();

  return (
    <footer className="relative mt-[var(--section)] pb-8 overflow-x-clip">
      {/* Wordmark */}
      <div className="hs-shell" data-reveal>
        <div className="hs-main grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,300px)] gap-x-10 gap-y-4 items-start">
          <Link
            href="/"
            className="hs-hero block text-center lg:text-left [overflow-wrap:anywhere] transition-opacity duration-300 hover:opacity-80"
          >
            {name}
          </Link>
          {tenant?.heroSubtitle && (
            <p className="text-[1.1875rem] leading-[1.25] tracking-[-0.015em] text-center lg:text-left xl:pt-4" style={{ color: "var(--pen)" }}>
              {tenant.heroSubtitle}
            </p>
          )}
        </div>
      </div>

      {/* Map + contacts */}
      {tenant && (
        <section className="hs-shell mt-10 md:mt-14" aria-labelledby="footer-contacts">
          <div className="hs-main grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,300px)] gap-x-10 gap-y-10 items-start">
            {(tenant.address || tenant.location) && (
              <div className="relative w-full aspect-[8/5] overflow-hidden" style={{ background: "var(--paper-2)" }} data-reveal>
                <iframe
                  title={t("Map to {name}", { name: tenant.name })}
                  src={mapsEmbedUrl(tenant)}
                  className="absolute inset-0 w-full h-full border-0 grayscale-[0.35]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}

            <div className="text-center lg:text-left" data-reveal style={{ ["--reveal-delay" as string]: "0.08s" }}>
              <h2 id="footer-contacts" className="hs-display mb-6" style={{ color: "var(--ink)" }}>
                {t("contacts")}
              </h2>
              <p className="text-[1.1875rem] leading-[1.25] tracking-[-0.015em]" style={{ color: "var(--ink)" }}>
                <OpeningStatus branch={tenant} showHours />
                {tenant.address && (
                  <>
                    {" "}{t("at")}{" "}
                    <a href={mapsUrl(tenant)} target="_blank" rel="noopener noreferrer" className="hs-link">
                      {tenant.address.toLowerCase()}
                    </a>
                  </>
                )}
              </p>
              <SocialIcons tenant={tenant} className="mt-6 justify-center lg:justify-start" iconClassName="w-[18px] h-[18px]" />
              <ul className="hs-ui mt-7 flex flex-col items-center lg:items-start gap-2.5 text-[0.9375rem]">
                {tenant.phone && (
                  <li>
                    <a href={`tel:${tenant.phone.replace(/\s+/g, "")}`} className="hs-link">
                      {tenant.phone}
                    </a>
                  </li>
                )}
                {tenant.email && (
                  <li>
                    <a href={`mailto:${tenant.email}`} className="hs-link break-all">
                      {tenant.email}
                    </a>
                  </li>
                )}
              </ul>
              <p className="mt-9 flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2">
                <Link href="/menu" className="hs-ui hs-nav-link text-[0.9375rem]" style={{ color: "var(--pen)" }}>
                  {t("Menu")}
                </Link>
                <ReservationLink className="hs-ui hs-nav-link text-[0.9375rem] inline-flex items-center gap-1.5" style={{ color: "var(--pen)" }}>
                  {t("Book a table")} <ArrowRight className="w-3 h-3" />
                </ReservationLink>
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Every home, folded away until asked for */}
      {tenants.length > 0 && (
        <section className="hs-shell mt-12 md:mt-16" aria-labelledby="footer-locations">
          <h2 id="footer-locations" className="sr-only">
            {t("Our homes")}
          </h2>
          <div className="lg:col-span-2">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              aria-controls="footer-locations-list"
              className="group w-full grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,3.75fr)] gap-x-[var(--gutter)] gap-y-3 items-baseline py-5 border-y text-center lg:text-left"
              style={{ borderColor: "var(--line)" }}
            >
              <span className="hs-label">
                {t("Our homes")}<span className="hs-count">{tenants.length}</span>
              </span>
              <span className="flex flex-wrap items-baseline justify-center lg:justify-between gap-x-6 gap-y-2">
                <span className="text-[1.5rem] md:text-[1.75rem] leading-tight tracking-[-0.03em]">
                  {tenants.map((t, i) => (
                    <React.Fragment key={t.id}>
                      {i > 0 && <span style={{ color: "var(--ink-faint)" }}>, </span>}
                      <span style={{ color: t.mainColor || "var(--pen)" }}>{t.name.toLowerCase()}</span>
                    </React.Fragment>
                  ))}
                </span>
                <span className="hs-ui inline-flex items-center gap-2 group-hover:opacity-60 transition-opacity duration-300" style={{ color: "var(--pen)" }}>
                  {expanded ? t("Fold away") : t("Show all")}
                  <svg
                    width="10"
                    height="6"
                    viewBox="0 0 20 12"
                    className="transition-transform duration-500"
                    style={{ transform: expanded ? "rotate(180deg)" : "none", transitionTimingFunction: "var(--ease-out)" }}
                    aria-hidden="true"
                  >
                    <path d="M3 3l7 6 7-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </span>
            </button>
            <div
              id="footer-locations-list"
              className="grid transition-[grid-template-rows,opacity] duration-700"
              style={{
                gridTemplateRows: expanded ? "1fr" : "0fr",
                opacity: expanded ? 1 : 0,
                transitionTimingFunction: "var(--ease-out)",
              }}
              inert={!expanded}
            >
              <div className="overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,3.75fr)] gap-x-[var(--gutter)]">
                  <ul className="lg:col-start-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-0 py-10">
                    {tenants.map((t) => (
                      <li key={t.id} className="grid grid-rows-subgrid row-span-5 content-start pb-10 last:pb-0 sm:pb-10">
                        <BranchEntry tenant={t} isCurrent={tenant?.id === t.id} />
                        <SocialIcons tenant={t} className="mt-4 self-start" iconClassName="w-4 h-4" />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Fine print */}
      <div className="hos-gutter mt-10 grid grid-cols-1 sm:grid-cols-3 gap-2 text-center sm:text-left text-[1rem] tracking-[-0.01em]" style={{ color: "var(--ink-faint)" }}>
        <p>&copy; {new Date().getFullYear()} House of Senses</p>
        <p className="sm:text-center">
          <a href="https://houseofsenses.vn" className="hover:opacity-60 transition-opacity duration-300">
            houseofsenses.vn
          </a>
        </p>
        <p className="sm:text-right flex gap-5 justify-center sm:justify-end">
          {/* Link to the branch's page in Vietnamese, when it is switched on in the CMS */}
          {lang === "vi" ? (
            <Link href="/" hrefLang="en" lang="en" className="hover:opacity-60 transition-opacity duration-300">
              English
            </Link>
          ) : (
            tenant?.vi?.enabled && (
              <Link href="/vi" hrefLang="vi" lang="vi" className="hover:opacity-60 transition-opacity duration-300">
                Tiếng Việt
              </Link>
            )
          )}
          <span>Saigon</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
