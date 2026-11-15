"use client";

import React, { useEffect } from "react";
import SkeletonImage from "@/app/components/SkeletonImage";

interface ImageLightboxProps {
  isOpen: boolean;
  imageSrc: string;
  imageAlt: string;
  caption?: string;
  branch?: string;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  currentIndex?: number;
  totalImages?: number;
}

const ImageLightbox = ({
  isOpen,
  imageSrc,
  imageAlt,
  caption,
  branch,
  onClose,
  onNext,
  onPrev,
  currentIndex,
  totalImages,
}: ImageLightboxProps) => {
  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Handle arrow keys for navigation
  useEffect(() => {
    const handleArrowKeys = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && onNext) onNext();
      if (e.key === "ArrowLeft" && onPrev) onPrev();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleArrowKeys);
    }

    return () => {
      document.removeEventListener("keydown", handleArrowKeys);
    };
  }, [isOpen, onNext, onPrev]);

  if (!isOpen) return null;

  const chevron = (
    <path d="M10 3L5 8l5 5" strokeLinecap="square" />
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={imageAlt}
      className="fixed inset-x-0 bottom-0 z-50 flex flex-col hs-paper"
      style={{ top: "var(--site-header-h, 0px)" }}
      onClick={onClose}
    >
      <div className="hos-gutter flex items-center justify-between gap-4 py-4 shrink-0">
        <span className="hs-ui truncate" style={{ color: "var(--ink)" }}>
          {caption || branch || ""}
          {caption && branch && <span style={{ color: "var(--ink-faint)" }}> · {branch}</span>}
        </span>
        <span className="flex items-center gap-4 shrink-0">
          {currentIndex !== undefined && totalImages !== undefined && (
            <span className="hs-ui tabular-nums" style={{ color: "var(--pen)" }}>
              {currentIndex + 1} / {totalImages}
            </span>
          )}
          <button onClick={onClose} className="hs-icon-btn !w-9 !h-9" aria-label="Close lightbox">
            <svg viewBox="0 0 16 16" className="w-4 h-4 rotate-45" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M8 2v12M2 8h12" />
            </svg>
          </button>
        </span>
      </div>

      <div className="relative flex-1 min-h-0 hos-gutter pb-6 flex items-center justify-center">
        {onPrev && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="hs-icon-btn absolute left-3 md:left-6 z-10"
            aria-label="Previous image"
          >
            <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">{chevron}</svg>
          </button>
        )}
        {onNext && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="hs-icon-btn absolute right-3 md:right-6 z-10"
            aria-label="Next image"
          >
            <svg viewBox="0 0 16 16" className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">{chevron}</svg>
          </button>
        )}

        <figure key={imageSrc} className="hs-fade-in relative w-full h-full max-w-6xl" style={{ ["--reveal-delay" as string]: "0s" }} onClick={(e) => e.stopPropagation()}>
          <SkeletonImage src={imageSrc} alt={imageAlt} fill quality={90} sizes="90vw" className="object-contain" />
        </figure>
      </div>
    </div>
  );
};

export default ImageLightbox;
