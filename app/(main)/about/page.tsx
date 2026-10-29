"use client";

import React from "react";
import SkeletonImage from "@/app/components/SkeletonImage";
import CTA from "../components/CTA";
import RichTextRenderer from "../../components/RichTextRenderer";
import { useTenant } from "@/app/contexts/TenantContext";
import { resolveBackendMediaUrl } from "@/app/utils/media";

export default function AboutPage() {
  const { tenant } = useTenant();

  const tenantName = tenant ? tenant.name.toLowerCase() : "houseofsenses.vn";
  const aboutTitle = tenant?.aboutTitle || `About ${tenantName}`;
  const aboutSubtitle =
    tenant?.aboutSubtitle || "A Journey of Culinary Excellence";
  const heroSrc = resolveBackendMediaUrl(tenant?.aboutusHero) || "/media/IMG_0050.JPG";

  return (
    <div className="bg-paper">
      <section className="hos-gutter pt-12 md:pt-[78px]" aria-labelledby="about-heading">
        <p className="hos-label mb-3" style={{ color: "var(--foreground)" }}>
          Our story
        </p>
        <h1
          id="about-heading"
          className="font-serif text-balance max-w-[14ch]"
          style={{
            fontSize: "clamp(3rem, 8.5vw, 8.5rem)",
            lineHeight: 0.92,
            letterSpacing: "-0.02em",
            color: "var(--color-main)",
          }}
        >
          {aboutTitle}
        </h1>
        <p className="mt-5 max-w-[48ch]" style={{ color: "var(--color-ink)" }}>
          {aboutSubtitle}
        </p>
      </section>

      <div className="hos-gutter mt-10 md:mt-[56px]">
        <div
          className="hos-hero-media relative w-full aspect-[342/300] md:aspect-[1418/640] overflow-hidden"
          style={{ backgroundColor: "var(--paper-2)" }}
        >
          <SkeletonImage
            src={heroSrc}
            alt={`${tenantName} dining room`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </div>

      <section className="hos-gutter py-16 md:py-[112px]">
        {tenant?.aboutus ? (
          <div className="grid md:grid-cols-[50%_1fr]" data-reveal>
            <h2 className="hos-display mb-8 md:mb-0" style={{ color: "var(--color-main)" }}>
              The story so far
            </h2>
            <RichTextRenderer
              data={tenant.aboutus}
              className="max-w-[65ch]"
            />
          </div>
        ) : (
          <div className="grid md:grid-cols-[50%_1fr] gap-y-8" data-reveal>
            <h2 className="hos-display" style={{ color: "var(--color-main)" }}>
              Our story
            </h2>
            <div className="max-w-[65ch] flex flex-col gap-5" style={{ color: "var(--color-ink)" }}>
              <p>
                {tenantName} was born from a passion for creating unforgettable
                dining experiences: a place where food and atmosphere conspire
                to make every visit feel like coming home.
              </p>
              <p>
                Every dish we serve tells a story, combining the warmth of
                traditional techniques with the curiosity of contemporary
                flavors.
              </p>
              <p>
                We believe that great food brings people together. That is the
                only philosophy that has ever guided us.
              </p>
            </div>
          </div>
        )}
      </section>

      <CTA />
    </div>
  );
}
