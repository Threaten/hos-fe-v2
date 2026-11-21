"use client";

import React from "react";
import CTA from "../components/CTA";
import Collection from "../home/_components/Collection";
import { useTenant } from "@/app/contexts/TenantContext";
import { photoGroups } from "@/app/utils/photos";

/** Every photo of this branch, with the same set filters as the home page */
export default function Gallery() {
  const { tenant } = useTenant();
  const groups = photoGroups(tenant);
  const total = groups.reduce((n, g) => n + g.images.length, 0);
  const name = tenant?.name ?? "House of Senses";

  return (
    <div>
      <section className="hs-shell pt-8 md:pt-12 pb-8 md:pb-12">
        <div className="hs-main grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,300px)] gap-x-10 gap-y-6 items-start">
          <h1 className="hs-hero animate-rise text-center lg:text-left">gallery</h1>
          {total > 0 && (
            <p
              className="text-[1.1875rem] leading-[1.25] tracking-[-0.015em] xl:pt-3 text-center lg:text-left animate-rise"
              style={{ color: "var(--pen)" }}
            >
              {total} {total === 1 ? "photo" : "photos"} from {name.toLowerCase()}
              {groups.length > 1 ? `, in ${groups.length} sets` : ""}.
            </p>
          )}
        </div>
      </section>

      {tenant && total === 0 ? (
        <div className="hs-shell">
          <div className="hs-main py-12 text-center lg:text-left">
            <p className="hs-title" style={{ color: "var(--ink)" }}>The album is still empty.</p>
            <p className="hs-note mt-3">New photos are on their way</p>
          </div>
        </div>
      ) : (
        <Collection groups={groups} name={name} />
      )}

      <CTA />
    </div>
  );
}
