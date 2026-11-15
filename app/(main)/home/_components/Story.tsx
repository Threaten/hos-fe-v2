"use client";

import React from "react";
import Link from "next/link";
import type { Tenant } from "@/api/queries";
import { ArrowRight } from "../../components/Icons";

/** The branch in a few sentences: a statement, then a quieter note beside it */
export default function Story({ tenant }: { tenant?: Tenant | null }) {
  const statement =
    tenant?.shortAboutTitle || "More than a restaurant: a space to reconnect, unwind, and stay awhile.";
  // Skip the paragraph when the CMS repeats the hero copy
  const statementText =
    tenant?.shortAboutText && tenant.shortAboutText !== tenant.heroDescription ? tenant.shortAboutText : null;
  const noteTitle = tenant?.galleryTitle || "It's always more than good food";
  const noteText =
    tenant?.galleryText ||
    "Meals unfold slowly here and conversations linger a little longer. Good food is only part of it; the rest lives in the room, the people around the table, and the moments between courses.";

  return (
    <section className="hs-shell pt-[var(--section)]" aria-labelledby="story-heading">
      <h2 id="story-heading" className="hs-label mb-6 lg:mb-0 text-center lg:text-left">
        The house
      </h2>
      <div className="hs-main">
        <p className="hs-display max-w-[20ch] mx-auto lg:mx-0 text-center lg:text-left" style={{ color: "var(--ink)" }} data-reveal>
          {statement}
        </p>

        <div className="mt-14 md:mt-24 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10 border-t pt-8" style={{ borderColor: "var(--line)" }}>
          {statementText && (
            <p className="hs-lead" data-reveal>
              {statementText}
            </p>
          )}
          <div className={statementText ? "" : "md:col-start-2"} data-reveal style={{ ["--reveal-delay" as string]: "0.08s" }}>
            <h3 className="hs-title mb-4" style={{ color: "var(--pen)" }}>
              {noteTitle}
            </h3>
            <p className="hs-lead">{noteText}</p>
            <div className="flex flex-wrap gap-2.5 mt-7">
              <Link href="/about" className="hs-btn hs-btn-sm">
                Read our story <ArrowRight />
              </Link>
              <Link href="/menu" className="hs-btn hs-btn-sm">
                Explore the menu <ArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
