import Image from "next/image";
import Link from "next/link";
import { UtensilsCrossed, Wine, HeartHandshake } from "lucide-react";
import { mediaUrl } from "@/lib/media";
import { BranchCard } from "@/components/main/BranchCard";
import { QuoteMarquee } from "@/components/main/QuoteMarquee";
import type { HomeInformation, Tenant } from "@/types/payload";

export function MainLanding({
  home,
  tenants,
}: {
  home: HomeInformation | null;
  tenants: Tenant[];
}) {
  const heroImage =
    mediaUrl(home?.["Background Image (for Mobile)"]) ||
    mediaUrl(home?.["Catch Phrase Image 1"]) ||
    mediaUrl(tenants[0]?.heroImagesList?.[0]?.image);
  const logo = mediaUrl(home?.logo);
  const quotes = home?.["quote(s)"]?.map((q) => q.quote).filter(Boolean) as
    | string[]
    | undefined;

  return (
    <main className="house-landing min-h-screen flex flex-col paper-texture">
      {/* ── Top Masthead / Header ── */}
      <header className="house-header sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/70">
        <div className="flex items-center gap-3.5">
          {logo ? (
            <Image
              src={logo}
              alt={home?.name || "House of Senses"}
              width={34}
              height={34}
              className="h-8 w-8 object-contain"
            />
          ) : (
            <div className="h-8 w-8 rounded-full border border-primary/40 flex items-center justify-center text-primary text-xs font-serif italic">
              HS
            </div>
          )}
          <div>
            <Link
              href="/"
              className="font-heading text-xl sm:text-2xl tracking-tight text-foreground block leading-none"
            >
              {home?.name || "House of Senses"}
            </Link>
            <span className="text-[9px] tracking-[0.25em] uppercase text-foreground/50 block mt-0.5">
              Dining Monograph • Saigon
            </span>
          </div>
        </div>

        <nav className="flex items-center gap-6 text-xs uppercase tracking-widest text-foreground/75">
          <a
            href="#branches"
            className="hover:text-primary transition-colors hidden sm:inline-flex items-center gap-1.5"
          >
            <span>Our Branches</span>
            <span aria-hidden>↓</span>
          </a>
          <a
            href="#philosophy"
            className="hover:text-primary transition-colors hidden md:inline-flex"
          >
            Philosophy
          </a>
          <a
            href="#branches"
            aria-label="Reserve a table at one of our branches"
            className="px-4 py-2 rounded-xs bg-primary text-primary-foreground text-xs font-semibold tracking-wider uppercase transition-transform hover:-translate-y-0.5 shadow-xs"
          >
            Reserve a Table
          </a>
        </nav>
      </header>

      {/* ── Hero Monograph Cover ── */}
      <section className="house-intro border-b border-border/70">
        <div className="house-intro-copy space-y-8">
          <div className="flex items-center gap-3">
            <span className="eyebrow text-primary">
              House of Senses / Branches
            </span>
            <span className="h-px w-8 bg-border" />
            <span className="eyebrow">Saigon, Vietnam</span>
          </div>

          <h1 className="font-heading text-foreground">
            A sense
            <br />
            of <em className="font-normal italic">belonging.</em>
          </h1>

          <div className="house-intro-note">
            <p className="text-foreground/80 leading-relaxed">
              {home?.["Catch Phrase 1"] ||
                "Good food, warm company, and a place to stay awhile."}{" "}
              {home?.["Catch Phrase 2"] ||
                "Different places, a shared feeling. Find your home at our table."}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-6">
            <a
              className="text-link font-medium text-xs tracking-widest uppercase hover:text-primary"
              href="#branches"
            >
              <span>Explore Our Branches</span>
              <span aria-hidden>↓</span>
            </a>
            <span className="text-xs text-foreground/40 hidden sm:inline">
              •
            </span>
            <span className="text-xs text-foreground/60 hidden sm:inline">
              {tenants.length} distinct dining atmospheres
            </span>
          </div>
        </div>

        {heroImage ? (
          <div className="house-intro-image passe-partout rounded-xs group overflow-hidden">
            <Image
              src={heroImage}
              alt="House of Senses warm dining atmosphere"
              fill
              priority
              sizes="(min-width: 960px) 50vw, 100vw"
              className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.02]"
            />
            <span className="rounded-xs">A place to make your own.</span>
          </div>
        ) : null}
      </section>

      {/* ── Continuous Quotes Ribbon ── */}
      <QuoteMarquee quotes={quotes} />

      {/* ── Restaurant Directory ("Our Branches") ── */}
      <section
        className="house-restaurants max-w-7xl mx-auto w-full"
        id="branches"
      >
        <div className="house-restaurants-heading">
          <div className="space-y-2">
            <p className="eyebrow text-primary">01 / Our Branches</p>
            <h2 className="font-heading text-foreground">
              Pick your dining room.
            </h2>
          </div>
          <div className="text-right">
            <span className="eyebrow block">
              {String(tenants.length).padStart(2, "0")} Branches, countless
              evenings
            </span>
            <span className="text-xs text-foreground/50 mt-1 block">
              Original menus • Direct table reservations
            </span>
          </div>
        </div>

        <div className="mt-8 space-y-0">
          {tenants.map((tenant, i) => (
            <BranchCard key={tenant.id} tenant={tenant} index={i} />
          ))}

          {!tenants.length ? (
            <div className="py-20 text-center border-t border-border">
              <p className="font-heading text-2xl text-foreground/70">
                Our branches are preparing for service.
              </p>
              <p className="mt-2 text-sm text-foreground/50">
                Please check back in a moment or visit us this evening.
              </p>
            </div>
          ) : null}
        </div>
      </section>

      {/* ── Editorial Philosophy / Three Tenets ── */}
      <section
        className="border-y border-border/80 bg-secondary/20 py-20 lg:py-28 px-6 lg:px-12"
        id="philosophy"
      >
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-16 space-y-3">
            <p className="eyebrow text-primary">02 / The Philosophy</p>
            <h2 className="font-heading text-3xl sm:text-5xl text-foreground leading-tight">
              Hospitality as a tactile art form.
            </h2>
            <p className="text-foreground/75 text-sm sm:text-base leading-relaxed pt-2">
              Every House of Senses restaurant begins with the conviction that
              great dining is not merely about consumption—it is an invitation
              to pause, linger, and connect.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14 border-t border-border/60 pt-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <UtensilsCrossed className="h-5 w-5 text-primary" />
                <span className="font-heading text-xl text-foreground">
                  The Seasonal Table
                </span>
              </div>
              <p className="text-foreground/70 text-sm leading-relaxed">
                Honest provenance, daily market selections, and respect for
                culinary craft. We let ingredients speak with clarity and
                warmth.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Wine className="h-5 w-5 text-primary" />
                <span className="font-heading text-xl text-foreground">
                  The Intimate Space
                </span>
              </div>
              <p className="text-foreground/70 text-sm leading-relaxed">
                Considered acoustics, tactile natural woods, warm candle glows,
                and room for laughter and unhurried conversation.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <HeartHandshake className="h-5 w-5 text-primary" />
                <span className="font-heading text-xl text-foreground">
                  The Shared Evening
                </span>
              </div>
              <p className="text-foreground/70 text-sm leading-relaxed">
                Hospitality that anticipates without hovering. From your first
                greeting to the final farewell, you are in caring hands.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Monograph Footer ── */}
      <footer className="house-footer mt-auto">
        <div className="space-y-3">
          <p className="font-heading text-4xl sm:text-5xl text-white tracking-tight">
            See you at the table.
          </p>
          <p className="text-white/60 text-xs sm:text-sm max-w-md leading-relaxed">
            House of Senses is an independent hospitality group based in Saigon,
            dedicated to creating memorable dining rooms and neighborhood
            bistros.
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-3 text-white/65 text-xs">
          <div className="flex flex-wrap gap-6">
            <a href="#branches" className="hover:text-white transition-colors">
              Our Branches
            </a>
            <a
              href="#philosophy"
              className="hover:text-white transition-colors"
            >
              Philosophy
            </a>
          </div>
          <span>
            © {new Date().getFullYear()} House of Senses. All rights reserved.
          </span>
        </div>
      </footer>
    </main>
  );
}
