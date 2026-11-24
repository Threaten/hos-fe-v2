"use client";

import React from "react";
import Link from "next/link";
import type { Tenant } from "@/api/queries";
import OpeningStatus from "@/app/components/OpeningStatus";
import { ArrowRight } from "../../components/Icons";
import ReservationLink from "../../components/ReservationLink";
import { mapsUrl } from "@/app/utils/maps";
import { useT, useTranslated } from "@/app/i18n/useT";


interface HeroProps {
  tenant?: Tenant | null;
}

/** Big headline in the branch colour, with the practical details beside it */
const Hero: React.FC<HeroProps> = ({ tenant: source }) => {
  const tenant = useTranslated(source);
  // The CMS writes titles like "Red_Space"; the underscore is a line break
  const title = (tenant?.heroTitle || tenant?.name || "House of Senses").toLowerCase();
  const lines = title.split(/_+/).map((p) => p.trim()).filter(Boolean);
  const name = tenant?.name ?? "House of Senses";
  const description = tenant?.heroDescription;
  const t = useT();

  return (
    <section className="hs-shell pt-8 md:pt-12 pb-10 md:pb-16" aria-label={name}>
      <div className="hs-main grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,300px)] gap-x-10 gap-y-8 items-start">
        <h1 className="hs-hero animate-rise text-center lg:text-left">
          {lines.map((line, i) => (
            <span key={`${line}-${i}`} className="block">
              {line}
              {i < lines.length - 1 && <span className="sr-only"> </span>}
            </span>
          ))}
        </h1>

        <div className="xl:pt-3 text-center lg:text-left mx-auto lg:mx-0 max-w-[34ch] animate-rise" style={{ color: "var(--pen)" }}>
          {tenant?.heroSubtitle && <p className="hs-ui mb-4">{tenant.heroSubtitle}</p>}
          {description && <p className="text-[1.1875rem] leading-[1.25] tracking-[-0.015em]">{description}</p>}
          {tenant && (
            <p className="text-[1.1875rem] leading-[1.25] tracking-[-0.015em] mt-4">
              <OpeningStatus branch={tenant} showDetail />
              {tenant.address && (
                <>
                  {" "}{t("at")}{" "}
                  <a href={mapsUrl(tenant)} target="_blank" rel="noopener noreferrer" className="hs-link">
                    {tenant.address.toLowerCase()}
                  </a>
                </>
              )}
            </p>
          )}
          <div className="flex flex-wrap justify-center lg:justify-start gap-2.5 mt-7">
            <ReservationLink className="hs-btn hs-btn-solid hs-btn-sm">
              {t("Book a table")} <ArrowRight />
            </ReservationLink>
            <Link href="/menu" className="hs-btn hs-btn-sm">
              {t("The menu")} <ArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
