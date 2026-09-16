"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Home, Phone, Clock3, Mail } from "lucide-react";
import { getTenantUrl, tenantHoursOrStatus } from "@/lib/domain";
import type { Tenant } from "@/types/payload";

interface TopbarNavigatorProps {
  currentTenant: Tenant;
  allBranches: Tenant[];
}

export function TopbarNavigator({
  currentTenant,
  allBranches,
}: TopbarNavigatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notification = currentTenant.topbarNotification;
  const hasNotification = notification?.enabled && notification?.message;

  return (
    <div
      ref={containerRef}
      className="relative z-50 w-full bg-background border-b border-border/60 text-foreground selection:bg-primary/20"
    >
      {/* Top notification banner if enabled */}
      {hasNotification && (
        <div className="w-full bg-primary px-4 py-1.5 text-center text-[11px] font-medium tracking-widest uppercase text-primary-foreground">
          {notification.message}
        </div>
      )}

      {/* Top Bar Switcher Bar */}
      <div className="h-9 px-4 sm:px-8 flex items-center justify-center">
        {/* Desktop trigger */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          className="hidden md:flex items-center gap-3 text-xs tracking-[0.25em] uppercase hover:opacity-75 transition-opacity focus:outline-hidden"
        >
          <span className="text-foreground/70 font-normal">Our Locations:</span>
          <span className="font-semibold text-foreground flex items-center gap-2.5">
            {allBranches.map((branch, idx) => (
              <span key={branch.id} className="flex items-center gap-2.5">
                {idx > 0 && <span className="opacity-40">·</span>}
                <span>{branch.name}</span>
              </span>
            ))}
          </span>
          <span
            className="text-[9px] transition-transform duration-200 ml-0.5 text-foreground/70"
            aria-hidden="true"
          >
            {isOpen ? "▴" : "▾"}
          </span>
        </button>

        {/* Mobile trigger */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          className="md:hidden w-full flex items-center justify-between text-[11px] tracking-[0.22em] uppercase text-foreground/80 focus:outline-hidden"
        >
          <span className="font-medium">Our Locations</span>
          <span className="text-[10px] text-foreground/60">
            {isOpen ? "▴" : "▾"}
          </span>
        </button>
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full w-full max-w-4xl bg-background border-x border-b border-border/70 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-200 z-50">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/60">
            {allBranches.map((branch) => {
              const isCurrent = branch.id === currentTenant.id;
              const branchUrl = getTenantUrl(branch.domain);
              const hoursOrStatus = tenantHoursOrStatus(branch);

              return (
                <Link
                  key={branch.id}
                  href={branchUrl}
                  onClick={() => setIsOpen(false)}
                  className={`block p-5 sm:p-6 transition-colors group ${
                    isCurrent ? "bg-muted/30" : "hover:bg-muted/40"
                  }`}
                >
                  {/* Branch Title & Current Indicator */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h4 className="font-heading text-base sm:text-lg tracking-wider uppercase font-semibold text-foreground group-hover:text-primary transition-colors">
                      {branch.name}
                    </h4>
                    {isCurrent && (
                      <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-primary shrink-0 flex items-center gap-1.5">
                        <span aria-hidden>←</span> HERE
                      </span>
                    )}
                  </div>

                  {/* Branch Details */}
                  <div className="space-y-2 text-xs text-foreground/75 leading-relaxed font-sans">
                    {branch.address && (
                      <div className="flex items-start gap-2.5">
                        <Home className="h-3.5 w-3.5 shrink-0 text-foreground/80 mt-0.5" />
                        <span>{branch.address}</span>
                      </div>
                    )}

                    {branch.phone && (
                      <div className="flex items-center gap-2.5">
                        <Phone className="h-3.5 w-3.5 shrink-0 text-foreground/80" />
                        <span>{branch.phone}</span>
                      </div>
                    )}

                    {hoursOrStatus && (
                      <div className="flex items-center gap-2.5">
                        <Clock3 className="h-3.5 w-3.5 shrink-0 text-foreground/80" />
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
                      </div>
                    )}

                    {branch.email && (
                      <div className="flex items-center gap-2.5">
                        <Mail className="h-3.5 w-3.5 shrink-0 text-foreground/80" />
                        <span>{branch.email}</span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
