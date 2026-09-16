"use client";

import { forwardRef, memo } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();
const PAGE_WIDTH = 560;

export const BookPage = memo(
  forwardRef<
    HTMLDivElement,
    {
      pageNumber: number;
      isCover?: boolean;
      shouldRender: boolean;
      width?: number;
    }
  >(function BookPage(
    { pageNumber, isCover, shouldRender, width = PAGE_WIDTH },
    ref,
  ) {
    return (
      <div
        ref={ref}
        data-density={isCover ? "hard" : "soft"}
        className={`menu-paper ${isCover ? "menu-paper-cover" : ""}`}
        aria-label={`Menu page ${pageNumber}`}
      >
        {shouldRender ? (
          <Page
            pageNumber={pageNumber}
            width={width}
            devicePixelRatio={2}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="menu-pdf-page"
            loading={
              <span className="page-loading">Preparing page {pageNumber}…</span>
            }
          />
        ) : (
          <span className="page-loading">{pageNumber}</span>
        )}
        <span className="paper-light" aria-hidden />
      </div>
    );
  }),
);
export { Document, pdfjs, PAGE_WIDTH };
