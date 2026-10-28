"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTenant } from "@/app/contexts/TenantContext";
import Wordmark from "./Wordmark";

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
  const brandName = tenant?.name ?? "House of Senses";

  // Close the mobile menu on navigation and lock page scroll while it is open
  useEffect(() => setIsMenuOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen((v) => !v);

  return (
    <>
      <nav
        aria-label="Site navigation"
        className="relative z-40 bg-paper hos-gutter border-b"
        style={{ height: "var(--header-h)", borderColor: "var(--color-main)" }}
      >
        <div className="h-full grid grid-cols-[1fr_auto] lg:grid-cols-[1fr_auto_1fr] items-center">
          <div className="justify-self-start flex flex-col items-start gap-1">
            <Link
              href="/"
              className="text-[1.75rem] lg:text-[2.25rem] transition-opacity duration-300 hover:opacity-70"
              style={{ color: "var(--color-main)" }}
              aria-label={`${brandName} home`}
            >
              <Wordmark name={brandName} />
            </Link>
            <a
              href="https://houseofsenses.vn"
              className="hos-link text-[13px] leading-none"
              style={{ color: "var(--color-ink-muted)" }}
            >
              House of Senses
            </a>
          </div>

          <ul className="hidden lg:flex items-center gap-[22px]">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    className="hos-link text-[18px] leading-[1.3]"
                    style={{ color: "var(--color-ink)" }}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="justify-self-end flex items-center">
            <Link
              href="/reservation"
              className="hos-btn hos-btn-solid hidden lg:inline-flex"
              style={{ minHeight: 45, paddingInline: 23 }}
              aria-label="Make a reservation"
            >
              Book a table
            </Link>

            <button
              onClick={toggleMenu}
              className="lg:hidden flex flex-col items-center justify-center gap-[3px] w-6 h-6"
              style={{ backgroundColor: "var(--color-ink)" }}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              <span className="block w-3 h-px bg-paper" />
              <span className="block w-3 h-px bg-paper" />
              <span className="block w-3 h-px bg-paper" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile fullscreen menu */}
      <div
        id="mobile-menu"
        className={`lg:hidden fixed inset-0 z-200 flex flex-col bg-paper transition-opacity duration-500 ${
          isMenuOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
        style={{ transitionTimingFunction: "var(--ease-out)" }}
      >
        <div
          className="flex items-center justify-between hos-gutter shrink-0"
          style={{ height: "var(--header-h)" }}
        >
          <Link
            href="/"
            className="text-[1.75rem]"
            style={{ color: "var(--color-main)" }}
            onClick={toggleMenu}
          >
            <Wordmark name={brandName} />
          </Link>
          <button
            onClick={toggleMenu}
            className="relative w-6 h-6 flex items-center justify-center"
            style={{ backgroundColor: "var(--color-ink)" }}
            aria-label="Close menu"
          >
            <span className="absolute block w-3.5 h-px bg-paper rotate-45" />
            <span className="absolute block w-3.5 h-px bg-paper -rotate-45" />
          </button>
        </div>

        <nav
          aria-label="Main navigation menu"
          className="flex-1 flex flex-col justify-center hos-gutter"
        >
          <ul className="flex flex-col gap-2">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    className="hos-link font-serif text-[clamp(2.75rem,13vw,4.5rem)] leading-[1.05]"
                    style={{ color: "var(--color-main)" }}
                    onClick={toggleMenu}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hos-gutter pb-10">
          <Link
            href="/reservation"
            className="hos-btn hos-btn-solid w-full"
            onClick={toggleMenu}
          >
            Book a table
          </Link>
        </div>
      </div>
    </>
  );
}
