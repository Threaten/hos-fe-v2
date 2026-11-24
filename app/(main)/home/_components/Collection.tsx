"use client";

import React, { useMemo, useState } from "react";
import Tile from "../../components/Tile";
import ImageLightbox from "../../components/ImageLightbox";
import { useT } from "@/app/i18n/useT";


export interface CollectionImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface CollectionGroup {
  key: string;
  label: string;
  images: CollectionImage[];
}

interface CollectionProps {
  groups: CollectionGroup[];
  /** Accessible name for the section */
  name: string;
  /** Load the first tiles eagerly (they sit just below the hero) */
  priority?: boolean;
  /** Tiles shown before "Show all"; omit to show everything */
  pageSize?: number;
}

/**
 * Photo index: a rail of filters with counts on the left (a row on mobile)
 * and the photos as tiles, each tagged with its group.
 */
export default function Collection({ groups, name, priority = false, pageSize = Infinity }: CollectionProps) {
  const visibleGroups = groups.filter((g) => g.images.length > 0);
  const [filter, setFilter] = useState<string>("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const t = useT();

  const all = useMemo(
    () => visibleGroups.flatMap((g) => g.images.map((img) => ({ ...img, group: g.label, key: g.key }))),
    [visibleGroups],
  );
  const shown = filter === "all" ? all : all.filter((i) => i.key === filter);
  const limit = expanded ? shown.length : pageSize;
  const visible = shown.slice(0, limit);

  if (all.length === 0) return null;

  const filters = [{ key: "all", label: t("All"), count: all.length }, ...visibleGroups.map((g) => ({ key: g.key, label: g.label, count: g.images.length }))];
  const current = openIndex != null ? shown[openIndex] : null;

  return (
    <section className="hs-shell" aria-label={t("Photos of {name}", { name })}>
      <div>
        <ul className="hs-rail-sticky flex flex-wrap lg:flex-col justify-center lg:justify-start gap-x-7 gap-y-3 lg:gap-y-2.5 mb-8 lg:mb-0" aria-label={t("Filter photos")}>
          {filters.map((f) => (
            <li key={f.key}>
              <button
                type="button"
                onClick={() => {
                  setFilter(f.key);
                  setExpanded(false);
                }}
                aria-pressed={filter === f.key}
                aria-current={filter === f.key ? "page" : undefined}
                className="hs-ui hs-nav-link text-[0.9375rem] lg:text-[1.0625rem]"
                style={{ color: "var(--pen)" }}
              >
                {f.label}
                <span className="hs-count">{f.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="hs-main">
      <ul className="grid grid-cols-2 lg:grid-cols-3 gap-x-3 md:gap-x-5 gap-y-8 md:gap-y-8">
        {visible.map((img, i) => (
          <li key={`${filter}-${img.src}-${i}`}>
            <button
              type="button"
              onClick={() => setOpenIndex(i)}
              className="group block w-full text-left"
              aria-label={img.caption ? t("Open photo: {caption}", { caption: img.caption }) : t("Open photo {n}", { n: String(i + 1) })}
            >
              <Tile
                inline
                src={img.src}
                alt={img.alt}
                aspect="15 / 16"
                tag={img.group}
                label={t("No. {n}", { n: String(i + 1).padStart(2, "0") })}
                title={img.caption || undefined}
                priority={priority && i < 3}
                reveal={priority && i < 3 ? "load" : "scroll"}
                revealDelay={(i % 3) * 0.07}
                sizes="(max-width: 1024px) 46vw, 25vw"
                imgClassName="transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </button>
          </li>
        ))}
      </ul>
      {shown.length > limit && (
        <div className="mt-8 flex justify-center">
          <button type="button" onClick={() => setExpanded(true)} className="hs-btn hs-btn-sm">
            {t("Show all {count}", { count: String(shown.length) })}
          </button>
        </div>
      )}
      </div>

      {current && (
        <ImageLightbox
          isOpen
          imageSrc={current.src}
          imageAlt={current.alt}
          caption={current.caption || current.group}
          onClose={() => setOpenIndex(null)}
          onNext={() => setOpenIndex((p) => ((p ?? 0) + 1) % shown.length)}
          onPrev={() => setOpenIndex((p) => ((p ?? 0) - 1 + shown.length) % shown.length)}
          currentIndex={openIndex ?? 0}
          totalImages={shown.length}
        />
      )}
    </section>
  );
}
