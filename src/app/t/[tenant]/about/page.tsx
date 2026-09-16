import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, BookOpen } from "lucide-react";
import { fetchTenantByDomain } from "@/lib/data";
import { mediaUrl } from "@/lib/media";
import { LexicalRenderer } from "@/components/richtext/LexicalRenderer";

export default async function TenantAboutPage({
  params,
}: PageProps<"/t/[tenant]/about">) {
  const { tenant: slug } = await params;
  const tenant = await fetchTenantByDomain(slug);
  if (!tenant) notFound();

  return (
    <div className="paper-texture">
      {/* ── Cinematic About Hero ── */}
      <section className="relative flex h-[62vh] min-h-[420px] w-full items-end text-white overflow-hidden">
        {tenant.aboutusHero ? (
          <Image
            src={mediaUrl(tenant.aboutusHero)}
            alt={tenant.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/65 to-black/40" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-16 space-y-3">
          <div className="flex items-center gap-3">
            <p className="text-xs uppercase tracking-[0.35em] text-white font-medium drop-shadow-xs">
              {tenant.aboutSubtitle || "Monograph & Origins"}
            </p>
            <span className="h-px w-6 bg-white/40" />
            <span className="text-xs uppercase tracking-[0.2em] text-white/85 drop-shadow-xs">
              {tenant.name}
            </span>
          </div>

          <h1 className="font-heading text-5xl sm:text-7xl text-white tracking-tight leading-tight max-w-3xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)]">
            {tenant.aboutTitle || `The story of ${tenant.name}`}
          </h1>
        </div>
      </section>

      {/* ── Story Narrative ── */}
      <section className="max-w-4xl mx-auto px-6 py-20 lg:py-28">
        <div className="mb-14 border-b border-border/70 pb-8">
          <p className="eyebrow text-primary mb-2">Our Culinary Heritage</p>
          <p className="font-heading text-2xl sm:text-3xl text-foreground italic">
            “Food is the memory of a place, the warmth of the hands that
            prepared it, and the time shared around the table.”
          </p>
        </div>

        <LexicalRenderer data={tenant.aboutus} />

        {/* Story Sign-off & Table Invitation */}
        <div className="mt-20 pt-12 border-t border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-secondary/30 p-8 rounded-xs">
          <div className="space-y-1">
            <span className="eyebrow text-primary">Join Us This Evening</span>
            <h3 className="font-heading text-2xl sm:text-3xl text-foreground">
              Experience the atmosphere firsthand.
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/menu"
              aria-label={`Explore menu for ${tenant.name}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xs border border-border text-foreground text-xs font-semibold tracking-wider uppercase hover:bg-muted transition-colors"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Explore Menu</span>
            </Link>
            <Link
              href="/reservation"
              aria-label={`Reserve a table at ${tenant.name}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xs bg-primary text-primary-foreground text-xs font-semibold tracking-wider uppercase transition-transform hover:-translate-y-0.5 shadow-sm"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Reserve a Table</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
