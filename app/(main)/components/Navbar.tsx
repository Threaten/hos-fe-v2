"use client";

import { useState, useEffect } from "react";
import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTenant } from "@/app/contexts/TenantContext";
import OpeningStatus from "@/app/components/OpeningStatus";
import BranchSwitcher, { BranchEntry, useBranches } from "./BranchSwitcher";
import { ArrowRight } from "./Icons";
import ReservationLink from "./ReservationLink";
import { useT } from "@/app/i18n/useT";


const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/menu", label: "Menu" },
  // { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { tenant } = useTenant();
  const branches = useBranches();
  const brandName = (tenant?.name ?? "House of Senses").toLowerCase();
  const t = useT();

  // Close the mobile menu on navigation and lock page scroll while it is open
  useEffect(() => setIsMenuOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen((v) => !v);
  const isActive = (href: string) => (href === "/" ? pathname === "/" || pathname === "/home" : pathname === href);

  return (
    <>
      <nav aria-label={t("Site navigation")} className="relative z-40 hs-paper hos-gutter" style={{ height: "var(--header-h)" }}>
        <div className="h-full grid grid-cols-[1fr_auto] lg:grid-cols-[1fr_auto_1fr] items-center gap-6">
          {/* Desktop: page links on the left */}
          <ul className="hidden lg:flex items-center gap-6 justify-self-start">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive(href) ? "page" : undefined}
                  className="hs-ui hs-nav-link text-[1rem]"
                  style={{ color: "var(--pen)" }}
                >
                  {t(label)}
                </Link>
              </li>
            ))}
          </ul>

          {/* Wordmark: left on mobile, centred on desktop */}
          <Link
            href="/"
            className="justify-self-start lg:justify-self-center text-[1.75rem] lg:text-[2rem] leading-none tracking-[-0.045em] whitespace-nowrap transition-opacity duration-300 hover:opacity-70"
            style={{ color: "var(--pen)" }}
            aria-label={t("{name} home", { name: brandName })}
          >
            {brandName}
          </Link>

          <div className="justify-self-end flex items-center gap-6">
            {tenant && (
              <span className="hs-ui hidden xl:inline-flex" style={{ color: "var(--ink-soft)" }}>
                <OpeningStatus branch={tenant} showDetail />
              </span>
            )}
            <div className="hidden lg:block">
              <BranchSwitcher />
            </div>
            <ReservationLink className="hs-btn hs-btn-solid hs-btn-sm hidden lg:inline-flex" aria-label={t("Make a reservation")}>
              {t("Book a table")}
              <ArrowRight />
            </ReservationLink>

            <button
              onClick={toggleMenu}
              className="lg:hidden hs-icon-btn !w-9 !h-9"
              aria-label={isMenuOpen ? t("Close menu") : t("Open menu")}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path d="M8 2v12M2 8h12" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`lg:hidden fixed inset-0 z-200 flex flex-col hs-paper transition-opacity duration-500 ${
          isMenuOpen ? "hos-menu-open opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
        style={{ transitionTimingFunction: "var(--ease-out)" }}
        inert={!isMenuOpen}
      >
        <div className="flex items-center justify-between hos-gutter shrink-0" style={{ height: "var(--header-h)" }}>
          <Link href="/" className="text-[1.75rem] leading-none tracking-[-0.045em]" style={{ color: "var(--pen)" }} onClick={toggleMenu}>
            {brandName}
          </Link>
          <button onClick={toggleMenu} className="hs-icon-btn !w-9 !h-9" aria-label={t("Close menu")}>
            <svg viewBox="0 0 16 16" className="w-4 h-4 rotate-45" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M8 2v12M2 8h12" />
            </svg>
          </button>
        </div>

        <nav aria-label={t("Main navigation menu")} className="flex-1 overflow-y-auto hos-gutter pt-10 pb-8 flex flex-col">
          <ul className="flex flex-col">
            {NAV_LINKS.map(({ href, label }, i) => (
              <li key={href} className="hos-menu-item" style={{ "--i": i } as React.CSSProperties}>
                <Link
                  href={href}
                  aria-current={isActive(href) ? "page" : undefined}
                  className="hs-display hs-nav-link inline-block lowercase py-0.5"
                  style={{ color: "var(--pen)" }}
                  onClick={toggleMenu}
                >
                  {t(label)}
                </Link>
              </li>
            ))}
          </ul>

          {tenant && (
            <p className="hs-ui mt-10 hos-menu-item" style={{ color: "var(--ink-soft)", "--i": NAV_LINKS.length } as React.CSSProperties}>
              <OpeningStatus branch={tenant} showDetail />
            </p>
          )}

          {branches.length > 1 && (
            <div className="mt-10 hos-menu-item" style={{ "--i": NAV_LINKS.length + 1 } as React.CSSProperties}>
              <p className="hs-label mb-5">
                {t("Our homes")}<span className="hs-count">{branches.length}</span>
              </p>
              <ul className="flex flex-col gap-7">
                {branches.map((b) => (
                  <li key={b.id}>
                    <BranchEntry tenant={b} isCurrent={tenant?.id === b.id} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>

        <div className="hos-gutter pb-8 pt-4 shrink-0">
          <ReservationLink className="hs-btn hs-btn-solid w-full" onClick={toggleMenu}>
            {t("Book a table")}
            <ArrowRight />
          </ReservationLink>
        </div>
      </div>
    </>
  );
}

