import Link from "next/link";
import { Calendar, Phone, ArrowRight } from "lucide-react";
import type { Tenant } from "@/types/payload";
import { buildTenantTheme } from "@/lib/theme";

export function CTA({ tenant }: { tenant: Tenant }) {
  const theme = buildTenantTheme(tenant.mainColor);
  const isLight = theme.primaryForeground === "#171310";

  // Dynamic colors based on background luminance for optimal contrast and readability
  const textColor = isLight ? "text-stone-900" : "text-white";
  const mutedTextColor = isLight ? "text-stone-700" : "text-white/80";
  const bodyTextColor = isLight ? "text-stone-800" : "text-white/90";
  const dividerColor = isLight ? "bg-stone-900/20" : "bg-white/30";
  const borderDividerColor = isLight
    ? "border-stone-900/20"
    : "border-white/25";

  const primaryBtnClass = isLight
    ? "bg-stone-950 text-white hover:bg-stone-800"
    : "bg-white text-stone-900 hover:bg-stone-100";

  const secondaryBtnClass = isLight
    ? "border border-stone-900/30 text-stone-900 hover:bg-stone-900/10"
    : "border border-white/40 text-white hover:bg-white/10";

  return (
    <section
      className="restaurant-invitation relative overflow-hidden"
      style={{
        backgroundColor: tenant.mainColor || "var(--primary, #8a1f1f)",
      }}
    >
      {/* Soft ambient lighting for depth without muddying or obstructing text */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.08),_transparent_65%)] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-semibold tracking-[0.25em] uppercase ${mutedTextColor}`}
          >
            An Open Invitation
          </span>
          <span className={`h-px w-8 ${dividerColor}`} />
          <span
            className={`text-xs font-medium tracking-[0.2em] uppercase ${mutedTextColor}`}
          >
            {tenant.name}
          </span>
        </div>

        <h2
          className={`font-heading ${textColor} tracking-tight max-w-3xl leading-tight text-balance`}
        >
          {tenant.ctaTitle || "Your table\nis waiting."}
        </h2>

        <div
          className={`invitation-bottom pt-6 border-t ${borderDividerColor} flex flex-col md:flex-row md:items-end justify-between gap-8`}
        >
          <p
            className={`${bodyTextColor} text-base sm:text-lg leading-relaxed max-w-xl font-light`}
          >
            {tenant.ctaText ||
              "A long lunch, a quiet dinner, a reason to come together. We would love to welcome you to our table this evening."}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/reservation"
              aria-label={`Reserve a table at ${tenant.name}`}
              className={`inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xs ${primaryBtnClass} text-xs font-semibold tracking-wider uppercase transition-all hover:-translate-y-0.5 shadow-md`}
            >
              <Calendar className="h-4 w-4" />
              <span>Reserve a Table</span>
            </Link>

            {tenant.phone ? (
              <a
                href={`tel:${tenant.phone}`}
                aria-label={`Call ${tenant.name} at ${tenant.phone}`}
                className={`inline-flex items-center gap-2 px-5 py-3.5 rounded-xs ${secondaryBtnClass} text-xs font-medium tracking-wider uppercase transition-colors`}
              >
                <Phone className="h-3.5 w-3.5" />
                <span>Call {tenant.phone}</span>
              </a>
            ) : (
              <Link
                href="/menu"
                aria-label={`Explore menu for ${tenant.name}`}
                className={`inline-flex items-center gap-2 px-5 py-3.5 rounded-xs ${secondaryBtnClass} text-xs font-medium tracking-wider uppercase transition-colors`}
              >
                <span>Explore Menu</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
