"use client";

import { useTenant } from "@/app/contexts/TenantContext";

/** Announcement strip in the branch colour, when the CMS has one switched on */
export default function Topbar() {
  const { tenant } = useTenant();
  const notification = tenant?.topbarNotification;
  if (!notification?.enabled || !notification?.message) return null;

  return (
    <p
      className="hs-ui w-full py-2.5 hos-gutter text-center"
      style={{ backgroundColor: "var(--pen)", color: "var(--on-pen)" }}
    >
      {notification.message}
    </p>
  );
}
