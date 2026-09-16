import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Calendar } from "lucide-react";
import { fetchTenantByDomain } from "@/lib/data";
import { mediaUrl } from "@/lib/media";
import { BookViewer } from "@/components/menu/BookViewer";

export default async function TenantMenuPage({
  params,
}: PageProps<"/t/[tenant]/menu">) {
  const { tenant: slug } = await params;
  const tenant = await fetchTenantByDomain(slug);
  if (!tenant) notFound();

  const menuMedia = tenant.menu || tenant.newMenu?.[0]?.src;

  if (!menuMedia) {
    return (
      <div className="flex min-h-[75vh] flex-col items-center justify-center px-6 text-center paper-texture py-20">
        <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-6 text-primary">
          <BookOpen className="h-7 w-7" />
        </div>
        <p className="eyebrow text-primary">Menu Monograph</p>
        <h1 className="font-heading text-4xl sm:text-5xl text-foreground mt-2 max-w-lg">
          The seasonal menu is being printed.
        </h1>
        <p className="mt-4 text-foreground/70 max-w-md leading-relaxed text-sm sm:text-base">
          {tenant.name} updates its selections with the season. Our team will be
          pleased to present today&apos;s specials at your table.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/reservation"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xs bg-primary text-primary-foreground text-xs font-semibold tracking-wider uppercase transition-transform hover:-translate-y-0.5 shadow-md"
          >
            <Calendar className="h-4 w-4" />
            <span>Reserve a Table</span>
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xs border border-border text-foreground text-xs font-semibold tracking-wider uppercase hover:bg-muted transition-colors"
          >
            <span>Visit Us</span>
          </Link>
        </div>
      </div>
    );
  }

  return <BookViewer menuUrl={mediaUrl(menuMedia)} tenantName={tenant.name} />;
}
