import type { Metadata } from "next";
import "../../globals.css";
import Topbar from "../../(main)/components/Topbar";
import Navbar from "../../(main)/components/Navbar";
import SiteHeader from "../../(main)/components/SiteHeader";
import Breadcrumbs from "../../(main)/components/Breadcrumbs";
import Footer from "../../(main)/components/Footer";
import PageTransition from "../../(main)/components/PageTransition";
import { TenantProvider } from "../../contexts/TenantContext";
import { fetchTenantServer } from "@/app/utils/tenantServer";

// Page-level metadata is generated dynamically by [[...slug]]/layout.tsx.
// This fallback applies only if no child segment provides metadata.
export const metadata: Metadata = {
  title: "House of Senses",
  description:
    "House of Senses branch pages with menus, reservations, contact details, and locations across Vietnam.",
};

export default async function TenantLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}>) {
  const { tenant: slug } = await params;
  // Resolve the branch on the server so the header, footer and page copy are
  // in the initial HTML that crawlers read, not filled in after hydration
  const tenant = await fetchTenantServer(slug);

  return (
    <TenantProvider initialTenant={tenant}>
      <SiteHeader>
        <Topbar />
        <Navbar />
      </SiteHeader>
      <Breadcrumbs />
      <PageTransition>{children}</PageTransition>
      <Footer />
    </TenantProvider>
  );
}
