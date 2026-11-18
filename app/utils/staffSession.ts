import { API_URL } from "@/app/utils/constants";

/**
 * A staff sign-in on a branch website (voucher page, lucky wheel), kept on
 * this device. The server decides how long it lasts: a week from last use,
 * a month at most, and it ends at once if the account is disabled or its
 * password changes. This file only stores it and renews it once a day.
 */
export interface StaffSession {
  token: string;
  name: string;
  /** ms since epoch */
  expiresAt: number;
}

/** Must match SESSION_IDLE_SECONDS on the server */
const IDLE_MS = 7 * 24 * 60 * 60 * 1000;
const RENEW_AFTER_MS = 24 * 60 * 60 * 1000;

const key = (domain: string) => `hos-staff:${domain}`;

export function readStaffSession(domain: string): StaffSession | null {
  try {
    const s = JSON.parse(localStorage.getItem(key(domain)) || "null") as StaffSession | null;
    return s?.token && s.expiresAt > Date.now() ? s : null;
  } catch {
    return null;
  }
}

export function saveStaffSession(domain: string, session: StaffSession) {
  localStorage.setItem(key(domain), JSON.stringify(session));
}

export function clearStaffSession(domain: string) {
  localStorage.removeItem(key(domain));
}

/** Build a session from the login endpoint's response */
export function sessionFromLogin(json: { token: string; exp?: number; user?: { username?: string; email?: string } }, fallbackName: string): StaffSession {
  return {
    token: json.token,
    name: json.user?.username || json.user?.email || fallbackName,
    expiresAt: json.exp ? json.exp * 1000 : Date.now() + IDLE_MS,
  };
}

/**
 * Renew the sign-in if it was issued more than a day ago. Returns the session
 * to use, or null if the server has ended it (expired, a month old, account
 * disabled, password changed), in which case it is also forgotten here.
 */
export async function renewStaffSession(domain: string, session: StaffSession): Promise<StaffSession | null> {
  if (session.expiresAt - Date.now() > IDLE_MS - RENEW_AFTER_MS) return session;
  try {
    const res = await fetch(`${API_URL}/api/users/refresh-token`, {
      method: "POST",
      headers: { Authorization: `JWT ${session.token}` },
      cache: "no-store",
    });
    if (res.status === 401 || res.status === 403) {
      clearStaffSession(domain);
      return null;
    }
    if (!res.ok) return session;
    const json = await res.json();
    if (!json.refreshedToken) return session;
    const renewed = { ...session, token: json.refreshedToken, expiresAt: json.exp * 1000 };
    saveStaffSession(domain, renewed);
    return renewed;
  } catch {
    return session; // offline: keep using it; the server still has the final say
  }
}
