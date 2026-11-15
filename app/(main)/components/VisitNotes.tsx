"use client";

import React from "react";
import type { Tenant } from "@/api/queries";
import OpeningStatus from "@/app/components/OpeningStatus";
import { mapsUrl } from "@/app/utils/maps";
import SocialIcons from "./SocialIcons";

/** Details beside a form: where, when, and how to reach a branch */
export default function VisitNotes({
  tenant,
  intro,
}: {
  tenant?: Tenant | null;
  intro?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-10">
      {intro}
      {tenant && (
        <dl className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-x-10 gap-y-7 text-[1.0625rem] leading-snug border-t pt-8" style={{ borderColor: "var(--line)" }}>
          <div className="sm:col-span-2">
            <dt className="hs-label mb-2">Find us</dt>
            <dd>
              <span className="hs-title block mb-1.5" style={{ color: "var(--pen)" }}>
                {tenant.name.toLowerCase()}
              </span>
              {tenant.address && (
                <a href={mapsUrl(tenant)} target="_blank" rel="noopener noreferrer" className="hs-link" style={{ color: "var(--ink)" }}>
                  {tenant.address}
                </a>
              )}
            </dd>
          </div>
          {(tenant.openingHours || tenant.status) && (
            <div>
              <dt className="hs-label mb-2">Open</dt>
              <dd style={{ color: "var(--ink)" }}>
                <OpeningStatus branch={tenant} showHours />
              </dd>
            </div>
          )}
          {tenant.phone && (
            <div>
              <dt className="hs-label mb-2">Call</dt>
              <dd>
                <a href={`tel:${tenant.phone.replace(/\s+/g, "")}`} className="hs-link">
                  {tenant.phone}
                </a>
              </dd>
            </div>
          )}
          {tenant.email && (
            <div>
              <dt className="hs-label mb-2">Write</dt>
              <dd>
                <a href={`mailto:${tenant.email}`} className="hs-link [overflow-wrap:anywhere]">
                  {tenant.email}
                </a>
              </dd>
            </div>
          )}
          <div>
            <dt className="hs-label mb-2.5">Follow</dt>
            <dd style={{ color: "var(--ink)" }}>
              <SocialIcons tenant={tenant} />
            </dd>
          </div>
        </dl>
      )}
    </div>
  );
}
