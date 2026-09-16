"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Calendar, Phone, MapPin, Clock } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { mediaUrl } from "@/lib/media";
import type { Tenant } from "@/types/payload";

const NAV_LINKS = [
  { href: "/about", label: "Our Story" },
  { href: "/menu", label: "Menu" },
  { href: "/contact", label: "Contact" },
];

interface NavbarProps {
  tenant: Tenant;
  hasNews?: boolean;
  onOpenNews?: () => void;
}

export function Navbar({ tenant, hasNews, onOpenNews }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="restaurant-nav sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/70">
      <div className="flex items-center justify-between gap-5 px-[5vw] py-4">
        {/* Brand identity & Company affiliation */}
        <Link href="/" className="flex items-center gap-3.5 group">
          {tenant.logo ? (
            <Image
              src={mediaUrl(tenant.logo)}
              alt={tenant.name}
              width={38}
              height={38}
              className="h-9 w-9 object-contain transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="h-9 w-9 rounded-full border border-primary/40 flex items-center justify-center text-primary text-xs font-serif italic">
              {tenant.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <span className="font-heading text-xl sm:text-2xl tracking-tight text-foreground block leading-none">
              {tenant.name}
            </span>
            <span className="text-[9px] tracking-[0.25em] uppercase text-foreground/50 block mt-0.5">
              House of Senses
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs font-medium uppercase tracking-widest transition-colors py-1 relative ${
                  isActive
                    ? "text-primary font-semibold"
                    : "text-foreground/75 hover:text-primary"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-px bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons & Mobile Trigger */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* {hasNews && onOpenNews && (
            <button
              type="button"
              onClick={onOpenNews}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs border border-primary/40 text-primary hover:bg-primary/10 text-xs font-medium tracking-wider uppercase transition-colors"
            >
              <Sparkles className="h-3 w-3" />
              <span>Latest News</span>
            </button>
          )} */}

          <Link
            href="/reservation"
            aria-label={`Reserve a table at ${tenant.name}`}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xs bg-primary text-primary-foreground text-xs font-semibold tracking-wider uppercase transition-transform hover:-translate-y-0.5 shadow-xs"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Reserve a Table</span>
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Open menu"
                className="flex h-9 w-9 items-center justify-center rounded-xs border border-border/80 text-foreground/80 md:hidden hover:border-primary hover:text-primary transition-colors"
              >
                <Menu className="h-4 w-4" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[85vw] max-w-sm bg-background p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-border/70">
                  <div>
                    <SheetTitle className="font-heading text-2xl text-foreground">
                      {tenant.name}
                    </SheetTitle>
                    <span className="text-[10px] tracking-[0.25em] uppercase text-foreground/50 block mt-0.5">
                      House of Senses
                    </span>
                  </div>
                  <button
                    aria-label="Close menu"
                    onClick={() => setOpen(false)}
                    className="p-1 rounded-xs text-foreground/60 hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <SheetDescription className="sr-only">
                  Explore the restaurant, view the menu, and reserve your table.
                </SheetDescription>

                <nav className="mt-8 flex flex-col space-y-1">
                  <Link
                    href="/"
                    onClick={() => setOpen(false)}
                    className="py-3.5 font-heading text-2xl text-foreground/85 border-b border-border/40 hover:text-primary transition-colors"
                  >
                    Home
                  </Link>
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="py-3.5 font-heading text-2xl text-foreground/85 border-b border-border/40 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                  {hasNews && onOpenNews && (
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        onOpenNews();
                      }}
                      className="py-3.5 font-heading text-2xl text-foreground/85 border-b border-border/40 hover:text-primary transition-colors text-left flex items-center justify-between w-full"
                    >
                      <span>Latest News</span>
                      <span className="text-xs uppercase tracking-widest text-primary font-sans font-semibold">
                        New
                      </span>
                    </button>
                  )}
                  <Link
                    href="/reservation"
                    onClick={() => setOpen(false)}
                    aria-label={`Reserve a table at ${tenant.name}`}
                    className="py-3.5 font-heading text-2xl text-primary border-b border-border/40 font-semibold"
                  >
                    Reserve a Table ↗
                  </Link>
                </nav>
              </div>

              {/* Mobile Drawer Details */}
              <div className="pt-6 border-t border-border/70 space-y-3 text-xs text-foreground/70">
                {tenant.address && (
                  <div className="flex items-start gap-2.5">
                    <MapPin className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    <span>{tenant.address}</span>
                  </div>
                )}
                {tenant.openingHours && (
                  <div className="flex items-center gap-2.5">
                    <Clock className="h-4 w-4 shrink-0 text-primary" />
                    <span>{tenant.openingHours}</span>
                  </div>
                )}
                {tenant.phone && (
                  <div className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 shrink-0 text-primary" />
                    <a
                      href={`tel:${tenant.phone}`}
                      className="hover:text-primary"
                    >
                      {tenant.phone}
                    </a>
                  </div>
                )}

                <div className="pt-3">
                  <Link
                    href="/reservation"
                    onClick={() => setOpen(false)}
                    aria-label={`Reserve a table at ${tenant.name}`}
                    className="flex w-full items-center justify-center gap-2 py-3 rounded-xs bg-primary text-primary-foreground text-xs font-semibold tracking-wider uppercase text-center shadow-xs"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Reserve a Table</span>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
