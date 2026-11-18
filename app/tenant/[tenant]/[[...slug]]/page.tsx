import { notFound } from "next/navigation";
import HomeSections from "../../../(main)/home/_components/HomeSections";
import CTA from "../../../(main)/components/CTA";
import TenantHomeInteractive from "./TenantHomeInteractive";
import AboutPage from "../../../(main)/about/page";
import GalleryPage from "../../../(main)/gallery/page";
import ContactForm from "../../../(main)/contact/_components/ContactForm";
import ReservationForm from "../../../(main)/reservation/_components/ReservationForm";
import TenantFlipbookWrapper from "../../../(main)/menu/_components/TenantFlipbookWrapper";
import LuckyWheel from "../../../(main)/lucky-wheel/_components/LuckyWheel";
import VoucherPage from "../../../(main)/voucher/VoucherPage";
import Link from "next/link";
import { resolveBackendMediaUrl } from "@/app/utils/media";
import { getMenuSource } from "@/api/queries";
import { fetchTenantServer } from "@/app/utils/tenantServer";

interface PageProps {
  params: Promise<{ tenant: string; slug?: string[] }>;
}

export default async function TenantPage({ params }: PageProps) {
  const { tenant: tenantSlug, slug = [] } = await params;
  const pathname = slug.join("/");

  const tenant = await fetchTenantServer(tenantSlug);
  if (!tenant) notFound();

  // /voucher/<code>: a voucher's QR code opens here
  if (slug[0] === "voucher") {
    if (slug.length !== 2) notFound();
    return <VoucherPage code={decodeURIComponent(slug[1])} tenantDomain={tenant.domain} tenantName={tenant.name} />;
  }

  switch (pathname) {
    case "":
    case "home": {
      const hasUpdates = (tenant.newMenu?.length ?? 0) > 0;
      return (
        <>
          {/* The updates modal opens over the page on load, so its image gets the bandwidth */}
          <HomeSections tenant={tenant} prioritizeImages={!hasUpdates} />
          <TenantHomeInteractive newMenu={tenant.newMenu ?? []} tenantName={tenant.name} />
        </>
      );
    }

    case "about":
      return <AboutPage />;

    case "menu": {
      const menu = getMenuSource(tenant);
      const menuUrl = resolveBackendMediaUrl(menu.file);

      if (!menuUrl) {
        return (
          <section className="hs-shell pt-14 md:pt-20">
            <div className="hs-main">
              <p className="hs-note mb-6">The menu</p>
              <h1 className="hs-hero max-w-[12ch]">still being written.</h1>
              <p className="hs-lead mt-8">
                {tenant.name} hasn&apos;t published its menu online yet. Call us
                {tenant.phone ? ` on ${tenant.phone}` : ""} and we&apos;ll walk you
                through what&apos;s cooking.
              </p>
              <Link href="/reservation" className="hs-btn hs-btn-solid mt-9">
                Book a table
              </Link>
            </div>
          </section>
        );
      }
      return (
        <div>
          <TenantFlipbookWrapper
            menuUrl={menuUrl}
            tenantName={tenant.name}
            imagePages={menu.pages}
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
