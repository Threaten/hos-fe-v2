"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import SkeletonImage from "@/app/components/SkeletonImage";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { resolveBackendMediaUrl } from "@/app/utils/media";

interface NewMenuImage {
  src?: {
    url: string;
    filename: string;
  };
  id?: string;
}

interface NewMenuModalProps {
  images: NewMenuImage[];
  isOpen: boolean;
  onClose: () => void;
  tenantName?: string;
}

export default function NewMenuModal({
  images,
  isOpen,
  onClose,
  tenantName,
}: NewMenuModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Thumbnails wait for the main image so they don't compete with it for bandwidth
  const [mainLoaded, setMainLoaded] = useState(false);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrevious, onClose]);

  if (!isOpen) {
    return null;
  }

  if (images.length === 0) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      key={isOpen ? "open" : "closed"}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "color-mix(in oklab, var(--foreground) 82%, transparent)" }}
      onClick={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="updates-heading"
        className="relative w-full max-w-4xl mx-4 bg-paper overflow-hidden animate-rise"
      >
        <div className="flex items-start justify-between gap-6 px-5 md:px-8 pt-5 md:pt-7 pb-4">
          <div>
            <h2 id="updates-heading" className="hos-display" style={{ color: "var(--color-main)" }}>
              What&apos;s new
            </h2>
            {tenantName && (
              <p className="mt-1" style={{ color: "var(--color-ink)" }}>
                Recent notes from {tenantName.toLowerCase()}
                {images.length > 1 && (
                  <span style={{ color: "var(--color-ink-muted)" }}>
                    {" "}· {currentIndex + 1} / {images.length}
                  </span>
                )}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-10 h-10 flex items-center justify-center transition-opacity duration-300 hover:opacity-60"
            style={{ color: "var(--foreground)" }}
            aria-label="Close updates"
          >
            <X strokeWidth={1.25} className="w-7 h-7" />
          </button>
        </div>

        <div className="relative px-5 md:px-8">
          <div
            className="relative w-full h-[50vh] md:h-[60vh] flex items-center justify-center bg-paper"
          >
            {images[currentIndex]?.src?.url && (
              <SkeletonImage
                src={resolveBackendMediaUrl(images[currentIndex].src)}
                alt={`${tenantName || "Update"} page ${currentIndex + 1}`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 80vw"
                className="object-contain"
                onLoad={() => setMainLoaded(true)}
              />
            )}
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-8 md:left-12 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-paper flex items-center justify-center transition-transform duration-300 hover:scale-105"
                style={{ color: "var(--foreground)" }}
                aria-label="Previous update"
              >
                <ChevronLeft strokeWidth={1.25} className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-8 md:right-12 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-paper flex items-center justify-center transition-transform duration-300 hover:scale-105"
                style={{ color: "var(--foreground)" }}
                aria-label="Next update"
              >
                <ChevronRight strokeWidth={1.25} className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="px-5 md:px-8 pt-4 pb-5 md:pb-7">
            <div className="flex gap-[11px] overflow-x-auto pb-1">
              {images.map((image, index) => (
                <button
                  key={image.id || index}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Show update ${index + 1}`}
                  aria-current={currentIndex === index ? "true" : undefined}
                  className="relative shrink-0 w-16 h-16 md:w-20 md:h-20 overflow-hidden transition-opacity duration-300"
                  style={{
                    outline: currentIndex === index ? "1px solid var(--color-main)" : "none",
                    outlineOffset: 3,
                    opacity: currentIndex === index ? 1 : 0.6,
                  }}
                >
                  {mainLoaded && image.src?.url && (
                    <SkeletonImage
                      src={resolveBackendMediaUrl(image.src)}
                      alt=""
                      fill
                      quality={60}
                      sizes="80px"
                      className="object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
        {images.length <= 1 && <div className="h-5 md:h-7" />}
      </div>
    </div>
  );
}
