"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useTenant } from "@/app/contexts/TenantContext";

const CTA = () => {
  const { tenant } = useTenant();

  const tenantName = tenant ? tenant.name.toLowerCase() : "houseofsenses.vn";
  const ctaTitle = tenant?.ctaTitle || `Plan a visit to ${tenantName}`;
  const ctaText =
    tenant?.ctaText || "Choose a branch, book a table, or browse the latest menu.";

  return (
    <section
      className="hos-gutter bg-paper pt-20 md:pt-[112px] pb-20 md:pb-[100px] border-t hos-rule"
      style={{ borderColor: "var(--color-line)" }}
      aria-labelledby="cta-heading"
    >
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 md:gap-10">
        <div className="max-w-[1093px]" data-reveal>
          <p className="hos-label mb-3" style={{ color: "var(--foreground)" }}>
            Make it memorable
          </p>
          <h2 id="cta-heading" className="hos-display text-balance" style={{ color: "var(--color-main)" }}>
            {ctaTitle}
          </h2>
          <p className="mt-4 max-w-[60ch]" style={{ color: "var(--color-ink)" }}>
            {ctaText}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-[11px] shrink-0" data-reveal style={{ ["--reveal-delay" as string]: "0.15s" }}>
          <Link
            href="/reservation"
            className="hos-btn hos-btn-solid"
            aria-label={`Make a reservation at ${tenantName}`}
          >
            Book a table
          </Link>
          <Link
            href="/menu"
            className="hos-btn hos-btn-outline"
            style={{ color: "var(--color-main)" }}
            aria-label={`View ${tenantName}'s menu`}
          >
            <span>Explore menu</span>
            <ArrowUpRight aria-hidden="true" strokeWidth={1.25} className="w-[1.05em] h-[1.05em]" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTA;
