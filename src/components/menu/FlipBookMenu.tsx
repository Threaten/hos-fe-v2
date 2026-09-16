"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { BookOpen } from "lucide-react";
import { Document, BookPage, PAGE_WIDTH } from "@/components/menu/BookPage";
import { BookControls } from "@/components/menu/BookControls";

type BookHandle = {
  pageFlip: () => {
    flipNext: () => void;
    flipPrev: () => void;
    turnToPage: (page: number) => void;
  };
};

export function FlipBookMenu({
  menuUrl,
  tenantName,
  onClose,
}: {
  menuUrl: string;
  tenantName: string;
  onClose?: () => void;
}) {
  const [numPages, setNumPages] = useState(0);
  const [ratio, setRatio] = useState(1.414);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [error, setError] = useState(false);
  const [scrollMode, setScrollMode] = useState(false);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  const scene = useRef<HTMLDivElement>(null);
  const book = useRef<BookHandle>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pinch = useRef<{ distance: number; zoom: number } | null>(null);
  const lastTap = useRef(0);

  const wakeControls = useCallback(() => {
    setVisible(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), 3800);
  }, []);

  useEffect(() => {
    const element = scene.current;
    if (!element) return;
    const measure = () =>
      setViewport({ width: element.clientWidth, height: window.innerHeight });
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    updateMotion();
    media.addEventListener("change", updateMotion);

    const syncFullscreen = () =>
      setFullscreen(document.fullscreenElement === element);
    document.addEventListener("fullscreenchange", syncFullscreen);

    return () => {
      observer.disconnect();
      media.removeEventListener("change", updateMotion);
      document.removeEventListener("fullscreenchange", syncFullscreen);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  // Large screen: show 2 pages side-by-side. Mobile or small screen: show 1 page.
  const isMobile = viewport.width > 0 && viewport.width < 768;
  const showTwoPages = !isMobile && numPages > 1;

  const turn = useCallback(
    (direction: -1 | 1) => {
      const api = book.current?.pageFlip();
      if (!api) return;
      if (reducedMotion) {
        const step = showTwoPages ? 2 : 1;
        api.turnToPage(
          Math.min(numPages - 1, Math.max(0, page - 1 + direction * step)),
        );
      } else if (direction === 1) {
        api.flipNext();
      } else {
        api.flipPrev();
      }
      wakeControls();
    },
    [page, numPages, reducedMotion, showTwoPages, wakeControls],
  );

  const close = useCallback(() => {
    if (document.fullscreenElement === scene.current)
      void document.exitFullscreen().catch(() => {});
    if (onClose) onClose();
    else {
      book.current?.pageFlip().turnToPage(0);
      setPage(1);
      setZoom(1);
    }
  }, [onClose]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      )
        return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        turn(-1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        turn(1);
      }
      if (event.key.toLowerCase() === "f" && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        if (document.fullscreenElement) void document.exitFullscreen();
        else void scene.current?.requestFullscreen?.();
      }
      if (event.key === "Escape" && !document.fullscreenElement) close();
    };
    const element = scene.current;
    element?.addEventListener("keydown", handleKey);
    return () => element?.removeEventListener("keydown", handleKey);
  }, [turn, close]);

  const onLoad = useCallback(async (pdf: PDFDocumentProxy) => {
    try {
      const cover = await pdf.getPage(1);
      const bounds = cover.getViewport({ scale: 1 });
      setRatio(bounds.height / bounds.width);
      setNumPages(pdf.numPages);
    } catch {
      setError(true);
    }
  }, []);

  // Compute precise page dimensions for 2-page (large screen) vs 1-page (small screen)
  const maxAvailableWidth = showTwoPages
    ? Math.min(PAGE_WIDTH, (viewport.width - 120) / 2)
    : Math.min(PAGE_WIDTH, viewport.width - 36);

  const maxAvailableHeight = Math.max(260, viewport.height - 250);
  const widthByHeight = maxAvailableHeight / ratio;

  const width = Math.max(120, Math.min(maxAvailableWidth, widthByHeight));
  const height = Math.round(width * ratio);

  // Thickness / stack depth indicator on edges
  const leftStack = Math.min(7, ((page - 1) / Math.max(1, numPages - 1)) * 7);
  const rightStack = Math.max(1, 7 - leftStack);

  // Pagination string: "01–02 / 04" on 2-page display, or "01 / 04" on mobile
  const pageDisplay = showTwoPages
    ? `${String(page).padStart(2, "0")}–${String(Math.min(numPages, page + 1)).padStart(2, "0")} / ${String(numPages).padStart(2, "0")}`
    : `${String(page).padStart(2, "0")} / ${String(numPages).padStart(2, "0")}`;

  const isNextDisabled = showTwoPages ? page >= numPages - 1 : page >= numPages;

  return (
    <div
      ref={scene}
      className="menu-scene"
      tabIndex={0}
      aria-label={`${tenantName} menu. ${showTwoPages ? "Showing 2 pages." : "Showing 1 page."} Use arrow keys to turn.`}
      onPointerMove={wakeControls}
      onFocusCapture={wakeControls}
    >
      {/* Top Header */}
      <div className="menu-scene-heading">
        <span className="eyebrow text-amber-200/70">
          {tenantName} • {showTwoPages ? "Two-Page Spread" : "Original Menu"}
        </span>
        <p className="text-white drop-shadow-xs">
          {numPages > 0 ? pageDisplay : "Opening menu…"}
        </p>
      </div>

      {/* Main Reading Viewport */}
      {scrollMode ? (
        /* Continuous Scroll Mode: 2 columns on large screen, 1 column on mobile */
        <div className="w-full max-w-6xl px-4 py-4 animate-in fade-in duration-300">
          <Document
            file={menuUrl}
            onLoadSuccess={onLoad}
            onLoadError={() => setError(true)}
            loading={
              <div className="flex flex-col items-center justify-center p-16 gap-4 text-white/70">
                <BookOpen className="h-8 w-8 text-amber-300 animate-pulse" />
                <span className="font-heading text-xl">
                  Opening {tenantName} Menu…
                </span>
              </div>
            }
          >
            <div
              className={`grid gap-8 ${
                showTwoPages ? "grid-cols-2" : "grid-cols-1 max-w-xl mx-auto"
              }`}
            >
              {Array.from({ length: numPages }, (_, i) => (
                <div
                  key={i + 1}
                  className="w-full bg-[#f7f3eb] shadow-2xl rounded-xs overflow-hidden border border-black/15 flex flex-col"
                >
                  <BookPage
                    pageNumber={i + 1}
                    shouldRender={true}
                    width={
                      showTwoPages
                        ? Math.min(PAGE_WIDTH, (viewport.width - 100) / 2)
                        : Math.min(PAGE_WIDTH, viewport.width - 40)
                    }
                  />
                  <div className="py-2 px-5 bg-stone-100/90 border-t border-stone-200 text-stone-500 text-xs font-mono flex justify-between">
                    <span>{tenantName}</span>
                    <span>
                      Page {String(i + 1).padStart(2, "0")} of{" "}
                      {String(numPages).padStart(2, "0")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Document>
        </div>
      ) : (
        /* Interactive Flipbook Mode: 2 pages on large screen, 1 page on mobile */
        <div className="menu-book-viewport" style={{ minHeight: height + 50 }}>
          <div
            className="menu-book-scale"
            style={{
              transform: `scale(${zoom})`,
              touchAction: zoom > 1 ? "pan-x pan-y" : "pan-y",
            }}
            onDoubleClick={() => setZoom((value) => (value === 1 ? 1.5 : 1))}
            onTouchStartCapture={(event) => {
              wakeControls();
              if (event.touches.length === 2) {
                event.stopPropagation();
                pinch.current = {
                  distance: Math.hypot(
                    event.touches[0].clientX - event.touches[1].clientX,
                    event.touches[0].clientY - event.touches[1].clientY,
                  ),
                  zoom,
                };
              } else {
                const now = Date.now();
                if (now - lastTap.current < 300) {
                  event.stopPropagation();
                  setZoom((value) => (value === 1 ? 1.5 : 1));
                }
                lastTap.current = now;
              }
            }}
            onTouchMoveCapture={(event) => {
              if (event.touches.length === 2 && pinch.current) {
                event.stopPropagation();
                const distance = Math.hypot(
                  event.touches[0].clientX - event.touches[1].clientX,
                  event.touches[0].clientY - event.touches[1].clientY,
                );
                setZoom(
                  Math.max(
                    1,
                    Math.min(
                      2.2,
                      (pinch.current.zoom * distance) / pinch.current.distance,
                    ),
                  ),
                );
              }
            }}
            onTouchEndCapture={() => {
              pinch.current = null;
            }}
          >
            <Document
              file={menuUrl}
              onLoadSuccess={onLoad}
              onLoadError={() => setError(true)}
              loading={
                <div className="flex flex-col items-center justify-center p-16 gap-4 text-white/70">
                  <div className="w-16 h-20 rounded-xs border border-white/25 bg-white/5 animate-pulse flex items-center justify-center shadow-lg">
                    <BookOpen className="h-6 w-6 text-amber-200" />
                  </div>
                  <span className="font-heading text-lg text-white">
                    Opening {tenantName} Menu…
                  </span>
                  <span className="text-xs text-white/50 tracking-wider uppercase">
                    Preparing high-resolution press pages
                  </span>
                </div>
              }
              error={
                <div
                  className="p-12 text-center text-white/80 space-y-3"
                  role="alert"
                >
                  <p className="font-heading text-xl">
                    The menu could not be opened.
                  </p>
                  <a
                    className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-300 hover:underline pt-2"
                    href={menuUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open original PDF directly ↗
                  </a>
                </div>
              }
            >
              {numPages > 0 && viewport.width > 0 && !error ? (
                <div
                  className="physical-book"
                  style={
                    {
                      "--left-stack": `${leftStack}px`,
                      "--right-stack": `${rightStack}px`,
                    } as React.CSSProperties
                  }
                >
                  <HTMLFlipBook
                    ref={book}
                    key={`${Math.round(width)}-${Math.round(height)}-${showTwoPages}-${reducedMotion}`}
                    width={Math.round(width)}
                    height={height}
                    size="fixed"
                    minWidth={100}
                    maxWidth={PAGE_WIDTH}
                    minHeight={100}
                    maxHeight={1600}
                    className="menu-flipbook"
                    style={{}}
                    startPage={page - 1}
                    drawShadow={!reducedMotion}
                    flippingTime={reducedMotion ? 1 : 750}
                    usePortrait={!showTwoPages}
                    startZIndex={5}
                    autoSize={true}
                    maxShadowOpacity={0.35}
                    showCover={false}
                    mobileScrollSupport={true}
                    clickEventForward={true}
                    useMouseEvents={zoom === 1 && !reducedMotion}
                    swipeDistance={25}
                    showPageCorners={!reducedMotion}
                    disableFlipByClick={false}
                    onFlip={(event: { data: number }) => {
                      setPage(event.data + 1);
                      wakeControls();
                    }}
                  >
                    {Array.from({ length: numPages }, (_, i) => (
                      <BookPage
                        key={i + 1}
                        pageNumber={i + 1}
                        isCover={false}
                        shouldRender={i === 0 || Math.abs(i + 1 - page) <= 4}
                        width={Math.round(width)}
                      />
                    ))}
                  </HTMLFlipBook>
                </div>
              ) : null}
            </Document>
          </div>
        </div>
      )}

      {error ? (
        <p
          className="px-6 text-center text-sm text-amber-200/80 mt-4"
          role="alert"
        >
          Please view the original PDF using the download button on the toolbar
          below.
        </p>
      ) : null}

      {numPages > 0 && !error && !scrollMode ? (
        <div className="menu-reading-note flex flex-col items-center gap-2 mt-4 text-xs text-white/60">
          <span className="text-[11px] text-white/50">
            {showTwoPages
              ? "Showing 2 pages side-by-side • Click corner or use arrow keys (← / →) to turn"
              : "Showing 1 page • Swipe page or use arrow keys to turn"}
          </span>
        </div>
      ) : null}

      {/* Floating HUD Controls */}
      <BookControls
        page={page}
        totalPages={numPages}
        pageDisplay={pageDisplay}
        nextDisabled={isNextDisabled}
        onPrev={() => turn(-1)}
        onNext={() => turn(1)}
        onFullscreen={async () => {
          try {
            if (document.fullscreenElement) await document.exitFullscreen();
            else await scene.current?.requestFullscreen?.();
          } catch {
            setFullscreen(false);
          }
        }}
        isFullscreen={fullscreen}
        onZoomIn={() => setZoom((value) => Math.min(2.2, value + 0.25))}
        onZoomOut={() => setZoom((value) => Math.max(1, value - 0.25))}
        downloadUrl={menuUrl}
        visible={visible}
        onClose={close}
        isScrollMode={scrollMode}
        onToggleMode={() => setScrollMode(!scrollMode)}
      />
    </div>
  );
}
