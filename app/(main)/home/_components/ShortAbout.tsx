"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Tenant } from "@/api/queries";
import { API_URL } from "@/app/utils/constants";

interface ShortAboutProps {
  tenant?: Tenant | null;
}

const ShortAbout: React.FC<ShortAboutProps> = ({ tenant }) => {
  const title =
    tenant?.shortAboutTitle ||
    "More than a restaurant — a space to reconnect, unwind, and stay awhile. Where thoughtful food and unhurried moments come together.";

  const images =
    tenant?.shortAboutCollages
      ?.filter((item) => item.image?.url)
      .slice(0, 4)
      .map((item) => `${API_URL}${item.image!.url}`) ?? [];

  return (
    <section className="w-full bg-paper pt-20 md:pt-[78px] pb-6 md:pb-[56px]" aria-labelledby="our-menu-heading">
      <div className="hos-gutter flex flex-col md:flex-row md:items-end md:justify-between gap-8 md:gap-10">
        <div className="max-w-[1093px]" data-reveal>
          <h2 id="our-menu-heading" className="hos-label mb-3 md:mb-[11px]" style={{ color: "var(--foreground)" }}>
            Our menu
          </h2>
          <p className="hos-display text-balance" style={{ color: "var(--color-main)" }}>
            {title}
          </p>
        </div>
        <Link
          href="/menu"
          className="hos-btn hos-btn-solid self-start md:self-end shrink-0 md:mb-[8px]"
          style={{ minWidth: 0, paddingInline: "1.55em", ["--reveal-delay" as string]: "0.15s" }}
          data-reveal
        >
          Explore menu
          <ArrowUpRight aria-hidden="true" strokeWidth={1.25} className="w-[1.05em] h-[1.05em]" />
        </Link>
      </div>

      <div className="mt-8 md:mt-[27px] grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-[11px] hos-gutter" data-reveal-stagger>
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="group relative w-full overflow-hidden aspect-[342/300] md:aspect-square"
            style={{ backgroundColor: "var(--paper-2)" }}
            data-reveal="image"
          >
            {images[idx] && (
              <Image
                src={images[idx]}
                alt=""
                fill
                loading="lazy"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 100vw, 25vw"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default ShortAbout;
