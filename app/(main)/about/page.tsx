"use client";

import React from "react";
import CTA from "../components/CTA";
import Tile from "../components/Tile";
import RichTextRenderer from "../../components/RichTextRenderer";
import { useTenant } from "@/app/contexts/TenantContext";
import { toImage } from "@/app/utils/photos";

export default function AboutPage() {
  const { tenant } = useTenant();

  const tenantName = tenant ? tenant.name.toLowerCase() : "house of senses";
  const aboutTitle = (tenant?.aboutTitle || `About ${tenantName}`).toLowerCase();
  const aboutSubtitle = tenant?.aboutSubtitle || "Food, hospitality, and shared moments";
  const hero = toImage(tenant?.aboutusHero, `Inside ${tenantName}`) ?? {
    src: "/media/IMG_0049.JPG",
    alt: `Inside ${tenantName}`,
    caption: undefined,
  };
  const collage = (tenant?.aboutPhotos ?? [])
    .map((photo, i) => toImage(photo, `${tenantName}, photo ${i + 1}`))
    .filter((img) => img !== null)
    .slice(0, 2);

  return (
    <div>
      {/* Headline */}
      <section className="hs-shell pt-14 md:pt-20 pb-14 md:pb-20" aria-labelledby="about-heading">
        <div className="hs-main grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,300px)] gap-x-10 gap-y-8 items-start">
          <h1 id="about-heading" className="hs-hero animate-rise text-center lg:text-left">
            {aboutTitle}
          </h1>
          <p className="text-[1.1875rem] leading-[1.25] tracking-[-0.015em] xl:pt-3 text-center lg:text-left max-w-[34ch] mx-auto lg:mx-0 animate-rise" style={{ color: "var(--pen)" }}>
            {aboutSubtitle}
          </p>
        </div>
      </section>

      <div className="hs-shell">
        <div className="hs-main">
          <Tile
            src={hero.src}
            alt={hero.alt}
            aspect="16 / 9"
            title={hero.caption}
            priority
            reveal="load"
            sizes="(max-width: 1024px) 96vw, 78vw"
          />
        </div>
      </div>

      {/* The story */}
      <section className="hs-shell pt-[var(--section)]" aria-labelledby="story-heading">
        <h2 id="story-heading" className="hs-label mb-6 lg:mb-0">
          <span className="hs-rail-sticky block">How it began</span>
        </h2>
        <div className="hs-main grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,300px)] gap-x-10 gap-y-14">
          <div data-reveal>
            {tenant?.aboutus ? (
              <RichTextRenderer data={tenant.aboutus} className="max-w-[40ch]" />
            ) : (
              <div className="richtext-content max-w-[40ch]">
                <p>
                  {tenantName} was born from a simple wish: a room where food and
                  company take their time. A place that feels a little like
                  coming home.
                </p>
                <p>
                  Every dish starts from what we would cook for friends,
                  with the warmth of familiar techniques and the curiosity of
                  new flavours.
                </p>
                <blockquote>Good food brings people together. That is the whole idea.</blockquote>
              </div>
            )}
          </div>
          {collage.length > 0 && (
            <ul className="grid grid-cols-2 xl:grid-cols-1 gap-3 md:gap-5 content-start" data-reveal-stagger>
              {collage.map((img) => (
                <li key={img.src} data-reveal>
                  <Tile src={img.src} alt={img.alt} aspect="15 / 16" title={img.caption} sizes="(max-width: 1280px) 46vw, 300px" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <CTA />
    </div>
  );
}
