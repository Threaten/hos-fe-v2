"use client";

import React, { useEffect } from "react";
import Image from "next/image";
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

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
      style={{ top: "var(--site-header-h, 0px)" }}
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 text-white hover:text-gray-300 transition-colors p-2"
        aria-label="Close lightbox"
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Navigation Arrows */}
      {onPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-4 z-50 text-white hover:text-gray-300 transition-colors p-2"
          aria-label="Previous image"
        >
          <svg
            className="w-10 h-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {onNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 z-50 text-white hover:text-gray-300 transition-colors p-2"
          aria-label="Next image"
        >
          <svg
            className="w-10 h-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {/* Image Container */}
      <div
        className="relative max-w-7xl max-h-[90vh] w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-[85vh] flex items-center justify-center">
          <SkeletonImage
            src={imageSrc}
            alt={imageAlt}
            fill
            quality={95}
            sizes="90vw"
            className="object-contain rounded-lg"
          />
        </div>

        {/* Image Info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {branch && (
                <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded mb-2">
                  {branch}
                </span>
              )}
              {caption && (
                <p className="text-white text-base font-medium">{caption}</p>
              )}
            </div>
            {currentIndex !== undefined && totalImages !== undefined && (
              <div className="text-white text-sm font-medium ml-4">
                {currentIndex + 1} / {totalImages}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageLightbox;
