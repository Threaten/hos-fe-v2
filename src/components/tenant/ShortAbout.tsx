import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { mediaUrl } from "@/lib/media";
import type { Tenant } from "@/types/payload";

export function ShortAbout({ tenant }: { tenant: Tenant }) {
  const images = (tenant.shortAboutCollages ?? []).filter((item) =>
    mediaUrl(item.image),
  );

  return (
    <section className="restaurant-story border-b border-border/70" id="story">
      <div className="story-opening">
        <div className="space-y-1">
          <p className="eyebrow text-primary">01 / The Restaurant</p>
          <span className="text-xs text-foreground/75 tracking-wider uppercase font-medium block">
            {tenant.name}
          </span>
        </div>
        <div>
          <h2 className="font-heading text-foreground">
            {tenant.shortAboutTitle || "A small place. A generous welcome."}
          </h2>
        </div>
      </div>

      <div className="story-composition">
        {images[0] ? (
          <figure className="story-main-image passe-partout rounded-xs group overflow-hidden">
            <div className="relative w-full h-full min-h-[420px] overflow-hidden">
              <Image
                src={mediaUrl(images[0].image)}
                alt={images[0].image?.alt || `A closer look at ${tenant.name}`}
                fill
                sizes="(min-width: 900px) 55vw, 90vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
            </div>
            <figcaption className="text-xs text-foreground/80 tracking-wider uppercase pt-3 flex items-center justify-between">
              <span>Plate I / Dining Room</span>
              <span>Saigon</span>
            </figcaption>
          </figure>
        ) : null}

        <div className="story-note flex flex-col justify-between">
          <div>
            <span className="story-flower" aria-hidden>
              ✳
            </span>
            <p className="drop-cap text-foreground/90 leading-relaxed text-base sm:text-lg">
              {tenant.shortAboutText ||
                "Good ingredients, familiar flavours, and the pleasure of staying at the table a little longer. We source thoughtfully from local purveyors and prepare each dish with unhurried devotion."}
            </p>

            <div className="pt-4">
              <Link
                href="/about"
                className="text-link text-xs font-semibold uppercase tracking-widest text-primary hover:text-foreground"
              >
                <span>Read our story & philosophy</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {images[1] ? (
            <figure className="story-detail-image passe-partout rounded-xs group overflow-hidden mt-8">
              <div className="relative w-full h-full min-h-[260px] overflow-hidden">
                <Image
                  src={mediaUrl(images[1].image)}
                  alt={images[1].image?.alt || `Details from ${tenant.name}`}
                  fill
                  sizes="(min-width: 900px) 24vw, 60vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              </div>
              <figcaption className="text-xs text-foreground/75 tracking-widest uppercase pt-2">
                Plate II / Atmosphere
              </figcaption>
            </figure>
          ) : null}
        </div>
      </div>
    </section>
  );
}
