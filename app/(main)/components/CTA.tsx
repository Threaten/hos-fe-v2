"use client";

import React from "react";
import Link from "next/link";
import { useTenant } from "@/app/contexts/TenantContext";
import { ArrowRight } from "./Icons";

/** Closing invitation to come by */
const CTA = () => {
  const { tenant } = useTenant();

  const tenantName = tenant ? tenant.name.toLowerCase() : "house of senses";
  const ctaTitle = tenant?.ctaTitle || `Plan a visit to ${tenantName}`;
  const ctaText = tenant?.ctaText || "Choose a branch, book a table, or browse the latest menu.";

  return (
    <section className="hs-shell pt-[var(--section)]" aria-labelledby="cta-heading">
      <p className="hs-label mb-6 lg:mb-0 text-center lg:text-left">Visit</p>
      <div className="hs-main text-center lg:text-left" data-reveal>
        <h2 id="cta-heading" className="hs-display max-w-[18ch] mx-auto lg:mx-0" style={{ color: "var(--ink)" }}>
          {ctaTitle}
        </h2>
        <p className="hs-lead mt-6 mx-auto lg:mx-0">{ctaText}</p>
        <div className="flex flex-wrap justify-center lg:justify-start gap-2.5 mt-8">
          <Link href="/reservation" className="hs-btn hs-btn-solid" aria-label={`Make a reservation at ${tenantName}`}>
            Book a table <ArrowRight />
          </Link>
          <Link href="/menu" className="hs-btn" aria-label={`View ${tenantName}'s menu`}>
            See the menu <ArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTA;
