import { fetchGallery, fetchTenantByDomain } from "@/lib/data";
import { Hero } from "@/components/tenant/Hero";
import { ShortAbout } from "@/components/tenant/ShortAbout";
import { GallerySection } from "@/components/tenant/GallerySection";
import { CTA } from "@/components/tenant/CTA";
import { notFound } from "next/navigation";

export default async function TenantHomePage({
  params,
}: PageProps<"/t/[tenant]">) {
  const { tenant: slug } = await params;
  const tenant = await fetchTenantByDomain(slug);
  if (!tenant) notFound();

  const gallery = await fetchGallery(tenant.id, 6);

  return (
    <div>
      <Hero tenant={tenant} />
      <ShortAbout tenant={tenant} />
      <GallerySection tenant={tenant} items={gallery} />
      <CTA tenant={tenant} />
    </div>
  );
}
