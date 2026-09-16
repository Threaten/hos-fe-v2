"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { TopbarNavigator } from "@/components/tenant/TopbarNavigator";
import { Navbar } from "@/components/tenant/Navbar";
import { Footer } from "@/components/tenant/Footer";
import { NewsModal } from "@/components/tenant/NewsModal";
import type { Tenant } from "@/types/payload";

interface TenantShellProps {
  tenant: Tenant;
  allBranches: Tenant[];
  style: CSSProperties;
  children: ReactNode;
}

export function TenantShell({
  tenant,
  allBranches,
  style,
  children,
}: TenantShellProps) {
  const hasNews = Boolean(tenant.newMenu && tenant.newMenu.length > 0);
  const [showNewsModal, setShowNewsModal] = useState(hasNews);

  return (
    <div
      className="tenant-scope flex min-h-screen flex-col paper-texture bg-background text-foreground"
      style={style}
    >
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      {/* Topbar Branch Navigator matching Image #1 */}
      <TopbarNavigator currentTenant={tenant} allBranches={allBranches} />

      {/* Navbar with brand, links, and Latest News trigger */}
      <Navbar
        tenant={tenant}
        hasNews={hasNews}
        onOpenNews={() => setShowNewsModal(true)}
      />

      <main id="main-content" className="flex-1">
        {children}
      </main>

      {/* Footer listing all branches with '← here' indicator */}
      <Footer tenant={tenant} allBranches={allBranches} />

      {/* News Modal box matching Image #2 */}
      {hasNews && (
        <NewsModal
          images={tenant.newMenu ?? []}
          isOpen={showNewsModal}
          onClose={() => setShowNewsModal(false)}
          tenantName={tenant.name}
        />
      )}
    </div>
  );
}
