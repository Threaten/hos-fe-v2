"use client";

import React from "react";
import Link from "next/link";
import { useTenant } from "@/app/contexts/TenantContext";
import { isReservationClosed } from "@/app/utils/openingStatus";
import { useT } from "@/app/i18n/useT";


interface ReservationLinkProps {
  className?: string;
  style?: React.CSSProperties;
  "aria-label"?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

/**
 * "Book a table" link that turns into a disabled control while the branch is
 * closed or temporarily closed in the CMS.
 */
export default function ReservationLink({ className = "", style, onClick, children, ...rest }: ReservationLinkProps) {
  const { tenant } = useTenant();
  const t = useT();

  if (isReservationClosed(tenant)) {
    return (
      <span
        role="link"
        aria-disabled="true"
        aria-label={t("Reservations are unavailable while this branch is closed")}
        title={t("Reservations are unavailable while this branch is closed")}
        className={`${className} hs-disabled`}
        style={style}
      >
        {children}
      </span>
    );
  }

  return (
    <Link href="/reservation" className={className} style={style} onClick={onClick} aria-label={rest["aria-label"]}>
      {children}
    </Link>
  );
}
