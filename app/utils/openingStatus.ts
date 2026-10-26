/**
 * Opening status for a branch, from the CMS `status` and `openingHours` fields.
 * Times are evaluated in Vietnam time, where the restaurants are, so a visitor
 * abroad (or with a wrong device clock) still sees the right answer.
 */

export const RESTAURANT_TIME_ZONE = "Asia/Ho_Chi_Minh";

export type OpeningKind = "open" | "closed" | "temporarily-closed" | "unknown";

export interface OpeningState {
  kind: OpeningKind;
  /** Short status, e.g. "Open now", "Closed", "Temporarily closed" */
  label: string;
  /** Supporting detail, e.g. "until 22:00", "opens 15:00" */
  detail?: string;
  /** Normalised hours for display, e.g. "15:00–22:00" */
  hours?: string;
}

interface ParsedHours {
  open: number; // minutes since midnight
  close: number; // minutes since midnight, may exceed 1440 when past midnight
}

/** GraphQL returns "temporarily_closed", REST "temporarily-closed" */
function normalizeStatus(status?: string): string {
  return (status ?? "").trim().toLowerCase().replace(/[\s_]+/g, "-");
}

function toMinutes(hhmm: string): number | null {
  const m = hhmm.trim().match(/^(\d{1,2})(?:[:.h](\d{2})?)?$/i);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2] ?? 0);
  if (h > 24 || min > 59) return null;
  return h * 60 + min;
}

function formatMinutes(total: number): string {
  const t = ((total % 1440) + 1440) % 1440;
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

/** Accepts "15:00–22:00", "15:00 - 22:00", "15h-22h", "18:00 to 02:00" */
export function parseOpeningHours(value?: string): ParsedHours | null {
  if (!value) return null;
  const parts = value.split(/\s*(?:–|—|-|to)\s*/i);
  if (parts.length !== 2) return null;
  const open = toMinutes(parts[0]);
  let close = toMinutes(parts[1]);
  if (open === null || close === null) return null;
  if (close <= open) close += 1440; // closes after midnight
  return { open, close };
}

/** Minutes since midnight right now in the restaurants' time zone */
function restaurantMinutesNow(now: Date): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: RESTAURANT_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return h * 60 + m;
}

export interface BranchStatus {
  /** The status set in the CMS, regardless of the time of day */
  kind: Exclude<OpeningKind, "unknown"> | "unknown";
  label: string;
  hours?: string;
  /** Status is "open" but the current time falls outside the opening hours */
  outsideHours: boolean;
}

/**
 * The branch's CMS status ("Open", "Temporarily closed") plus its hours, flagging
 * when an open branch is currently outside those hours.
 */
export function getBranchStatus(
  branch: { status?: string; openingHours?: string },
  now: Date = new Date(),
): BranchStatus {
  const state = getOpeningState(branch, now);
  const status = normalizeStatus(branch.status);

  if (status && status !== "open") {
    return { kind: state.kind, label: state.label, hours: state.hours, outsideHours: false };
  }
  if (!status && state.kind === "unknown") {
    return { kind: "unknown", label: "", hours: state.hours, outsideHours: false };
  }
  return { kind: "open", label: "Open", hours: state.hours, outsideHours: state.kind === "closed" };
}

export function getOpeningState(
  branch: { status?: string; openingHours?: string },
  now: Date = new Date(),
): OpeningState {
  const parsed = parseOpeningHours(branch.openingHours);
  const hours = parsed
    ? `${formatMinutes(parsed.open)}–${formatMinutes(parsed.close)}`
    : branch.openingHours?.trim() || undefined;
  const status = normalizeStatus(branch.status);

  // Anything other than "open" set in the CMS overrides the hours
  if (status && status !== "open") {
    const label = status.replace(/-/g, " ");
    return {
      kind: status === "temporarily-closed" ? "temporarily-closed" : "closed",
      label: label.charAt(0).toUpperCase() + label.slice(1),
      hours,
    };
  }

  if (!parsed) {
    return status === "open"
      ? { kind: "open", label: "Open", hours }
      : { kind: "unknown", label: "", hours };
  }

  const nowMin = restaurantMinutesNow(now);
  // Also consider "yesterday's" window for hours that run past midnight
  const isOpen =
    (nowMin >= parsed.open && nowMin < parsed.close) ||
    (parsed.close > 1440 && nowMin + 1440 < parsed.close);

  return isOpen
    ? { kind: "open", label: "Open now", detail: `until ${formatMinutes(parsed.close)}`, hours }
    : { kind: "closed", label: "Closed", detail: `opens ${formatMinutes(parsed.open)}`, hours };
}
