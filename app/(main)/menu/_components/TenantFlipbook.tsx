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

/**
 * The turn page-flip draws in single-page (phone) mode, sampled frame by frame:
 * [progress, x / sheet width, y / sheet height, rotation in degrees] of the
 * incoming sheet's top-left corner. Desktop buttons replay it on the spread.
 */
const PHONE_TURN: Array<[number, number, number, number]> = [
  [0, -1.09, -0.575, 74],
  [0.15, -1.43, -0.284, 31.8],
  [0.27, -1.29, -0.14, 17.7],
  [0.4, -1.08, -0.071, 10.7],
  [0.52, -0.856, -0.035, 6.6],
  [0.65, -0.623, -0.015, 4],
  [0.77, -0.391, -0.005, 2.1],
  [0.9, -0.149, -0.0006, 0.7],
  [1, 0, 0, 0],
];
const PHONE_TURN_MS = 420;

/** A static copy of the spread page-flip is showing, placed over it */
function snapshotSpread(stage: HTMLElement): HTMLElement | null {
  const pages = [...stage.querySelectorAll<HTMLElement>(".stf__item")].filter(
    (el) => getComputedStyle(el).display !== "none" && el.getBoundingClientRect().width > 0,
  );
  if (!pages.length) return null;
  const box = stage.getBoundingClientRect();
  const rects = pages.map((el) => el.getBoundingClientRect());
  const left = Math.min(...rects.map((r) => r.left));
  const top = Math.min(...rects.map((r) => r.top));
  const width = Math.max(...rects.map((r) => r.right)) - left;
  const height = Math.max(...rects.map((r) => r.bottom)) - top;

  const layer = document.createElement("div");
  layer.style.cssText = `position:absolute;left:${left - box.left}px;top:${top - box.top}px;width:${width}px;height:${height}px;z-index:20;pointer-events:none;transform-origin:0 0;background:#fff;`;
  pages.forEach((el, i) => {
    const copy = el.cloneNode(true) as HTMLElement;
    // Not a page-flip page any more, so later snapshots ignore it
    copy.className = copy.className.replace(/\bstf__\S+/g, "");
    copy.style.cssText = `position:absolute;left:${rects[i].left - left}px;top:${rects[i].top - top}px;width:${rects[i].width}px;height:${rects[i].height}px;display:block;transform:none;clip-path:none;`;
    // Cloning a canvas copies the element, not its pixels
    const from = el.querySelectorAll("canvas");
    copy.querySelectorAll("canvas").forEach((c, k) => c.getContext("2d")?.drawImage(from[k], 0, 0));
    layer.appendChild(copy);
  });
  return layer;
}

/** Sweep a sheet in from the left ("in") or off to the left ("out"); starts paused */
function phoneTurn(sheet: HTMLElement, direction: "in" | "out"): Animation {
  const w = sheet.offsetWidth;
  const h = sheet.offsetHeight;
  const frames = PHONE_TURN.map(([offset, x, y, deg]) => ({
    offset,
    transform: `translate(${x * w}px, ${y * h}px) rotate(${deg}deg)`,
  }));
  const keyframes =
    direction === "in" ? frames : frames.map((f) => ({ ...f, offset: 1 - f.offset })).reverse();
  sheet.style.boxShadow = "0 18px 40px -12px rgb(0 0 0 / 0.35)";
  const animation = sheet.animate(keyframes, { duration: PHONE_TURN_MS, easing: "linear", fill: "both" });
  animation.pause();
  return animation;
}

/** A desktop turn in progress: its animation, and how to tidy up afterwards */
interface DesktopTurn {
  animation: Animation;
  /** Put page-flip back on the spread the turn started from */
  undo: () => void;
  cleanup: () => void;
}

/** Drag at least this far before it counts as a drag rather than a click */
const DRAG_START_PX = 6;
/** Let go past this share of the turn and it completes; otherwise it falls back */
const DRAG_COMMIT = 0.25;

const nextFrame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

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
  /** The grey stage around the book; desktop turn animations are drawn in it */
  const stageRef = useRef<HTMLDivElement>(null);
  const turningRef = useRef(false);
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
      // Desktop: the current spread sweeps off to the left, as on phones
      desktopTurn("next");
    }
  };

  const prevPage = () => {
    if (!flipBookRef.current || currentPage <= 0) return;
    if (isMobile) {
      flipBookRef.current.pageFlip().flipPrev();
      return;
    }
    // Desktop: the previous spread sweeps in from the left, as on phones
    desktopTurn("prev");
  };

  /**
   * Desktop turns. page-flip switches spreads instantly underneath while a
   * snapshot of the spread plays the phone sweep on top. "next": the current
   * spread sweeps off to the left. "prev": the previous spread sweeps in from
   * the left over a copy of the current one. Returns the paused turn.
   */
  async function beginDesktopTurn(direction: "next" | "prev"): Promise<DesktopTurn | null> {
    const stage = stageRef.current;
    const book = flipBookRef.current?.pageFlip();
    if (!stage || !book || turningRef.current) return null;
    turningRef.current = true;

    if (direction === "next") {
      const sheet = snapshotSpread(stage);
      if (!sheet) return (turningRef.current = false), null;
      stage.appendChild(sheet);
      book.turnToNextPage();
      return { animation: phoneTurn(sheet, "out"), undo: () => book.turnToPrevPage(), cleanup: () => sheet.remove() };
    }

    const under = snapshotSpread(stage);
    if (!under) return (turningRef.current = false), null;
    stage.appendChild(under); // keeps the current spread on screen meanwhile
    book.turnToPrevPage();
    await nextFrame(); // page-flip redraws on the next animation frame
    const sheet = snapshotSpread(stage);
    if (!sheet) {
      under.remove();
      turningRef.current = false;
      return null;
    }
    sheet.style.zIndex = "21";
    stage.appendChild(sheet);
    return {
      animation: phoneTurn(sheet, "in"),
      undo: () => book.turnToNextPage(),
      cleanup: () => {
        sheet.remove();
        under.remove();
      },
    };
  }

  /** Play a turn to the end, or back to where it started and undo it */
  async function finishDesktopTurn(turn: DesktopTurn, complete: boolean) {
    const { animation } = turn;
    if (complete) animation.play();
    else animation.reverse();
    await animation.finished.catch(() => {});
    if (!complete) {
      turn.undo();
      await nextFrame(); // let page-flip redraw before the cover comes off
    }
    turn.cleanup();
    turningRef.current = false;
  }

  async function desktopTurn(direction: "next" | "prev") {
    const turn = await beginDesktopTurn(direction);
    if (turn) await finishDesktopTurn(turn, true);
  }

  // Latest values for the pointer handlers below, which live across renders
  const canTurnRef = useRef({ next: false, prev: false });
  canTurnRef.current = { next: currentPage < totalPages - 2, prev: currentPage > 0 };
  const turnRef = useRef({ begin: beginDesktopTurn, finish: finishDesktopTurn, run: desktopTurn });
  turnRef.current = { begin: beginDesktopTurn, finish: finishDesktopTurn, run: desktopTurn };

  /**
   * Desktop: clicking or dragging the book uses the same sweep instead of
   * page-flip's curl. Its mouse handling (click, drag, corner hover) is
   * blocked on the book, and pointer events drive the sweep: click the right
   * page for next, the left page for back, or drag and the sweep follows.
   */
  useEffect(() => {
    const stage = stageRef.current;
    if (isMobile || !stage) return;
    const bookEl = () => stage.querySelector<HTMLElement>(".stf__parent");

    // page-flip listens for mouse events; stop them before they reach it
    const blockMouse = (e: MouseEvent) => {
      const el = bookEl();
      if (el && e.target instanceof Node && el.contains(e.target)) e.stopPropagation();
    };
    const mouseEvents = ["mousedown", "mousemove", "mouseup"] as const;
    mouseEvents.forEach((t) => window.addEventListener(t, blockMouse, true));

    let gesture: {
      id: number;
      startX: number;
      width: number;
      direction: "next" | "prev";
      turn: Promise<DesktopTurn | null> | null;
      progress: number;
    } | null = null;

    const onDown = (e: PointerEvent) => {
      const el = bookEl();
      if (e.button !== 0 || !el || !(e.target instanceof Node) || !el.contains(e.target)) return;
      const rect = el.getBoundingClientRect();
      const direction = e.clientX >= rect.left + rect.width / 2 ? "next" : "prev";
      if (!canTurnRef.current[direction] || turningRef.current) return;
      e.preventDefault();
      stage.setPointerCapture(e.pointerId);
      gesture = { id: e.pointerId, startX: e.clientX, width: rect.width, direction, turn: null, progress: 0 };
    };

    const onMove = (e: PointerEvent) => {
      if (!gesture || e.pointerId !== gesture.id) return;
      const dx = e.clientX - gesture.startX;
      if (!gesture.turn && Math.abs(dx) < DRAG_START_PX) return;
      if (!gesture.turn) gesture.turn = turnRef.current.begin(gesture.direction);
      // Next follows a drag to the left, back a drag to the right
      const travel = gesture.direction === "next" ? -dx : dx;
      gesture.progress = Math.min(1, Math.max(0, travel / gesture.width));
      const progress = gesture.progress;
      gesture.turn.then((turn) => {
        if (turn) turn.animation.currentTime = progress * PHONE_TURN_MS;
      });
    };

    const onUp = (e: PointerEvent) => {
      if (!gesture || e.pointerId !== gesture.id) return;
      const { turn, progress, direction } = gesture;
      gesture = null;
      if (stage.hasPointerCapture(e.pointerId)) stage.releasePointerCapture(e.pointerId);
      if (!turn) {
        // A click: turn the whole way
        turnRef.current.run(direction);
        return;
      }
      turn.then((t) => {
        if (t) turnRef.current.finish(t, e.type === "pointerup" && progress >= DRAG_COMMIT);
      });
    };

    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerup", onUp);
    stage.addEventListener("pointercancel", onUp);
    return () => {
      mouseEvents.forEach((t) => window.removeEventListener(t, blockMouse, true));
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onUp);
    };
  }, [isMobile, isLoading, error, totalPages]);

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
            ref={stageRef}
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
