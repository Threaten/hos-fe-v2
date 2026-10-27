"use client";
import React, { useState, useEffect, useRef } from "react";
import CTA from "../components/CTA";
import ImageLightbox from "../components/ImageLightbox";
import { fetchGallery, type GalleryItem, API_URL } from "@/api/queries";

// Editorial grid: every 5th image is a wide landscape, others are portrait
function getSpanClass(index: number) {
  return index % 5 === 0 ? "col-span-2" : "col-span-1";
}
function getAspectRatio(index: number): string {
  return index % 5 === 0 ? "16/9" : "4/5";
}

// Skeleton mirrors the editorial pattern
const SKELETON_SPANS = Array.from({ length: 10 }, (_, i) =>
  i % 5 === 0 ? 2 : 1,
);

const Gallery = () => {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadedSet, setLoadedSet] = useState<Set<string>>(new Set());
  const [revealedSet, setRevealedSet] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    fetchGallery().then((data) => {
      setImages(data);
      setLoading(false);
    });
  }, []);

  // Intersection observer for scroll-reveal — runs after images render
  useEffect(() => {
    if (images.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        setRevealedSet((prev) => {
          const next = new Set(prev);
          let changed = false;
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = (entry.target as HTMLElement).dataset.galleryId;
              if (id && !next.has(id)) {
                next.add(id);
                changed = true;
                observerRef.current?.unobserve(entry.target);
              }
            }
          });
          return changed ? next : prev;
        });
      },
      { rootMargin: "100px", threshold: 0.05 },
    );

    document
      .querySelectorAll<HTMLElement>("[data-gallery-id]")
      .forEach((el) => {
        observerRef.current?.observe(el);
      });

    return () => observerRef.current?.disconnect();
  }, [images]);

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const handleNext = () => setCurrentImageIndex((p) => (p + 1) % images.length);
  const handlePrev = () =>
    setCurrentImageIndex((p) => (p - 1 + images.length) % images.length);

  const currentImage = images[currentImageIndex];

  return (
    <div className="min-h-screen bg-background">
      {/* Editorial header */}
      <header className="px-8 md:px-12 pt-14 pb-10">
        <p
          className="text-[9px] tracking-[0.42em] uppercase mb-5"
          style={{ color: "var(--color-sand)" }}
        >
          — visual journal
        </p>
        <div className="flex items-end justify-between">
          <h1
            className="text-[clamp(2.5rem,8vw,5rem)] font-semibold leading-[0.9] tracking-tight"
            style={{
              color: "var(--foreground)",
              fontFamily: "var(--font-body)",
            }}
          >
            the gallery
          </h1>
          {!loading && images.length > 0 && (
            <span
              className="text-[11px] tracking-[0.2em] pb-1.5 tabular-nums"
              style={{ color: "var(--color-sand)" }}
            >
              {String(images.length).padStart(2, "0")} images
            </span>
          )}
        </div>
      </header>

      {/* Loading skeleton — mirrors editorial grid */}
      {loading && (
        <div className="px-2 md:px-4 pb-16">
          <div className="grid grid-cols-3 gap-0.5">
            {SKELETON_SPANS.map((span, i) => (
              <div
                key={i}
                className={span === 2 ? "col-span-2" : "col-span-1"}
                style={{ aspectRatio: span === 2 ? "16/9" : "4/5" }}
              >
                <div className="w-full h-full bg-[rgb(220,216,208)] animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && images.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32">
          <p
            className="text-[9px] tracking-[0.42em] uppercase mb-3"
            style={{ color: "var(--color-sand)" }}
          >
            nothing here yet
          </p>
          <p className="text-sm" style={{ color: "var(--color-sand)" }}>
            Images will appear here soon.
          </p>
        </div>
      )}

      {/* Editorial gallery grid */}
      {!loading && images.length > 0 && (
        <div className="px-2 md:px-4 pb-16">
          <div className="grid grid-cols-3 gap-0.5">
            {images.map((item, index) => {
              const span = getSpanClass(index);
              const revealed = revealedSet.has(item.id);
              const staggerDelay = (index % 3) * 70;

              return (
                <div
                  key={item.id}
                  data-gallery-id={item.id}
                  onClick={() => handleImageClick(index)}
                  className={`${span} relative overflow-hidden cursor-pointer group`}
                  style={{
                    aspectRatio: getAspectRatio(index),
                    opacity: revealed ? 1 : 0,
                    transform: revealed ? "translateY(0)" : "translateY(20px)",
                    transition: `opacity 0.6s ease ${staggerDelay}ms, transform 0.6s cubic-bezier(0.25, 0, 0, 1) ${staggerDelay}ms`,
                  }}
                >
                  {/* Loading skeleton */}
                  {!loadedSet.has(item.id) && (
                    <div className="absolute inset-0 bg-[rgb(220,216,208)] animate-pulse z-10" />
                  )}

                  {item.image && (
                    <img
                      src={`${API_URL}${item.image.url}`}
                      alt={item.caption || item.image.alt || ""}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      onLoad={() =>
                        setLoadedSet((prev) => new Set(prev).add(item.id))
                      }
                    />
                  )}

                  {/* Hover veil */}
                  <div className="absolute inset-0 bg-[rgb(23,23,23)]/0 group-hover:bg-[rgb(23,23,23)]/30 transition-colors duration-500" />

                  {/* Branch label — top right, always visible */}
                  {item.branch && (
                    <span className="absolute top-3 right-3 z-20 text-white/75 text-[9px] tracking-[0.22em] uppercase select-none drop-shadow-sm">
                      {item.branch.name.toLowerCase()}
                    </span>
                  )}

                  {/* Caption — slides up on hover */}
                  {item.caption && (
                    <div
                      className="absolute bottom-0 left-0 right-0 px-4 py-3 z-20 translate-y-full group-hover:translate-y-0"
                      style={{
                        transition:
                          "transform 0.45s cubic-bezier(0.25, 0, 0, 1)",
                      }}
                    >
                      <p className="text-white/90 text-xs font-light leading-relaxed tracking-wide">
                        {item.caption}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {currentImage?.image && (
        <ImageLightbox
          isOpen={lightboxOpen}
          imageSrc={`${API_URL}${currentImage.image.url}`}
          imageAlt={
            currentImage.caption || currentImage.image.alt || "Gallery image"
          }
          caption={currentImage.caption}
          branch={currentImage.branch?.name.toLowerCase()}
          onClose={() => setLightboxOpen(false)}
          onNext={handleNext}
          onPrev={handlePrev}
          currentIndex={currentImageIndex}
          totalImages={images.length}
        />
      )}

      <CTA />
    </div>
  );
};

export default Gallery;
