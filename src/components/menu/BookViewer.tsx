"use client";

import dynamic from "next/dynamic";

const FlipBookMenu = dynamic(
  () => import("@/components/menu/FlipBookMenu").then((m) => m.FlipBookMenu),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[85vh] w-full items-center justify-center bg-[#1b1712] text-white/50">
        Preparing your menu…
      </div>
    ),
  },
);

export function BookViewer({
  menuUrl,
  tenantName,
}: {
  menuUrl: string;
  tenantName: string;
}) {
  return <FlipBookMenu menuUrl={menuUrl} tenantName={tenantName} />;
}
