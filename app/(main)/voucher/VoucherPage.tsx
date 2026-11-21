"use client";

import React, { useCallback, useEffect, useState } from "react";
import { API_URL } from "@/app/utils/constants";
import {
  clearStaffSession,
  readStaffSession,
  renewStaffSession,
  saveStaffSession,
  sessionFromLogin,
  type StaffSession,
} from "@/app/utils/staffSession";

/** What the CMS returns for a voucher a staff member is allowed to see */
interface Voucher {
  code: string;
  title: string;
  state: "active" | "used" | "void";
  branch: { name: string; domain: string } | null;
  usedBy: string | null;
  usedAt: string | null;
  /** Only present once the voucher has been used */
  details: string | null;
}

const when = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Ho_Chi_Minh",
      }).format(new Date(iso))
    : "";

const STATE_LABEL: Record<Voucher["state"], string> = {
  active: "Ready to use",
  used: "Used",
  void: "Cancelled",
};

export default function VoucherPage({
  code,
  tenantDomain,
  tenantName,
}: {
  code: string;
  tenantDomain: string;
  tenantName: string;
}) {
  const [session, setSession] = useState<StaffSession | null>(null);
  const [ready, setReady] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [justUsed, setJustUsed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const stored = readStaffSession(tenantDomain);
    (stored ? renewStaffSession(tenantDomain, stored) : Promise.resolve(null)).then((s) => {
      if (cancelled) return;
      setSession(s);
      if (stored && !s) {
        setShowLogin(true);
        setError("Your sign-in has ended. Please sign in again.");
      }
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [tenantDomain]);

  const signOut = useCallback(
    (message?: string) => {
      clearStaffSession(tenantDomain);
      setSession(null);
      setVoucher(null);
      setConfirming(false);
      setShowLogin(Boolean(message));
      setError(message ?? null);
    },
    [tenantDomain],
  );

  /** Call a voucher endpoint as the signed-in staff member */
  const call = useCallback(
    async (path: string, method: "GET" | "POST") => {
      if (!session) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/api/vouchers/${path}/${encodeURIComponent(code)}`, {
          method,
          headers: { Authorization: `JWT ${session.token}` },
          cache: "no-store",
        });
        const body = await res.json().catch(() => ({}));
        if (res.status === 401) return signOut("Your sign-in has ended. Please sign in again.");
        if (!res.ok) {
          setError(body.error || "Something went wrong. Please try again.");
          if (body.voucher) setVoucher(body.voucher);
          return;
        }
        setVoucher(body as Voucher);
        return body as Voucher;
      } catch {
        setError("Could not reach the server. Check the connection and try again.");
      } finally {
        setLoading(false);
      }
    },
    [code, session, signOut],
  );

  useEffect(() => {
    if (session) void call("scan", "GET");
  }, [session, call]);

  const redeemVoucher = async () => {
    const used = await call("redeem", "POST");
    setConfirming(false);
    if (used) setJustUsed(true);
  };

  if (!ready) return <Shell />;

  // ─── Signed in: the voucher as staff see it ───────────────────────────
  if (session) {
    return (
      <Shell>
        <p className="hs-note mb-6" style={{ color: "var(--ink-soft)" }}>
          Signed in as {session.name} ·{" "}
          <button type="button" className="hs-link" onClick={() => signOut()}>
            sign out
          </button>
        </p>

        {loading && !voucher && <p className="hs-note animate-pulse">Checking the voucher…</p>}

        {voucher && (
          <article aria-live="polite">
            <p className="hs-label mb-4">
              <span
                className="inline-block px-2 py-1 border"
                style={{
                  borderColor: voucher.state === "active" ? "var(--pen)" : "var(--line)",
                  color: voucher.state === "active" ? "var(--pen)" : "var(--ink-soft)",
                }}
              >
                {justUsed ? "Used just now" : STATE_LABEL[voucher.state]}
              </span>
            </p>
            <h1 className="hs-hero text-[clamp(2.8rem,8vw,6.5rem)] max-w-[14ch]">{voucher.title}</h1>

            {voucher.details && (
              <div className="mt-8 p-6 md:p-8 max-w-[52ch]" style={{ background: "var(--paper-2)" }}>
                <p className="hs-label mb-3">Details</p>
                <p className="hs-lead whitespace-pre-line" style={{ color: "var(--ink)" }}>
                  {voucher.details}
                </p>
              </div>
            )}

            {voucher.usedAt && (
              <dl className="mt-10 grid grid-cols-[auto_1fr] gap-x-8 gap-y-3 max-w-[52ch] text-[1.0625rem]">
                <dt className="hs-label pt-1">Used</dt>
                <dd>
                  {when(voucher.usedAt)}
                  {voucher.usedBy ? ` by ${voucher.usedBy}` : ""}
                </dd>
              </dl>
            )}

            {voucher.state === "active" && (
              <div className="mt-10">
                {!confirming ? (
                  <button type="button" className="hs-btn hs-btn-solid" onClick={() => setConfirming(true)} disabled={loading}>
                    Use voucher
                  </button>
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="w-full hs-lead mb-1" style={{ color: "var(--ink)" }}>
                      Use it now? It can&apos;t be used again afterwards.
                    </p>
                    <button type="button" className="hs-btn hs-btn-solid" onClick={redeemVoucher} disabled={loading}>
                      {loading ? "Using…" : "Yes, use it"}
                    </button>
                    <button type="button" className="hs-btn" onClick={() => setConfirming(false)} disabled={loading}>
                      Not yet
                    </button>
                  </div>
                )}
              </div>
            )}
          </article>
        )}

        {error && (
          <p className="hs-error mt-8" role="alert">
            {error}
          </p>
        )}
      </Shell>
    );
  }

  // ─── Not signed in: what the guest sees, with a way in for staff ──────
  return (
    <Shell>
      {!showLogin ? (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)] gap-10 items-start">
          <div>
            <h1 className="hs-hero text-[clamp(2.8rem,8vw,6.5rem)] max-w-[12ch]">your voucher</h1>
            <p className="hs-lead mt-6 max-w-[36ch]">
              Show this code to the {tenantName.toLowerCase()} team when you visit. They will scan it to use your
              voucher.
            </p>
            <button type="button" className="hs-btn hs-btn-sm mt-8" onClick={() => setShowLogin(true)}>
              Staff sign in
            </button>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${API_URL}/api/vouchers/qr/${encodeURIComponent(code)}`}
            alt="Voucher QR code"
            width={320}
            height={320}
            className="w-full max-w-[320px] h-auto mx-auto lg:mx-0"
            style={{ background: "#fff" }}
          />
        </div>
      ) : (
        <StaffLogin
          tenantDomain={tenantDomain}
          message={error}
          onCancel={() => {
            setShowLogin(false);
            setError(null);
          }}
          onSignedIn={(s) => {
            saveStaffSession(tenantDomain, s);
            setError(null);
            setSession(s);
          }}
        />
      )}
    </Shell>
  );
}

function Shell({ children }: { children?: React.ReactNode }) {
  return (
    <section className="hs-shell pt-8 md:pt-12 pb-14" aria-label="Voucher">
      {/* Personal links must not be indexed */}
      <meta name="robots" content="noindex, nofollow" />
      <p className="hs-label mb-6 lg:mb-0">
        <span className="hs-rail-sticky block">Voucher</span>
      </p>
      <div className="hs-main">{children}</div>
    </section>
  );
}

/** Staff sign-in for this branch (same accounts as the admin) */
function StaffLogin({
  tenantDomain,
  message,
  onSignedIn,
  onCancel,
}: {
  tenantDomain: string;
  message: string | null;
  onSignedIn: (session: StaffSession) => void;
  onCancel: () => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/users/external-users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, tenantDomain }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.token) {
        setError(json?.errors?.[0]?.message ?? json?.message ?? "Those details didn't work. Please try again.");
        return;
      }
      onSignedIn(sessionFromLogin(json, username));
    } catch {
      setError("Could not reach the server. Check the connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-md">
      <h1 className="hs-display mb-3">staff sign in</h1>
      <p className="hs-lead mb-8">Use your House of Senses staff account for this branch.</p>
      {message && (
        <p className="hs-error mb-6" role="alert">
          {message}
        </p>
      )}
      <label className="hs-label block mb-2" htmlFor="staff-user">
        Email or username
      </label>
      <input
        id="staff-user"
        className="hs-input w-full mb-5"
        autoComplete="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <label className="hs-label block mb-2" htmlFor="staff-pass">
        Password
      </label>
      <input
        id="staff-pass"
        type="password"
        className="hs-input w-full mb-6"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && (
        <p className="hs-error mb-5" role="alert">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <button type="submit" className="hs-btn hs-btn-solid" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <button type="button" className="hs-btn" onClick={onCancel}>
          Back
        </button>
      </div>
    </form>
  );
}
