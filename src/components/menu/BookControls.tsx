"use client";

import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Download,
  ZoomIn,
  ZoomOut,
  X,
  BookOpen,
  ScrollText,
  Calendar,
} from "lucide-react";

interface BookControlsProps {
  page: number;
  totalPages: number;
  pageDisplay?: string;
  nextDisabled?: boolean;
  onPrev: () => void;
  onNext: () => void;
  onFullscreen: () => void;
  isFullscreen: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  downloadUrl: string;
  visible: boolean;
  onClose: () => void;
  isScrollMode?: boolean;
  onToggleMode?: () => void;
}

export function BookControls({
  page,
  totalPages,
  pageDisplay,
  nextDisabled,
  onPrev,
  onNext,
  onFullscreen,
  isFullscreen,
  onZoomIn,
  onZoomOut,
  downloadUrl,
  visible,
  onClose,
  isScrollMode = false,
  onToggleMode,
}: BookControlsProps) {
  const isNextDisabled =
    nextDisabled !== undefined ? nextDisabled : page >= totalPages;

  return (
    <div
      className={`menu-controls ${
        visible
          ? "opacity-100 translate-y-0"
          : "controls-idle opacity-40 translate-y-2"
      } transition-all duration-300`}
    >
      {/* Page Turn Pagination */}
      {!isScrollMode && (
        <div className="menu-pagination">
          <button
            aria-label="Previous page (Left arrow key)"
            disabled={page <= 1}
            onClick={onPrev}
            title="Previous page (←)"
          >
            <ChevronLeft size={18} />
          </button>
          <span
            aria-live="polite"
            className="font-mono text-xs tabular-nums px-1.5 whitespace-nowrap"
          >
            {pageDisplay ? (
              pageDisplay
            ) : (
              <>
                {String(page).padStart(2, "0")}{" "}
                <span className="opacity-40" aria-hidden>
                  /
                </span>{" "}
                <span className="sr-only">of</span>{" "}
                <span className="opacity-60">
                  {String(totalPages).padStart(2, "0")}
                </span>
              </>
            )}
          </span>
          <button
            aria-label="Next page (Right arrow key)"
            disabled={isNextDisabled}
            onClick={onNext}
            title="Next page (→)"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Divider */}
      <span className="h-4 w-px bg-white/20 hidden sm:inline" />

      {/* Tools */}
      <div className="menu-tools">
        {/* Toggle between Flipbook and Continuous Scroll */}
        {onToggleMode && (
          <button
            aria-label={
              isScrollMode
                ? "Switch to 2-page Flipbook view"
                : "Switch to Vertical Scroll view"
            }
            onClick={onToggleMode}
            title={
              isScrollMode ? "2-page Flipbook view" : "Vertical scroll view"
            }
          >
            {isScrollMode ? <BookOpen size={16} /> : <ScrollText size={16} />}
          </button>
        )}

        <button
          aria-label="Zoom out"
          onClick={onZoomOut}
          title="Zoom out"
          className="hidden sm:inline-flex"
        >
          <ZoomOut size={16} />
        </button>
        <button
          aria-label="Zoom in"
          onClick={onZoomIn}
          title="Zoom in"
          className="hidden sm:inline-flex"
        >
          <ZoomIn size={16} />
        </button>

        <button
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen (F)"}
          onClick={onFullscreen}
          title={isFullscreen ? "Exit fullscreen (F)" : "Fullscreen (F)"}
        >
          {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
        </button>

        <a
          href={downloadUrl}
          download
          target="_blank"
          rel="noreferrer"
          aria-label="Download original PDF menu"
          title="Download original PDF"
        >
          <Download size={16} />
        </a>

        <a
          href="/reservation"
          aria-label="Reserve a table"
          title="Reserve a table"
          className="text-amber-300 hover:text-amber-100"
        >
          <Calendar size={16} />
        </a>

        <button
          aria-label="Close menu view"
          onClick={onClose}
          title="Return to cover"
        >
          <X size={17} />
        </button>
      </div>
    </div>
  );
}
