"use client";

import React, { useState, useEffect, useCallback } from "react";
import SkeletonImage from "@/app/components/SkeletonImage";
import { resolveBackendMediaUrl } from "@/app/utils/media";
import { useT } from "@/app/i18n/useT";


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
  const t = useT();
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

  const arrow = (
    <path d="M10 3L5 8l5 5" strokeLinecap="square" />
  );

  return (
    <div
      key={isOpen ? "open" : "closed"}
      className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto"
      style={{ top: "var(--site-header-h, 0px)", backgroundColor: "color-mix(in oklab, var(--ink) 55%, transparent)" }}
      onClick={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="updates-heading"
        className="hs-paper hs-fade-in relative w-full max-w-4xl my-auto"
        style={{ ["--reveal-delay" as string]: "0s", borderRadius: 3 }}
      >
        <div className="flex items-start justify-between gap-6 px-5 md:px-9 pt-7 md:pt-9 pb-4">
          <div>
            <p className="hs-note mb-2">{t("Updates")}</p>
            <h2 id="updates-heading" className="hs-title" style={{ color: "var(--ink)" }}>
              {tenantName ? t("What's new at {name}", { name: tenantName.toLowerCase() }) : t("What's new")}
            </h2>
            {images.length > 1 && (
              <p className="hs-label mt-2">
                {currentIndex + 1} / {images.length}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="hs-icon-btn !w-9 !h-9 shrink-0"
            aria-label={t("Close updates")}
          >
            <svg viewBox="0 0 16 16" className="w-4 h-4 rotate-45" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M8 2v12M2 8h12" />
            </svg>
          </button>
        </div>

        <div className="relative px-5 md:px-9">
          <div className="relative w-full h-[52vh] md:h-[60vh] flex items-center justify-center">
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
                className="hs-icon-btn absolute left-2 md:left-4 top-1/2 -translate-y-1/2"
                aria-label={t("Previous update")}
              >
                <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">{arrow}</svg>
              </button>
              <button
                onClick={handleNext}
                className="hs-icon-btn absolute right-2 md:right-4 top-1/2 -translate-y-1/2"
                aria-label={t("Next update")}
              >
                <svg viewBox="0 0 16 16" className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">{arrow}</svg>
              </button>
            </>
          )}
        </div>

        {images.length > 1 ? (
          <div className="px-5 md:px-9 pt-5 pb-7 md:pb-9">
            <div className="flex gap-3 overflow-x-auto py-2 px-1">
              {images.map((image, index) => (
                <button
                  key={image.id || index}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Show update ${index + 1}`}
                  aria-current={currentIndex === index ? "true" : undefined}
                  className="relative shrink-0 w-16 h-16 md:w-[72px] md:h-[72px] overflow-hidden transition-opacity duration-300"
                  style={{
                    outline: currentIndex === index ? "2px solid var(--pen)" : "none",
                    outlineOffset: 3,
                    borderRadius: 3,
                    opacity: currentIndex === index ? 1 : 0.55,
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
        ) : (
          <div className="h-7 md:h-9" />
        )}
      </div>
    </div>
  );
}
