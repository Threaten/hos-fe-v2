import type { Metadata } from "next";
import "../globals.css";
import Topbar from "./components/Topbar";
import Navbar from "./components/Navbar";
import SiteHeader from "./components/SiteHeader";
import Breadcrumbs from "./components/Breadcrumbs";
import Footer from "./components/Footer";
import PageTransition from "./components/PageTransition";
import { TenantProvider } from "../contexts/TenantContext";

export const metadata: Metadata = {
  title: { default: "House of Senses", template: "%s | House of Senses" },
  description: "House of Senses restaurants, menus, reservations, and branch information.",
};

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TenantProvider>
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
