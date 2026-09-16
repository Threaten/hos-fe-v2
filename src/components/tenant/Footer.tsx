"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock3, Home, Mail, Phone } from "lucide-react";
import { getTenantUrl, tenantHoursOrStatus } from "@/lib/domain";
import { SocialLinks } from "@/components/tenant/SocialLinks";
import type { Tenant } from "@/types/payload";

interface FooterProps {
  tenant: Tenant;
  allBranches?: Tenant[];
}

export function Footer({ tenant, allBranches = [] }: FooterProps) {
  const [expanded, setExpanded] = useState(false);
  const branches = allBranches.length > 0 ? allBranches : [tenant];

  return (
    <footer
      className="restaurant-footer border-t border-border/80 w-full"
      id="visit"
    >
      {/* Top separator line with brand accent */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="max-w-7xl mx-auto w-full px-6 sm:px-10 lg:px-14 pt-14 pb-12">
        {/* Two-Column Grid: Both Vertically and Horizontally Centralized */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center justify-items-center">
          {/* LEFT: House of Senses Brand Mark & Info (horizontally & vertically centered) */}
          <div className="flex flex-col items-center justify-center text-center space-y-6 w-full max-w-md mx-auto">
            <div>
              <h2
                className="font-heading font-normal leading-[0.75] text-foreground inline-block text-left"
                style={{
                  fontSize: "clamp(3.25rem, 6.5vw, 6.5rem)",
                  letterSpacing: "-0.04em",
                }}
              >
                <span className="block">House</span>
                <span className="block whitespace-nowrap pl-[clamp(1.75rem,5vw,5rem)]">
                  of Senses
                </span>
              </h2>
            </div>

            <div className="pt-4 border-t border-border/60 w-full max-w-xs flex flex-col items-center text-center mx-auto">
              <span className="text-[10px] tracking-[0.25em] uppercase text-foreground/50 block mb-3">
                Connect with {tenant.name}
              </span>
              <SocialLinks tenant={tenant} className="justify-center" />
            </div>
          </div>

          {/* RIGHT: Our Locations Accordion (horizontally & vertically centered) */}
          <div className="flex flex-col items-center justify-center space-y-4 w-full max-w-lg mx-auto">
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="flex items-center justify-center gap-3 pb-2.5 border-b border-border/60 group focus:outline-hidden cursor-pointer w-fit mx-auto"
              aria-expanded={expanded}
            >
              <span className="text-xs font-semibold tracking-[0.35em] uppercase text-foreground/80 group-hover:text-primary transition-colors">
                Our Locations
              </span>
              <span className="text-xs text-foreground/40 font-mono">
                ({branches.length}{" "}
                {branches.length === 1 ? "branch" : "branches"})
              </span>
              <div
                className="text-xs text-foreground/60 transition-transform duration-300 group-hover:text-primary"
                style={{
                  transform: expanded ? "rotate(180deg)" : "none",
                }}
                aria-hidden="true"
              >
                ▾
              </div>
            </button>

            {/* Collapsible Branches List (centered cards) */}
            <div
              className={`w-full overflow-hidden transition-all duration-500 ease-in-out ${
                expanded
                  ? "max-h-[3000px] opacity-100 mt-2"
                  : "max-h-0 opacity-0 pointer-events-none"
              }`}
            >
              <div className="flex flex-col gap-6 pt-2 pb-1 text-left w-full">
                {branches.map((branch) => {
                  const isCurrent = branch.id === tenant.id;
                  const branchUrl = getTenantUrl(branch.domain);
                  const hoursOrStatus = tenantHoursOrStatus(branch);

                  return (
                    <div
                      key={branch.id}
                      className={`p-4 sm:p-5 rounded-xs transition-colors border ${
                        isCurrent
                          ? "border-primary/40 bg-primary/5 shadow-xs"
                          : "border-border/50 hover:border-border hover:bg-muted/20"
                      }`}
                    >
                      {/* Branch title and '← here' indicator */}
                      <div className="flex items-center gap-3 mb-2.5 flex-wrap">
                        <span className="text-xs text-primary font-bold">
                          ●
                        </span>
                        <a
                          href={branchUrl}
                          className="font-heading text-base sm:text-lg font-semibold tracking-wider uppercase text-foreground hover:text-primary transition-colors"
                        >
                          {branch.name}
                        </a>
                        {isCurrent && (
                          <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-primary flex items-center gap-1.5 ml-1">
                            <span aria-hidden>←</span> HERE
                          </span>
                        )}
                      </div>

                      {/* Details with icons */}
                      <div className="flex flex-col gap-1.5 text-xs text-foreground/75 leading-relaxed">
                        {branch.address && (
                          <p className="flex items-start gap-2">
                            <Home className="h-3.5 w-3.5 shrink-0 text-foreground/70 mt-0.5" />
                            <span>{branch.address}</span>
                          </p>
                        )}

                        {branch.phone && (
                          <p className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 shrink-0 text-foreground/70" />
                            <a
                              href={`tel:${branch.phone}`}
                              className="hover:text-primary transition-colors"
                            >
                              {branch.phone}
                            </a>
                          </p>
                        )}

                        {hoursOrStatus && (
                          <p className="flex items-center gap-2">
                            <Clock3 className="h-3.5 w-3.5 shrink-0 text-foreground/70" />
                            <span
                              className={
                                hoursOrStatus === "Temporarily closed" ||
                                hoursOrStatus === "Closed"
                                  ? "text-destructive font-medium"
                                  : ""
                              }
                            >
                              {hoursOrStatus}
                            </span>
                          </p>
                        )}

                        {branch.email && (
                          <p className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 shrink-0 text-foreground/70" />
                            <a
                              href={`mailto:${branch.email}`}
                              className="hover:text-primary transition-colors"
                            >
                              {branch.email}
                            </a>
                          </p>
                        )}
                      </div>

                      {/* Branch social links */}
                      <div className="mt-3 pt-2 border-t border-border/40 flex justify-start">
                        <SocialLinks tenant={branch} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright line (horizontally centered) */}
        <div className="mt-14 pt-6 border-t border-border/70 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs text-foreground/75 tracking-wider text-center">
          <p>
            &copy; {new Date().getFullYear()} houseofsenses.vn • All rights
            reserved
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/reservation"
              aria-label={`Reserve a table at ${tenant.name}`}
              className="text-primary hover:underline underline-offset-4 uppercase tracking-widest text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <span>Reserve a Table</span>
              <span aria-hidden>↗</span>
            </Link>
            <span className="hidden md:inline font-serif italic text-foreground/70">
              See you at the table.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
