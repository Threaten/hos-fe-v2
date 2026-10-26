import { notFound } from "next/navigation";
import Hero from "../../../(main)/home/_components/Hero";
import ShortAbout from "../../../(main)/home/_components/ShortAbout";
import CTA from "../../../(main)/components/CTA";
import Moments from "../../../(main)/home/_components/Moments";
import TenantHomeInteractive from "./TenantHomeInteractive";
import AboutPage from "../../../(main)/about/page";
import GalleryPage from "../../../(main)/gallery/page";
import ContactForm from "../../../(main)/contact/_components/ContactForm";
import ReservationForm from "../../../(main)/reservation/_components/ReservationForm";
import TenantFlipbookWrapper from "../../../(main)/menu/_components/TenantFlipbookWrapper";
import LuckyWheel from "../../../(main)/lucky-wheel/_components/LuckyWheel";
import { API_URL } from "@/app/utils/constants";
import Link from "next/link";
import { resolveBackendMediaUrl } from "@/app/utils/media";
import { fetchMenuByBranch, type GalleryItem } from "@/api/queries";
import { fetchTenantServer } from "@/app/utils/tenantServer";

interface PageProps {
  params: Promise<{ tenant: string; slug?: string[] }>;
}

async function fetchGalleryServer(tenantId: string): Promise<GalleryItem[]> {
  try {
    const res = await fetch(
      `${API_URL}/api/gallery?where[branch][equals]=${encodeURIComponent(tenantId)}&depth=1&limit=6`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json?.docs ?? [];
  } catch {
    return [];
  }
}

export default async function TenantPage({ params }: PageProps) {
  const { tenant: tenantSlug, slug = [] } = await params;
  const pathname = slug.join("/");

  const tenant = await fetchTenantServer(tenantSlug);
  if (!tenant) notFound();

  switch (pathname) {
    case "":
    case "home": {
      const galleryItems = await fetchGalleryServer(tenant.id);
      const transformedImages = galleryItems.map((item: GalleryItem) => ({
        src: resolveBackendMediaUrl(item.image),
        alt: item.caption || item.image?.alt || "Gallery image",
        branch: item.branch?.name || "",
        caption: item.caption || "",
      }));
      return (
        <div>
          <Hero tenant={tenant} />
          <ShortAbout tenant={tenant} />
          <TenantHomeInteractive
            transformedImages={transformedImages}
            newMenu={tenant.newMenu ?? []}
            tenantName={tenant.name}
            galleryText={tenant.galleryText}
            tenant={tenant}
          />
          <Moments
            images={
              transformedImages.length > 1
                ? transformedImages.slice(1)
                : transformedImages
            }
            tenant={tenant}
          />
        </div>
      );
    }

    case "about":
      return <AboutPage />;

    case "menu": {
      const menu = await fetchMenuByBranch(tenant.id);
      const menuUrl = resolveBackendMediaUrl(
        menu?.file || menu?.pages?.[0] || tenant.menu,
      );

      if (!menuUrl) {
        return (
          <section className="hos-gutter pt-12 md:pt-[78px] pb-24 md:pb-[160px]">
            <p className="hos-label mb-3" style={{ color: "var(--foreground)" }}>
              Our menu
            </p>
            <h1 className="hos-display max-w-[18ch]" style={{ color: "var(--color-main)" }}>
              The menu is being set at the table. Check back soon.
            </h1>
            <p className="mt-5 max-w-[48ch]" style={{ color: "var(--color-ink)" }}>
              {tenant.name} hasn&apos;t published its menu online yet. Call us
              {tenant.phone ? ` on ${tenant.phone}` : ""} and we&apos;ll walk you
              through what&apos;s cooking.
            </p>
            <Link href="/reservation" className="hos-btn hos-btn-solid mt-8">
              Book a table
            </Link>
          </section>
        );
      }
      return (
        <div>
          <TenantFlipbookWrapper
            menuUrl={menuUrl}
            tenantName={tenant.name}
            imagePages={menu?.pages}
          />
          <CTA />
        </div>
      );
    }

    case "gallery":
      return <GalleryPage />;

    case "contact":
      return <ContactForm currentTenant={tenant.domain} />;

    case "reservation":
      return <ReservationForm currentTenant={tenant.domain} />;

    case "lucky-wheel":
      return <LuckyWheel />;

    default:
      notFound();
  }
}
