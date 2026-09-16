import Image from "next/image";
import Link from "next/link";
import { BookOpen, Calendar, Clock, MapPin, ArrowDown } from "lucide-react";
import { mediaUrl } from "@/lib/media";
import type { Tenant } from "@/types/payload";

export function Hero({ tenant }: { tenant: Tenant }) {
  const image = tenant.heroImagesList?.find((item) =>
    mediaUrl(item.image),
  )?.image;
  const src = mediaUrl(image || tenant.aboutusHero);

  // Extract marquee words from backend tenant data (heroMarqueeWords), with luxury fallback
  const rawWords =
    tenant.heroMarqueeWords && tenant.heroMarqueeWords.length > 0
      ? tenant.heroMarqueeWords.map((item) => item.word?.trim()).filter(Boolean)
      : ["Food", "Company", "A sense of place"];

  const words =
    rawWords.length > 0 ? rawWords : ["Food", "Company", "A sense of place"];

  // Ensure adequate repetition so the marquee track seamlessly spans full vertical height
  const wordsSequence =
    words.length < 5 ? [...words, ...words, ...words] : words;

  return (
    <section
      className={`restaurant-hero relative ${src ? "has-photograph" : ""}`}
    >
      {src ? (
        <Image
          src={src}
          alt={image?.alt || `An evening at ${tenant.name}`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : null}

      {/* Atmospheric vignette shade */}
      <div className="hero-shade" />

      {/* Hero Content */}
      <div className="hero-copy z-10">
        <div className="flex items-center gap-3 mb-2">
          <span
            className="eyebrow !text-white font-medium drop-shadow-xs"
            style={{ color: "#ffffff" }}
          >
            {tenant.heroSubtitle || "A place at the table"}
          </span>
          <span className="h-px w-6 bg-white/60" />
          <span
            className="eyebrow !text-white font-medium drop-shadow-xs"
            style={{ color: "#ffffff" }}
          >
            House of Senses
          </span>
        </div>

        <h1 className="text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)]">
          {tenant.heroTitle || "Good food.\nA little more time."}
        </h1>

        <div className="hero-bottom pt-2">
          <p className="text-white/95 max-w-xl text-base sm:text-lg leading-relaxed drop-shadow-xs">
            {tenant.heroDescription ||
              "Come hungry. Make yourself at home. Stay a little longer."}
          </p>

          <div className="hero-links flex items-center gap-4">
            <Link
              href="/menu"
              aria-label={`Explore menu for ${tenant.name}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xs bg-white text-stone-900 text-xs font-semibold tracking-wider uppercase transition-all hover:-translate-y-0.5 shadow-md hover:bg-stone-100"
            >
              <BookOpen className="h-4 w-4 text-stone-800" />
              <span>Explore Menu</span>
            </Link>

            <Link
              href="/reservation"
              aria-label={`Reserve a table at ${tenant.name}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xs bg-primary text-primary-foreground text-xs font-semibold tracking-wider uppercase transition-all hover:-translate-y-0.5 shadow-md border border-white/25 hover:opacity-95"
            >
              <Calendar className="h-4 w-4" />
              <span>Reserve a Table</span>
            </Link>
          </div>
        </div>

        {/* Ambient bottom details strip */}
        <div className="mt-12 pt-6 border-t border-white/25 flex flex-wrap items-center justify-between gap-4 text-xs text-white/90 drop-shadow-xs">
          <div className="flex flex-wrap items-center gap-6">
            {tenant.address && (
              <a
                href="#visit"
                className="flex items-center gap-2 hover:text-white transition-colors"
                aria-label={`Address: ${tenant.address}`}
              >
                <MapPin className="h-3.5 w-3.5 text-white/80" />
                <span>{tenant.address}</span>
              </a>
            )}
            {tenant.openingHours && (
              <span
                className="flex items-center gap-2"
                aria-label={`Opening hours: ${tenant.openingHours}`}
              >
                <Clock className="h-3.5 w-3.5 text-white/80" />
                <span>{tenant.openingHours}</span>
              </span>
            )}
          </div>

          <a
            href="#story"
            className="inline-flex items-center gap-1.5 text-white/90 hover:text-white transition-colors tracking-widest uppercase text-xs font-medium drop-shadow-xs py-1.5"
            aria-label="Scroll down to discover our story"
          >
            <span>Discover</span>
            <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
          </a>
        </div>
      </div>

      {/* Vertical Marquee Side Strip */}
      <div className="hero-side-marquee" aria-hidden="true">
        <div className="hero-side-marquee-track">
          {[0, 1].map((copyIndex) => (
            <div key={copyIndex} className="hero-side-marquee-group">
              {wordsSequence.map((word, i) => (
                <div
                  key={`${copyIndex}-${i}`}
                  className="inline-flex items-center gap-3 py-4"
                >
                  <span className="whitespace-nowrap">{word}</span>
                  <span
                    className="opacity-50 text-[9px] select-none"
                    aria-hidden
                  >
                    ·
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
