"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Tenant } from "@/api/queries";

interface GalleryImage {
  src: string;
  alt: string;
  branch: string;
  caption: string;
}

interface GalleryProps {
  images?: GalleryImage[];
  galleryText?: string;
  tenant?: Tenant | null;
}

const Gallery = ({ images = [], galleryText, tenant }: GalleryProps) => {
  const title = tenant?.galleryTitle || "It's always more than good food";
  const text =
    galleryText ||
    "Tucked away in a quiet corner of the city, House of Senses is where meals unfold slowly and conversations linger a little longer. What began as a small dining space has grown into a gathering place for friends, families, first dates, and familiar faces returning time and again. We believe good food is only part of the experience — the rest lives in the atmosphere, the people around the table, and the moments shared between courses.";

  const featuredImage = images.find((img) => img.src);

  return (
    <section
      className="w-full flex flex-col items-center hos-gutter pt-20 pb-24 md:pt-[112px] md:pb-[100px]"
      style={{ backgroundColor: "var(--color-main)", color: "var(--color-on-main)" }}
      aria-labelledby="gallery-heading"
    >
      <h2 id="gallery-heading" className="hos-display text-center text-balance md:max-w-[8.2em]" data-reveal>
        {title}
      </h2>

      {featuredImage && (
        <div className="relative w-full md:w-[263px] aspect-[263/365] mt-8 md:mt-[33px] overflow-hidden" data-reveal="image">
          <Image
            src={featuredImage.src}
            alt={featuredImage.alt || ""}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 263px"
          />
        </div>
      )}

      <p className="text-center mt-8 md:mt-[51px] max-w-[961px] text-pretty" data-reveal>{text}</p>

      <Link
        href="/about"
        className="hos-btn hos-btn-outline mt-10 md:mt-[15px] min-w-[140px] md:min-w-[157px]"
        style={{ ["--btn-hover-ink" as string]: "var(--color-main)", ["--reveal-delay" as string]: "0.1s" }}
        data-reveal
      >
        <span>About us</span>
      </Link>
    </section>
  );
};

export default Gallery;
