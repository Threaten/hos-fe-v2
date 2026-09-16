"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { mediaUrl } from "@/lib/media";
import type { NewMenuItem } from "@/types/payload";

interface NewsModalProps {
  images: NewMenuItem[];
  isOpen: boolean;
  onClose: () => void;
  tenantName: string;
}

export function NewsModal({
  images,
  isOpen,
  onClose,
  tenantName,
}: NewsModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const validImages = images
    .filter((item) => mediaUrl(item.src))
    .map((item, index) => ({
      id: item.id || `news-${index}`,
      url: mediaUrl(item.src),
    }));

  const handleNext = useCallback(() => {
    if (!validImages.length) return;
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  }, [validImages.length]);

  const handlePrevious = useCallback(() => {
    if (!validImages.length) return;
    setCurrentIndex(
      (prev) => (prev - 1 + validImages.length) % validImages.length,
    );
  }, [validImages.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") handlePrevious();
      else if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrevious, onClose]);

  if (!isOpen || validImages.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Latest News"
    >
      <div className="relative w-full max-w-4xl bg-white dark:bg-stone-900 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-black/10 dark:border-white/10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:px-6 sm:py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950">
          <div>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
              Latest News
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-0.5">
              Check out our latest news at {tenantName.toLowerCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors focus:outline-hidden"
            aria-label="Close latest news modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Carousel Image Display */}
        <div className="relative bg-stone-100 dark:bg-stone-950 flex-1 min-h-[45vh] sm:min-h-[55vh] flex items-center justify-center overflow-hidden">
          {validImages[currentIndex] && (
            <div className="relative w-full h-[45vh] sm:h-[55vh]">
              <Image
                src={validImages[currentIndex].url}
                alt={`${tenantName} news item ${currentIndex + 1}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-contain"
              />
            </div>
          )}

          {/* Navigation Arrows */}
          {validImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
                className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-white/90 hover:bg-white text-stone-900 shadow-lg transition-transform hover:scale-110 focus:outline-hidden"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-white/90 hover:bg-white text-stone-900 shadow-lg transition-transform hover:scale-110 focus:outline-hidden"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Strip and Page Counter (matching Image #2) */}
        {validImages.length > 1 && (
          <div className="p-3 sm:p-4 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800">
            <div className="flex gap-2 sm:gap-2.5 overflow-x-auto pb-2 justify-start sm:justify-center scrollbar-thin">
              {validImages.map((img, index) => (
                <button
                  key={img.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all focus:outline-hidden ${
                    currentIndex === index
                      ? "border-blue-500 scale-105 shadow-md ring-1 ring-blue-500/50"
                      : "border-stone-300 dark:border-stone-700 opacity-60 hover:opacity-100"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                >
                  <Image
                    src={img.url}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Centered counter directly under thumbnails */}
            <div className="flex justify-center pt-2">
              <span className="text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300">
                {currentIndex + 1} / {validImages.length}
              </span>
            </div>
          </div>
        )}

        {/* Footer Instruction */}
        <div className="py-3 px-4 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 text-center">
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
            Use arrow keys to navigate • Press ESC to close
          </p>
        </div>
      </div>
    </div>
  );
}
