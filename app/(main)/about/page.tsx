"use client";

import React from "react";
import CTA from "../components/CTA";
import Tile from "../components/Tile";
import RichTextRenderer from "../../components/RichTextRenderer";
import { useTenant } from "@/app/contexts/TenantContext";
import { toImage } from "@/app/utils/photos";
import type { CollectionImage } from "../home/_components/Collection";

type StoryState = React.ComponentProps<typeof RichTextRenderer>["data"];

/** About how many paragraphs sit beside each photo */
const PER_PASSAGE = 4;

/**
 * Cut the story into passages of even length so photos can sit between
 * them (10 paragraphs → 3 + 4 + 3). A heading always starts a new passage.
 */
function toPassages(state: StoryState): StoryState[] {
  const nodes = (state?.root?.children ?? []) as Array<{ type?: string }>;
  const total = nodes.filter((n) => n.type !== "heading").length;
  const count = Math.max(1, Math.round(total / PER_PASSAGE));
  const breaks = new Set(Array.from({ length: count - 1 }, (_, k) => Math.round(((k + 1) * total) / count)));
  const passages: (typeof nodes)[] = [];
  let current: typeof nodes = [];
  let paragraphs = 0; // within the passage
  let seen = 0; // in the whole story
  for (const node of nodes) {
    const isHeading = node.type === "heading";
    if (current.length && (isHeading || (breaks.has(seen) && paragraphs > 0 && current[current.length - 1]?.type !== "heading"))) {
      passages.push(current);
      current = [];
      paragraphs = 0;
    }
    current.push(node);
    if (!isHeading) {
      paragraphs++;
      seen++;
    }
  }
  if (current.length) {
    // A lone closing paragraph joins the passage before it rather than
    // getting a photo of its own
    const last = passages[passages.length - 1];
    if (last && paragraphs < 2 && current[0]?.type !== "heading") last.push(...current);
    else passages.push(current);
  }
  return passages.map((children) => ({ ...state, root: { ...state.root, children } }) as StoryState);
}

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

  // Story photos chosen in the CMS first, then the branch's other photos;
  // never the lead photo twice, never the same photo twice
  const seen = new Set([hero.src]);
  const photos: CollectionImage[] = [
    ...(tenant?.aboutPhotos ?? []),
    ...(tenant?.photoSets ?? []).flatMap((set) => set.photos ?? []),
  ].flatMap((photo, i) => {
    const img = toImage(photo, `${tenantName}, photo ${i + 1}`);
    if (!img || seen.has(img.src)) return [];
    seen.add(img.src);
    return [img];
  });

  const passages = tenant?.aboutus ? toPassages(tenant.aboutus) : [];
  const rows = passages.map((passage, i) => ({ passage, photo: photos[i] }));
  // Photos the passages did not use close the story as a strip of three
  const strip = photos.slice(rows.length, rows.length + 3);

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

      {/* The story: short passages, each beside a photo, alternating sides */}
      <section className="hs-shell pt-14 md:pt-20" aria-labelledby="story-heading">
        <h2 id="story-heading" className="hs-label mb-8 lg:mb-0">
          <span className="hs-rail-sticky block">How it began</span>
        </h2>
        <div className="hs-main flex flex-col gap-14 md:gap-20">
          {rows.length === 0 && (
            <div className="richtext-content max-w-[44ch]" data-reveal>
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

          {rows.map(({ passage, photo }, i) => {
            const photoFirst = i % 2 === 1;
            return (
              <div
                key={i}
                className={`grid grid-cols-1 gap-y-8 gap-x-[clamp(32px,4vw,64px)] items-center ${
                  photo ? "lg:grid-cols-2" : ""
                }`}
              >
                <div data-reveal className={photo && photoFirst ? "lg:order-2" : ""}>
                  <RichTextRenderer data={passage} className={`${photo ? "" : "max-w-[44ch]"} [&>*:first-child]:mt-0 [&>*:last-child]:mb-0`} />
                </div>
                {photo && (
                  <div data-reveal style={{ ["--reveal-delay" as string]: "0.08s" }} className={photoFirst ? "lg:order-1" : ""}>
                    <Tile
                      src={photo.src}
                      alt={photo.alt}
                      aspect="3 / 2"
                      title={photo.caption}
                      sizes="(max-width: 1024px) 92vw, 40vw"
                    />
                  </div>
                )}
              </div>
            );
          })}

          {strip.length > 0 && (
            <ul className="grid grid-cols-2 lg:grid-cols-3 gap-x-3 md:gap-x-5 gap-y-8" data-reveal-stagger>
              {strip.map((img, i) => (
                <li key={img.src} data-reveal className={strip.length === 3 && i === 2 ? "col-span-2 lg:col-span-1" : ""}>
                  <Tile src={img.src} alt={img.alt} aspect="15 / 16" title={img.caption} sizes="(max-width: 1024px) 46vw, 26vw" />
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
