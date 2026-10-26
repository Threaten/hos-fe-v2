"use client";

import { useEffect, useState } from "react";
import {
  getBranchStatus,
  getOpeningState,
  type OpeningKind,
} from "@/app/utils/openingStatus";

const DOT_COLOR: Record<OpeningKind, string> = {
  open: "var(--status-open)",
  closed: "var(--status-closed)",
  "temporarily-closed": "var(--status-paused)",
  unknown: "transparent",
};

/** Current time, refreshed every minute; null until mounted (avoids SSR/client mismatch) */
function useNow(intervalMs = 60_000): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

interface OpeningStatusProps {
  branch: { status?: string; openingHours?: string };
  /** Also show "until 22:00" / "opens 15:00" */
  showDetail?: boolean;
  /** Also show the full hours, e.g. "15:00–22:00" */
  showHours?: boolean;
  /**
   * "live": open/closed right now ("Open now · until 22:00").
   * "status": "Open" / "Closed" / "We'll be back soon" with the hours
   * ("Closed · 15:00–22:00").
   */
  variant?: "live" | "status";
  className?: string;
}

export default function OpeningStatus({
  branch,
  showDetail = false,
  showHours = false,
  variant = "live",
  className = "",
}: OpeningStatusProps) {
  const now = useNow();
  if (!now) return null;

  if (variant === "status") {
    const status = getBranchStatus(branch, now);
    if (!status.label && !status.hours) return null;
    return (
      <span className={`inline-flex items-center flex-wrap gap-x-1.5 ${className}`}>
        {status.label && (
          <>
            <span
              aria-hidden="true"
              className="inline-block w-[7px] h-[7px] rounded-full shrink-0"
              style={{ backgroundColor: DOT_COLOR[status.kind] }}
            />
            <span>{status.label}</span>
          </>
        )}
        {status.hours && (
          <>
            {status.label && <span aria-hidden="true">·</span>}
            <span>{status.hours}</span>
          </>
        )}
      </span>
    );
  }

  const state = getOpeningState(branch, now);
  if (state.kind === "unknown" && !(showHours && state.hours)) return null;

  return (
    <span className={`inline-flex items-center flex-wrap gap-x-1.5 ${className}`}>
      {state.label && (
        <>
          <span
            aria-hidden="true"
            className="inline-block w-[7px] h-[7px] rounded-full shrink-0"
            style={{ backgroundColor: DOT_COLOR[state.kind] }}
          />
          <span>{state.label}</span>
        </>
      )}
      {showDetail && state.detail && (
        <>
          <span aria-hidden="true">·</span>
          <span>{state.detail}</span>
        </>
      )}
      {showHours && state.hours && (
        <>
          {state.label && <span aria-hidden="true">·</span>}
          <span>{state.hours}</span>
        </>
      )}
    </span>
  );
}
