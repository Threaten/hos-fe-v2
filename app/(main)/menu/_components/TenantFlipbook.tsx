"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import HTMLFlipBook from "react-pageflip";
import SkeletonImage from "@/app/components/SkeletonImage";
import { resolveBackendMediaUrl, type BackendMedia } from "@/app/utils/media";

// Set worker path - using CDN for reliability
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface TenantFlipbookProps {
  menuUrl: string;
  tenantName: string;
  imagePages?: BackendMedia[];
  /** The main-site menu page renders its own branch picker as the heading */
  showHeading?: boolean;
}

export default function TenantFlipbook({
  menuUrl,
  tenantName,
  imagePages = [],
  showHeading = true,
}: TenantFlipbookProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [pageWidth, setPageWidth] = useState(500);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flipBookRef = useRef<any>(null);
  const imagePageUrls = imagePages
    .map((page) => resolveBackendMediaUrl(page))
    .filter(Boolean);
  const isPdf = menuUrl.toLowerCase().split("?")[0].endsWith(".pdf");
  const imageMenuPages = imagePageUrls.length > 0 ? imagePageUrls : !isPdf && menuUrl ? [menuUrl] : [];
  const totalPages = isPdf ? numPages : imageMenuPages.length;

  const pdfOptions = useMemo(
    () => ({
      cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
    }),
    []
  );

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // Mobile: single page width, Desktop: page width for book view
      setPageWidth(mobile ? Math.min(window.innerWidth - 40, 400) : 500);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setCurrentPage(0);
    setError(null);
    if (!isPdf) {
      setIsLoading(false);
      setNumPages(imageMenuPages.length);
    } else {
      setIsLoading(true);
      setNumPages(0);
    }
  }, [isPdf, menuUrl, imageMenuPages.length]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
  }

  function onDocumentLoadError(error: Error) {
    setError(`Menu could not be opened: ${error.message}`);
    setIsLoading(false);
  }

  const nextPage = () => {
    if (flipBookRef.current && currentPage < totalPages - (isMobile ? 1 : 2)) {
      const book = flipBookRef.current.pageFlip();
      if (isMobile) {
        // Single-page mode: play the "back" turn in reverse, so the current
        // sheet sweeps off to the left exactly as the previous one sweeps in.
        // page-flip has no public API for this; it uses the flip controller's
        // internals (pinned to page-flip 2.0.7).
        const flip = book.getFlipController();
        const { pageWidth, height } = book.getBoundsRect();
        if (flip.getCalculation()) return; // a turn is already running
        book.turnToNextPage();
        if (!flip.start({ x: 10, y: 1 })) return;
        flip.setState("flipping");
        // Same path flipPrev() animates (Flip.flip), run backwards
        const margin = height / 10;
        flip.animateFlippingTo({ x: -pageWidth, y: 0 }, { x: pageWidth - margin, y: margin }, false);
        return;
      }
      book.flipNext();
    }
  };

  const prevPage = () => {
    if (flipBookRef.current && currentPage > 0) {
      flipBookRef.current.pageFlip().flipPrev();
    }
  };

  const onFlip = (e: { data: number }) => {
    setCurrentPage(e.data);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {showHeading && (
        <header className="w-full hs-shell pt-14 md:pt-20">
          <div className="hs-main grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,300px)] gap-x-10 gap-y-6 items-start">
            <h1 className="hs-hero animate-rise text-center lg:text-left">the menu</h1>
            <p className="text-[1.1875rem] leading-[1.25] tracking-[-0.015em] xl:pt-3 text-center lg:text-left animate-rise" style={{ color: "var(--pen)" }}>
              Tonight at {tenantName.toLowerCase()}. Drag a corner, or use the arrows, to turn the page.
            </p>
          </div>
        </header>
      )}

      {isLoading && (
        <p className="hs-note mt-16 animate-pulse" role="status">
          Opening the menu…
        </p>
      )}

      {error && (
        <div className="mt-16 text-center hos-gutter">
          <p className="hs-title mb-3" style={{ color: "var(--ink)" }}>The menu got stuck between pages.</p>
          <p className="hs-meta mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="hs-btn hs-btn-solid">
            Try again
          </button>
        </div>
      )}

      {isPdf ? (
        <div
          style={{
            position: "absolute",
            left: "-9999px",
            width: "1px",
            height: "1px",
          }}
        >
          <Document
            file={menuUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            options={pdfOptions}
          >
            <Page pageNumber={1} width={1} />
          </Document>
        </div>
      ) : null}

      {/* Flipbook display */}
      {!isLoading && !error && totalPages > 0 && (
        <>
          <div
            className="flex justify-center items-center w-full relative mt-12 md:mt-20 py-10 md:py-16 overflow-hidden"
            style={{
              minHeight: isMobile ? "580px" : "880px",
              backgroundColor: "var(--paper-2)",
            }}
          >
            {isPdf ? (
              <Document file={menuUrl} options={pdfOptions}>
                <HTMLFlipBook
                  ref={flipBookRef}
                  width={pageWidth}
                  height={isMobile ? 500 : 750}
                  size="fixed"
                  maxShadowOpacity={0.5}
                  showCover={false}
                  mobileScrollSupport={true}
                  onFlip={onFlip}
                  className="shadow-[0_30px_60px_-30px_color-mix(in_oklab,var(--ink)_55%,transparent)]"
                  startPage={0}
                  drawShadow={true}
                  flippingTime={600}
                  usePortrait={isMobile}
                  startZIndex={0}
                  autoSize={false}
                  clickEventForward={true}
                  useMouseEvents={true}
                  swipeDistance={50}
                  showPageCorners={true}
                  disableFlipByClick={false}
                  style={{}}
                  minWidth={0}
                  maxWidth={pageWidth * 2}
                  minHeight={0}
                  maxHeight={isMobile ? 500 : 750}
                >
                  {Array.from(new Array(numPages), (_, index) => (
                    <div
                      key={`page-${index}`}
                      className="bg-white flex items-start justify-center overflow-hidden"
                    >
                      <Page
                        pageNumber={index + 1}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        width={pageWidth}
                      />
                    </div>
                  ))}
                </HTMLFlipBook>
              </Document>
            ) : (
              <HTMLFlipBook
                ref={flipBookRef}
                width={pageWidth}
                height={isMobile ? 500 : 750}
                size="fixed"
                maxShadowOpacity={0.5}
                showCover={false}
                mobileScrollSupport={true}
                onFlip={onFlip}
                className="shadow-[0_30px_60px_-30px_color-mix(in_oklab,var(--ink)_55%,transparent)]"
                startPage={0}
                drawShadow={true}
                flippingTime={600}
                usePortrait={isMobile}
                startZIndex={0}
                autoSize={false}
                clickEventForward={true}
                useMouseEvents={true}
                swipeDistance={50}
                showPageCorners={true}
                disableFlipByClick={false}
                style={{}}
                minWidth={0}
                maxWidth={pageWidth * 2}
                minHeight={0}
                maxHeight={isMobile ? 500 : 750}
              >
                {imageMenuPages.map((pageUrl, index) => (
                  <div
                    key={`${pageUrl}-${index}`}
                    className="bg-white flex items-center justify-center overflow-hidden relative"
                  >
                    <SkeletonImage
                      src={pageUrl}
                      alt={`${tenantName} menu page ${index + 1}`}
                      fill
                      quality={90}
                      sizes={isMobile ? "100vw" : "500px"}
                      className="object-contain"
                    />
                  </div>
                ))}
              </HTMLFlipBook>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="mt-8 md:mt-10 flex items-center gap-8 md:gap-12">
            <button
              onClick={prevPage}
              disabled={currentPage <= 0}
              className="hs-icon-btn"
              aria-label="Previous page"
            >
              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path d="M10 3L5 8l5 5" strokeLinecap="square" />
              </svg>
            </button>

            <span className="hs-ui text-[0.9375rem] tabular-nums min-w-[7ch] text-center" style={{ color: "var(--ink)" }} aria-live="polite">
              {isMobile
                ? `${currentPage + 1} / ${totalPages}`
                : `${currentPage + 1}–${Math.min(currentPage + 2, totalPages)} / ${totalPages}`}
            </span>

            <button
              onClick={nextPage}
              disabled={currentPage >= totalPages - (isMobile ? 1 : 2)}
              className="hs-icon-btn"
              aria-label="Next page"
            >
              <svg viewBox="0 0 16 16" className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path d="M10 3L5 8l5 5" strokeLinecap="square" />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
