"use client";

import Image from "next/image";
import {
  Clock,
  MapPin,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
} from "lucide-react";
import { getTenantUrl } from "@/lib/domain";
import { mediaUrl } from "@/lib/media";
import type { Tenant } from "@/types/payload";

export function BranchCard({
  tenant,
  index,
}: {
  tenant: Tenant;
  index: number;
}) {
  const image =
    tenant.heroImagesList?.find((item) => mediaUrl(item.image))?.image ||
    tenant.shortAboutCollages?.[0]?.image;
  const closed = tenant.status === "closed";
  const tenantUrl = getTenantUrl(tenant.domain);
  const formattedIndex = String(index + 1).padStart(2, "0");

  return (
    <article className="group relative border-t border-border/80 pt-12 pb-16 transition-colors first:border-t-0">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Index & chapter badge */}
        <div className="lg:col-span-1 flex items-center lg:flex-col lg:items-start gap-3">
          <span className="font-heading text-3xl lg:text-4xl text-foreground/60 font-normal tabular-nums">
            {formattedIndex}
          </span>
          <span className="text-[10px] tracking-[0.25em] uppercase text-foreground/75 font-semibold">
            Branch
          </span>
        </div>

        {/* Featured Image */}
        <div className="lg:col-span-6">
          <a
            href={`https://${tenant.domain}.houseofsenses.vn`}
            onClick={(e) => {
              e.currentTarget.href = tenantUrl;
            }}
            aria-label={`Visit ${tenant.name} branch`}
            className="block overflow-hidden bg-muted/40 aspect-[4/3] relative rounded-sm group/img"
          >
            {image ? (
              <Image
                src={mediaUrl(image)}
                alt={image.alt || tenant.name}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 ease-out group-hover/img:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted/30 text-xs uppercase tracking-widest text-foreground/60 font-medium">
                {tenant.name}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-semibold tracking-wider uppercase opacity-0 group-hover/img:opacity-100 transition-opacity duration-500 drop-shadow-xs">
              <span>Visit Branch</span>
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </a>
        </div>

        {/* Story & Information */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="eyebrow text-primary">
                {tenant.heroSubtitle || "Neighborhood Bistro"}
              </span>
              {closed ? (
                <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-destructive">
                  Currently Closed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-emerald-700 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Welcoming Guests
                </span>
              )}
            </div>

            <h3 className="font-heading text-4xl lg:text-5xl tracking-tight text-foreground mt-2 mb-4 leading-tight">
              <a
                href={`https://${tenant.domain}.houseofsenses.vn`}
                onClick={(e) => {
                  e.currentTarget.href = tenantUrl;
                }}
                className="hover:text-primary transition-colors"
              >
                {tenant.name}
              </a>
            </h3>

            <p className="text-foreground/75 text-sm sm:text-base leading-relaxed max-w-xl">
              {tenant.heroDescription ||
                "Thoughtfully prepared seasonal food, carefully chosen wines, and an intimate setting made for unhurried conversation."}
            </p>
          </div>

          <div className="space-y-2.5 pt-4 border-t border-border/60 text-xs sm:text-sm text-foreground/75">
            {tenant.address && (
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-foreground/70 mt-0.5" />
                <span className="leading-snug">{tenant.address}</span>
              </div>
            )}
            {tenant.openingHours && (
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 shrink-0 text-foreground/70" />
                <span>{tenant.openingHours}</span>
              </div>
            )}
          </div>

          {/* Action Links */}
          <div className="flex flex-wrap items-center gap-5 pt-2">
            {!closed && (
              <a
                href={`https://${tenant.domain}.houseofsenses.vn`}
                onClick={(e) => {
                  e.currentTarget.href = tenantUrl;
                }}
                aria-label={`Visit ${tenant.name} branch`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-primary text-primary-foreground text-xs font-semibold tracking-wider uppercase transition-transform hover:-translate-y-0.5 shadow-sm"
              >
                <span>Visit Branch</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            )}

            <a
              href={`${tenantUrl}/menu`}
              aria-label={`Explore menu for ${tenant.name}`}
              className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-foreground/85 hover:text-primary transition-colors py-2 border-b border-border/80 hover:border-primary"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Explore Menu</span>
            </a>

            <a
              href={`${tenantUrl}/reservation`}
              aria-label={`Reserve a table at ${tenant.name}`}
              className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-foreground/85 hover:text-primary transition-colors py-2 border-b border-border/80 hover:border-primary"
            >
              <CalendarDays className="h-3.5 w-3.5" />
              <span>Reserve a Table</span>
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
