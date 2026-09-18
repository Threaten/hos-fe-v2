"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { mediaUrl } from "@/lib/media";
import type { GalleryItem, Tenant } from "@/types/payload";

function getPhotoColSpan(index: number, total: number): string {
  if (total <= 1) return "col-span-12";

  if (total === 2) {
    return index === 0
      ? "col-span-12 lg:col-span-7"
      : "col-span-12 lg:col-span-5";
  }

  if (total === 3) {
    if (index === 0) return "col-span-12 lg:col-span-7";
    if (index === 1) return "col-span-12 sm:col-span-6 lg:col-span-5";
    return "col-span-12";
  }

  if (total === 4) {
    if (index === 0) return "col-span-12 lg:col-span-7";
    if (index === 1) return "col-span-12 lg:col-span-5";
    return "col-span-12 sm:col-span-6 lg:col-span-6";
  }

  if (total === 5) {
    if (index === 0) return "col-span-12 lg:col-span-7";
    if (index === 1) return "col-span-12 lg:col-span-5";
    return "col-span-12 sm:col-span-4 lg:col-span-4";
  }

  if (total === 6) {
    if (index === 0) return "col-span-12 lg:col-span-7";
    if (index === 1) return "col-span-12 lg:col-span-5";
    if (index === 2 || index === 3 || index === 4) {
      return "col-span-12 sm:col-span-4 lg:col-span-4";
    }
    return "col-span-12";
  }

  // 7 or more photos
  if (index === 0) return "col-span-12 lg:col-span-7";
  if (index === 1) return "col-span-12 lg:col-span-5";
  if (index === 2 || index === 3 || index === 4) {
    return "col-span-12 sm:col-span-4 lg:col-span-4";
  }
  if (index === 5 || index === 6) {
    return "col-span-12 sm:col-span-6 lg:col-span-6";
  }
  return "col-span-12";
}

function getPhotoAspectRatio(index: number, total: number): string {
  if (total === 1) return "aspect-[16/10]";
  if (
    (total === 3 && index === 2) ||
    (total === 6 && index === 5) ||
    index === 7
  ) {
    return "aspect-[16/9] sm:aspect-[21/9]";
  }

  switch (index) {
    case 0:
      return "aspect-[16/11]";
    case 1:
      return "aspect-[4/5]";
    case 2:
      return "aspect-[4/5]";
    case 3:
      return "aspect-square";
    case 4:
      return "aspect-[4/5]";
    case 5:
    case 6:
      return "aspect-[16/10]";
    default:
      return "aspect-[16/10]";
  }
}

export function GallerySection({
  tenant,
  items,
}: {
  tenant: Tenant;
  items: GalleryItem[];
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const photos = [
    ...(mediaUrl(tenant.homeGalleryImage)
      ? [
          {
            id: "home",
            image: tenant.homeGalleryImage,
            caption: "At the table",
          },
        ]
      : []),
    ...items,
  ]
    .filter((item) => mediaUrl(item.image))
    .slice(0, 8);

  const closeLightbox = useCallback(() => setActiveIndex(null), []);
  const prevPhoto = useCallback(() => {
    setActiveIndex((curr) =>
      curr !== null ? (curr > 0 ? curr - 1 : photos.length - 1) : null,
    );
  }, [photos.length]);
  const nextPhoto = useCallback(() => {
    setActiveIndex((curr) =>
      curr !== null ? (curr < photos.length - 1 ? curr + 1 : 0) : null,
    );
  }, [photos.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (activeIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevPhoto();
      if (e.key === "ArrowRight") nextPhoto();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIndex, closeLightbox, prevPhoto, nextPhoto]);

  if (!photos.length) return null;

  return (
    <section
      className="restaurant-diary border-b border-border/70"
      id="gallery"
    >
      <div className="diary-heading">
        <div className="diary-heading-meta">
          <p className="eyebrow text-primary">02 / Collected Moments</p>
          <span className="text-xs text-foreground/50 tracking-wider uppercase block mt-1">
            {tenant.name} • The Archive
          </span>
        </div>
        <div className="diary-heading-body">
          <h2 className="font-heading text-foreground">
            {tenant.galleryTitle || "Life around the table."}
          </h2>
          {tenant.galleryText ? (
            <p className="diary-description text-foreground/75 leading-relaxed">
              {tenant.galleryText}
            </p>
          ) : null}
        </div>
      </div>

      {/* Dense Salon Photo Wall */}
      <div className="diary-photographs">
        {photos.map((item, i) => {
          const formattedIndex = String(i + 1).padStart(2, "0");
          const colSpan = getPhotoColSpan(i, photos.length);
          const aspectRatio = getPhotoAspectRatio(i, photos.length);
          return (
            <figure
              key={item.id}
              role="button"
              tabIndex={0}
              aria-label={`View photo Plate ${formattedIndex}: ${item.caption || "A quiet moment"}`}
              className={`diary-photo ${colSpan} group cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-xs`}
              onClick={() => setActiveIndex(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveIndex(i);
                }
              }}
            >
              <div
                className={`diary-image ${aspectRatio} rounded-xs overflow-hidden relative shadow-xs border border-border/30 transition-all duration-500 group-hover:shadow-md group-hover:border-border`}
              >
                <Image
                  src={mediaUrl(item.image)}
                  alt={
                    item.image?.alt ||
                    item.caption ||
                    `${tenant.name}, a quiet moment`
                  }
                  fill
                  sizes={
                    i === 0
                      ? "(min-width: 1024px) 60vw, 100vw"
                      : colSpan.includes("lg:col-span-4")
                        ? "(min-width: 1024px) 33vw, 100vw"
                        : "(min-width: 1024px) 45vw, 100vw"
                  }
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="p-2.5 rounded-full bg-white/85 text-stone-900 backdrop-blur-xs shadow-md">
                    <Maximize2 className="h-4 w-4" />
                  </span>
                </div>
              </div>
              <figcaption className="flex items-center justify-between text-xs text-foreground/75 pt-2.5">
                <span className="font-heading text-foreground/70 tabular-nums">
                  Plate {formattedIndex}
                </span>
                <span className="tracking-wide">
                  {item.caption || "The small things, remembered."}
                </span>
              </figcaption>
            </figure>
          );
        })}
      </div>

      {/* Interactive Lightbox Modal */}
      {activeIndex !== null && photos[activeIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-6 sm:p-10 animate-in fade-in duration-300"
          role="dialog"
          aria-modal="true"
          aria-label="Photo lightbox preview"
        >
          {/* Lightbox Header */}
          <div className="flex items-center justify-between text-white/90 z-10">
            <div>
              <span className="eyebrow text-white/80">
                {tenant.name} / Gallery
              </span>
              <p className="font-heading text-lg sm:text-xl text-white">
                {photos[activeIndex].caption || "Life around the table"}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs tracking-widest text-white/80 tabular-nums font-mono">
                {String(activeIndex + 1).padStart(2, "0")} /{" "}
                {String(photos.length).padStart(2, "0")}
              </span>
              <button
                onClick={closeLightbox}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Close image preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Image Container */}
          <div className="relative flex-1 my-4 flex items-center justify-center">
            <div className="relative w-full h-full max-h-[75vh] max-w-5xl">
              <Image
                src={mediaUrl(photos[activeIndex].image)}
                alt={
                  photos[activeIndex].image?.alt ||
                  photos[activeIndex].caption ||
                  "Gallery image"
                }
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>

            {/* Navigation buttons */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevPhoto();
              }}
              className="absolute left-2 sm:left-6 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors border border-white/25 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Previous photograph"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextPhoto();
              }}
              className="absolute right-2 sm:right-6 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors border border-white/25 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Next photograph"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Lightbox Footer */}
          <div className="flex items-center justify-between text-xs text-white/80 border-t border-white/20 pt-4 z-10">
            <span>Use arrow keys to navigate • Press Esc to close</span>
            <span>House of Senses Monograph</span>
          </div>
        </div>
      )}
    </section>
  );
}
