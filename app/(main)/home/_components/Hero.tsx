"use client";

import React from "react";
import Image from "next/image";
import type { Tenant } from "@/api/queries";
import { API_URL } from "@/app/utils/constants";

interface HeroProps {
  tenant?: Tenant | null;
}

/**
 * Splits "Red_Space" / "red___space" into words joined by a stretched rule,
 * matching the reference's "red ____ space" lockup. Titles without "_" render
 * as plain words.
 */
function HeroTitle({ title }: { title: string }) {
  const parts = title.split(/_+/).filter(Boolean);
  if (parts.length < 2) {
    return <span className="block text-center">{title}</span>;
  }
  return (
    <span className="flex items-baseline w-full">
      {parts.map((part, i) => (
        <React.Fragment key={`${part}-${i}`}>
          {i > 0 && (
            <span
              aria-hidden="true"
              className="flex-1 self-baseline min-w-[0.6em] mx-[-0.02em]"
              style={{
                height: "0.035em",
                backgroundColor: "currentColor",
                borderRadius: "0.02em",
                transform: "translateY(0.09em)",
              }}
            />
          )}
          <span className="whitespace-nowrap">{part.trim()}</span>
        </React.Fragment>
      ))}
    </span>
  );
}

const Hero: React.FC<HeroProps> = ({ tenant }) => {
  const title = tenant?.heroTitle || tenant?.name || "House of Senses";
  const images = (tenant?.heroImagesList ?? [])
    .filter((item) => item.image?.url)
    .slice(0, 2);

  return (
    <section className="w-full bg-paper" aria-label={tenant?.name ?? "House of Senses"}>
      <h1
        className="hos-gutter lowercase font-serif animate-rise"
        style={{
          fontSize: "var(--text-hero)",
          lineHeight: 0.84,
          letterSpacing: "-0.05em",
          color: "var(--color-main)",
          paddingTop: "0.11em",
          // descenders ("p") meet the image row, as in the reference
          paddingBottom: "0.035em",
        }}
      >
        <span className="sr-only">{title.replace(/_+/g, " ")}</span>
        <span aria-hidden="true">
          <HeroTitle title={title} />
        </span>
      </h1>

      <div className="hos-gutter grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-[22px]">
        {images.length > 0
          ? images.map((item, idx) => (
              <div
                key={item.id ?? idx}
                className="relative w-full overflow-hidden aspect-[342/300] md:aspect-[698/731]"
                style={{ backgroundColor: "var(--paper-2)" }}
              >
                <Image
                  src={`${API_URL}${item.image!.url}`}
                  alt={item.image?.filename || ""}
                  fill
                  priority={idx === 0}
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            ))
          : [0, 1].map((idx) => (
              <div
                key={idx}
                className="w-full aspect-[342/300] md:aspect-[698/731]"
                style={{ backgroundColor: "var(--paper-2)" }}
              />
            ))}
      </div>
    </section>
  );
};

export default Hero;
