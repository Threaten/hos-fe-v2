"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Tenant } from "@/api/queries";
import InstagramEmbed from "../../components/InstagramEmbed";

interface MomentImage {
  src: string;
  alt: string;
}

interface MomentsProps {
  images?: MomentImage[];
  tenant?: Tenant | null;
}

/**
 * Reference "… moments" block: a slider framed in the brand color,
 * scroll-snap based so it also swipes natively on touch devices.
 */
export default function Moments({ images = [], tenant }: MomentsProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const slides = images.filter((img) => img.src);
  const name = tenant?.name || "House of Senses";

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update, slides.length]);

  const step = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const slide = el.querySelector("li");
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const width = slide ? slide.getBoundingClientRect().width + gap : el.clientWidth;
    el.scrollBy({ left: dir * width, behavior: "smooth" });
  };

  if (slides.length === 0) return null;

  return (
    <section className="w-full bg-paper pt-14 md:pt-[82px] pb-16 md:pb-[73px]" aria-labelledby="moments-heading">
      <h2
        id="moments-heading"
        className="hos-display text-center hos-gutter"
        style={{ color: "var(--color-main)" }}
        data-reveal
      >
        {name} moments
      </h2>

      <div className="hos-gutter mt-6 md:mt-[34px]">
        <div className="relative mx-auto w-full max-w-[852px]" data-reveal style={{ ["--reveal-delay" as string]: "0.1s" }}>
          <ul
            ref={trackRef}
            onScroll={update}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label={`${name} photos`}
          >
            {slides.map((img, i) => (
              <li
                key={`${img.src}-${i}`}
                className="relative shrink-0 snap-start w-full aspect-[294/435] md:w-[403px] md:aspect-square overflow-hidden"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  loading="lazy"
                  className="object-cover"
                  sizes="(max-width: 768px) 90vw, 403px"
                />
              </li>
            ))}
          </ul>

          {canPrev && (
            <button
              onClick={() => step(-1)}
              className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-[31px] h-[31px] md:w-[36px] md:h-[36px] rounded-full bg-paper flex items-center justify-center transition-transform duration-300 hover:scale-105"
              style={{ color: "var(--foreground)" }}
              aria-label="Previous photo"
            >
              <ChevronLeft strokeWidth={1.25} className="w-5 h-5" />
            </button>
          )}
          {canNext && (
            <button
              onClick={() => step(1)}
              className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 w-[31px] h-[31px] md:w-[36px] md:h-[36px] rounded-full bg-paper flex items-center justify-center transition-transform duration-300 hover:scale-105"
              style={{ color: "var(--foreground)" }}
              aria-label="Next photo"
            >
              <ChevronRight strokeWidth={1.25} className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 md:mt-[63px]">
        <InstagramEmbed tenant={tenant} />
      </div>
    </section>
  );
}
