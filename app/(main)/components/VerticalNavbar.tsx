"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTenant } from "@/app/contexts/TenantContext";
import { fetchHomeInformation, type HomeInformation } from "@/api/queries";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/menu", label: "Menu" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

// Collapsed: always-visible narrow strip. Expanded: full sidebar.
const COLLAPSED_W = "4rem";   // 64px — shows logo abbrev + numbers
const EXPANDED_W  = "14rem";  // 224px — shows full logo + labels

/** Derive a short abbreviation from a brand name, e.g. "House of Senses" → "HOS" */
function abbrev(name: string): string {
  const parts = name.split(" ").filter((w) => w.length > 1);
  return parts.map((w) => w[0]).join("").toUpperCase().slice(0, 3);
}

export default function VerticalNavbar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [homeInfo, setHomeInfo] = useState<HomeInformation | null>(null);
  const pathname = usePathname();
  const { tenant } = useTenant();

  useEffect(() => {
    fetchHomeInformation().then((data) => {
      if (data) setHomeInfo(data);
    });
  }, []);

  // Collapse on navigation
  useEffect(() => {
    setIsExpanded(false);
  }, [pathname]);

  const homeAbbrev = abbrev(homeInfo?.name ?? "House of Senses");
  const tenantAbbrev = tenant ? abbrev(tenant.name) : "";

  const fadeIn = {
    opacity: isExpanded ? 1 : 0,
    transitionDelay: isExpanded ? "80ms" : "0ms",
  } as React.CSSProperties;

  return (
    <aside
      className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-40 overflow-hidden border-r"
      style={{
        width: isExpanded ? EXPANDED_W : COLLAPSED_W,
        backgroundColor: "var(--background)",
        borderColor: "color-mix(in srgb, var(--color-tan) 22%, transparent)",
        transition: "width 380ms cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: isExpanded
          ? "4px 0 28px color-mix(in srgb, var(--color-earth) 12%, transparent)"
          : "none",
      }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Inner content fixed at EXPANDED_W — clips cleanly during transition */}
      <div
        className="flex flex-col h-full"
        style={{ width: EXPANDED_W, minWidth: EXPANDED_W }}
      >
        {/* Top gold accent line */}
        <div
          className="h-px w-full shrink-0"
          style={{
            background:
              "linear-gradient(to right, transparent, var(--color-gold), transparent)",
            opacity: 0.4,
          }}
        />

        {/* ── Brand section ── */}
        <div className="flex flex-col shrink-0 pt-20 pb-6">

          {/* Home logo — bigger, on top */}
          <Link
            href="/"
            className="flex items-center group focus:outline-none"
            aria-label="House of Senses Home"
          >
            {/* LEFT: home icon (image or abbreviation) */}
            <div
              className="flex items-center justify-center shrink-0"
              style={{ width: COLLAPSED_W }}
            >
              {homeInfo?.logo?.url ? (
                <div
                  className="relative transition-opacity duration-300 group-hover:opacity-50"
                  style={{ width: "36px", height: "36px" }}
                >
                  <Image
                    src={homeInfo.logo.url}
                    alt={homeInfo.name ?? "House of Senses"}
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </div>
              ) : (
                <span
                  className="text-[12px] font-semibold tracking-[0.2em] uppercase transition-opacity duration-300 group-hover:opacity-50"
                  style={{ color: "var(--foreground)" }}
                >
                  {homeAbbrev}
                </span>
              )}
            </div>
            {/* RIGHT: full home brand name or logo image */}
            <div
              className="flex flex-col pr-6 transition-opacity duration-200"
              style={fadeIn}
            >
              {homeInfo?.logo?.url ? (
                <div className="relative" style={{ width: "130px", height: "44px" }}>
                  <Image
                    src={homeInfo.logo.url}
                    alt={homeInfo.name ?? "House of Senses"}
                    fill
                    style={{ objectFit: "contain", objectPosition: "left center" }}
                    className="transition-opacity duration-300 group-hover:opacity-60"
                  />
                </div>
              ) : (
                <span
                  className="text-[16px] font-semibold tracking-[0.28em] uppercase leading-none transition-opacity duration-300 group-hover:opacity-60"
                  style={{
                    color: "var(--foreground)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {homeInfo?.name ?? "House of Senses"}
                </span>
              )}
            </div>
          </Link>

          {/* Micro-gap between the two logos */}
          <div className="h-4" />

          {/* Tenant logo — smaller, below */}
          {tenant && (
            <Link
              href="/"
              className="flex items-center group focus:outline-none"
              aria-label={`${tenant.name} location`}
            >
              {/* LEFT: tenant icon (image or abbreviation) */}
              <div
                className="flex items-center justify-center shrink-0"
                style={{ width: COLLAPSED_W }}
              >
                {tenant.logo?.url ? (
                  <div
                    className="relative transition-opacity duration-300 group-hover:opacity-50"
                    style={{ width: "26px", height: "26px" }}
                  >
                    <Image
                      src={tenant.logo.url}
                      alt={tenant.name}
                      fill
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                ) : (
                  <span
                    className="text-[9px] font-medium tracking-[0.22em] uppercase transition-opacity duration-300 group-hover:opacity-50"
                    style={{ color: "var(--foreground)", opacity: 0.65 }}
                  >
                    {tenantAbbrev}
                  </span>
                )}
              </div>
              {/* RIGHT: tenant name or logo image + address */}
              <div
                className="flex flex-col pr-6 transition-opacity duration-200"
                style={fadeIn}
              >
                {tenant.logo?.url ? (
                  <div className="relative" style={{ width: "100px", height: "30px" }}>
                    <Image
                      src={tenant.logo.url}
                      alt={tenant.name}
                      fill
                      style={{ objectFit: "contain", objectPosition: "left center" }}
                      className="transition-opacity duration-300 group-hover:opacity-60"
                    />
                  </div>
                ) : (
                  <span
                    className="text-[11px] font-medium tracking-[0.26em] uppercase leading-none transition-opacity duration-300 group-hover:opacity-60"
                    style={{ color: "var(--foreground)", opacity: 0.75 }}
                  >
                    {tenant.name}
                  </span>
                )}
                {tenant.address && (
                  <span
                    className="text-[9px] tracking-[0.18em] mt-1.5"
                    style={{ color: "var(--foreground)", opacity: 0.45 }}
                  >
                    {tenant.address.split(",")[0]}
                  </span>
                )}
              </div>
            </Link>
          )}
        </div>

        {/* Separator */}
        <div
          className="shrink-0 h-px"
          style={{
            marginLeft: COLLAPSED_W,
            marginRight: "1.5rem",
            background:
              "linear-gradient(to right, var(--color-gold), transparent)",
            opacity: isExpanded ? 0.28 : 0,
            transition: "opacity 300ms",
          }}
        />

        {/* ── Nav links — fill remaining height evenly ── */}
        <nav
          className="flex flex-col flex-1 justify-evenly py-4"
          aria-label="Site navigation"
        >
          {NAV_LINKS.map(({ href, label }, i) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center w-full group focus:outline-none relative"
              >
                {/* Active indicator — left edge of the collapsed strip */}
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 transition-opacity duration-300"
                  style={{
                    backgroundColor: "var(--color-gold)",
                    opacity: isActive ? 0.9 : 0,
                  }}
                />
                {/* LEFT: number — always visible */}
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{ width: COLLAPSED_W }}
                >
                  <span
                    className="text-[9px] tracking-[0.3em] tabular-nums transition-opacity duration-200"
                    style={{
                      color: "var(--foreground)",
                      opacity: isActive ? 1 : 0.4,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                {/* RIGHT: label — fades in when expanded */}
                <span
                  className="text-[11px] tracking-[0.24em] uppercase pr-6 transition-opacity duration-200 group-hover:opacity-40"
                  style={{
                    color: "var(--foreground)",
                    opacity: isExpanded ? (isActive ? 1 : 0.82) : 0,
                    fontWeight: isActive ? 600 : 400,
                    transitionDelay: isExpanded ? "60ms" : "0ms",
                  }}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* ── Reserve button — fades in when expanded ── */}
        <div
          className="pb-10 shrink-0 transition-opacity duration-200"
          style={{
            paddingLeft: COLLAPSED_W,
            paddingRight: "1.5rem",
            opacity: isExpanded ? 1 : 0,
            transitionDelay: isExpanded ? "80ms" : "0ms",
          }}
        >
          <div
            className="h-px mb-6"
            style={{
              background:
                "linear-gradient(to right, var(--color-gold), transparent)",
              opacity: 0.28,
            }}
          />
          <Link
            href="/reservation"
            className="flex items-center justify-center w-full py-3 text-[9px] tracking-[0.34em] uppercase font-medium transition-opacity duration-300 hover:opacity-60 focus:outline-none"
            style={{
              border:
                "1px solid color-mix(in srgb, var(--color-gold) 55%, transparent)",
              color: "var(--foreground)",
            }}
            aria-label="Make a reservation"
          >
            Reserve
          </Link>
        </div>
      </div>
    </aside>
  );
}
