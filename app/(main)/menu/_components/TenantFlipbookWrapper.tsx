"use client";

import dynamic from "next/dynamic";

const TenantFlipbook = dynamic(() => import("./TenantFlipbook"), {
  ssr: false,
  loading: () => (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center px-4">
      <p className="hs-note animate-pulse">Opening the menu…</p>
    </div>
  ),
});

interface TenantFlipbookWrapperProps {
  menuUrl: string;
  tenantName: string;
  imagePages?: Array<{
    url?: string;
    filename?: string;
    id?: string;
  }>;
}

export default function TenantFlipbookWrapper({
  menuUrl,
  tenantName,
  imagePages,
}: TenantFlipbookWrapperProps) {
  return <TenantFlipbook menuUrl={`${menuUrl}`} tenantName={tenantName} imagePages={imagePages} />;
}
