"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTenant } from "@/app/contexts/TenantContext";
import { createSpinHistory, API_URL } from "@/api/queries";

// ─── Wheel Configuration ──────────────────────────────────────────────────────

/** Used when the branch has not set its own prizes in the CMS */
const DEFAULT_PRIZES = [
  "Free Dessert",
  "10% Off",
  "Free Cocktail",
  "5% Off",
  "Free Starter",
  "3% Off",
  "Free Drink",
  "Chef's Surprise",
];

/** Labels that mean "no reward" rather than a prize */
const isNoReward = (label: string) => /^try again$/i.test(label.trim());

/** Split a prize label into at most two short lines for its slice */
function toLines(label: string): string[] {
  const words = label.trim().split(/\s+/);
  if (words.length < 2 || label.length <= 8) return [label.trim()];
  // Break where the two lines come out most even
  let best = 1;
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const diff = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

/**
 * Slices alternate the branch colour and paper. With an odd count the last
 * slice would touch the first in the same colour, so it gets a third tone.
 */
function sliceColor(i: number, count: number) {
  if (count % 2 === 1 && i === count - 1) return { bg: "var(--paper)", text: "var(--ink)" };
  return i % 2 === 0
    ? { bg: "var(--pen)", text: "var(--paper)" }
    : { bg: "var(--paper-2)", text: "var(--pen)" };
}

const R = 145;
const CX = 160;
const CY = 160;
const VIEWBOX = 320;
/** On-screen size of the wheel; the SVG scales its 320-unit viewBox to fit */
const WHEEL_SIZE = "min(460px, calc(100vw - 48px))";
const SPIN_DURATION_MS = 4200;

// ─── SVG Helpers ──────────────────────────────────────────────────────────────

/** Convert polar (angle from 12 o'clock, clockwise) to SVG cartesian. */
function polarToXY(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
}

/** Build a pie-slice SVG path for segment `i` of slices `angle` degrees wide. */
function slicePath(i: number, angle: number): string {
  const start = i * angle;
  const end = (i + 1) * angle;
  const s = polarToXY(start, R);
  const e = polarToXY(end, R);
  return `M ${CX} ${CY} L ${s.x} ${s.y} A ${R} ${R} 0 0 1 ${e.x} ${e.y} Z`;
}

/**
 * Radial text rotation: flip text in the bottom half so it stays legible.
 * Without this, bottom-half labels appear upside-down.
 */
function textRotation(midAngle: number) {
  return midAngle > 90 && midAngle < 270 ? midAngle + 180 : midAngle;
}

// ─── Login Form ───────────────────────────────────────────────────────────────

function LoginGate({
  tenantDomain,
  onLogin,
}: {
  tenantDomain: string;
  onLogin: (token: string, name: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/users/external-users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email,
          password,
          tenantDomain,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.errors?.[0]?.message ?? json?.message ?? "Invalid credentials.");
        return;
      }
      const displayName: string =
        json?.user?.name ||
        json?.user?.username ||
        json?.user?.email ||
        "Guest";
      onLogin(json.token as string, displayName);
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center hos-gutter py-16" style={{ minHeight: "70vh" }}>
      <div className="w-full max-w-md text-center animate-rise">
        <p className="hs-note mb-3">members only</p>
        <h1 className="hs-hero text-[clamp(3rem,8vw,6.5rem)] mb-10">lucky wheel</h1>

        <form
          onSubmit={submit}
          noValidate
          className="text-left flex flex-col gap-7 border-t pt-8"
          style={{ borderColor: "var(--line)" }}
        >
          <div className="hs-field">
            <label htmlFor="wheel-email" className="hs-label">Email</label>
            <input
              id="wheel-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="hs-input"
              placeholder="you@email.com"
            />
          </div>

          <div className="hs-field">
            <label htmlFor="wheel-password" className="hs-label">Password</label>
            <input
              id="wheel-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="hs-input"
            />
          </div>

          {error && <p className="hs-error" role="alert">{error}</p>}

          <button type="submit" disabled={loading} className="hs-btn hs-btn-solid w-full">
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Reward Modal ─────────────────────────────────────────────────────────────

function RewardModal({
  result,
  onClose,
}: {
  result: string;
  onClose: () => void;
}) {
  const noReward = isNoReward(result);
  const [leftOffset, setLeftOffset] = useState(0);

  // Read the actual sidebar/main padding at runtime so fixed overlay centers
  // correctly regardless of which layout (tenant sidebar vs. plain) wraps the page.
  useEffect(() => {
    const main = document.querySelector("main");
    if (main) {
      setLeftOffset(parseFloat(getComputedStyle(main).paddingLeft) || 0);
    }
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center"
      style={{
        top: "var(--site-header-h, 0px)",
        backgroundColor: "color-mix(in oklab, var(--ink) 60%, transparent)",
        paddingLeft: leftOffset,
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Your reward"
    >
      <div
        className="hs-paper hs-fade-in relative flex flex-col items-center justify-center text-center px-10 py-14"
        style={{ ["--reveal-delay" as string]: "0s", borderRadius: 3, maxWidth: 480, width: "calc(100% - 48px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center transition-transform duration-300 hover:rotate-90"
          style={{ color: "var(--ink-soft)" }}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M4 4.5c5 5 10 10.4 16 15" />
            <path d="M19.5 4c-5 5.4-10 10.6-15.5 16" />
          </svg>
        </button>

        <p className="hs-note mb-4">{noReward ? "oh no" : "you won"}</p>

        {noReward ? (
          <p className="hs-display" style={{ color: "var(--ink)" }}>Better luck next time</p>
        ) : (
          <>
            <p className="hs-hero text-[clamp(2.6rem,9vw,4rem)]">{result}</p>
            <p className="hs-lead mt-6 text-center">Show this screen to your server to redeem it.</p>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Wheel Component ─────────────────────────────────────────────────────

export default function LuckyWheel() {
  const { tenant } = useTenant();

  const prizes = (tenant?.spinWheelPrizes ?? []).map((p) => p.label?.trim()).filter(Boolean) as string[];
  const segments = (prizes.length >= 2 ? prizes : DEFAULT_PRIZES).map((label) => ({ label, lines: toLines(label) }));
  const count = segments.length;
  const angle = 360 / count;
  // Narrower slices need smaller type to keep labels inside them
  const fontSize = count <= 8 ? 11 : count <= 10 ? 10 : 9;

  // Auth state
  const [token, setToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");

  // Wheel state
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const rotationRef = useRef(0);

  const handleLogin = (t: string, name: string) => {
    setToken(t);
    setUserName(name);
  };

  const spin = () => {
    if (spinning || !tenant || !token) return;

    setSpinning(true);
    setResult(null);

    const selectedIndex = Math.floor(Math.random() * count);

    const targetOffset =
      (360 - (selectedIndex + 0.5) * angle + 360) % 360;
    const currentMod = rotationRef.current % 360;
    const delta = (targetOffset - currentMod + 360) % 360;
    const newRotation = rotationRef.current + 5 * 360 + delta;

    rotationRef.current = newRotation;
    setRotation(newRotation);

    setTimeout(async () => {
      const reward = segments[selectedIndex].label;
      setResult(reward);
      setSpinning(false);

      if (tenant?.id) {
        try {
          await createSpinHistory(new Date().toISOString(), reward, tenant.id);
        } catch {
          // Silently absorb
        }
      }
    }, SPIN_DURATION_MS);
  };

  // Show login gate until authenticated
  if (!token) {
    return (
      <LoginGate
        tenantDomain={tenant?.domain ?? ""}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <>
      <div className="flex flex-col items-center justify-start hos-gutter pt-12 md:pt-16">
        <div className="text-center mb-12 animate-rise">
          <p className="hs-note mb-3">{userName ? `good luck, ${userName}` : "try your luck"}</p>
          <h1 className="hs-hero text-[clamp(3rem,8vw,6.5rem)]">lucky wheel</h1>
          <p className="hs-lead mt-5 mx-auto text-center">
            One spin per visit. Show your reward to the team to redeem it.
          </p>
        </div>

        {/* ── Wheel ── */}
        <div className="relative select-none" style={{ width: WHEEL_SIZE, aspectRatio: "1 / 1" }}>
          {/* Pointer */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: -14,
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "11px solid transparent",
              borderRight: "11px solid transparent",
              borderTop: "24px solid var(--ink)",
              zIndex: 10,
            }}
          />

          {/* SVG Wheel */}
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning
                ? `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)`
                : "none",
              filter: "drop-shadow(0 14px 22px oklch(25% 0.03 60 / 0.22))",
            }}
            aria-label="Lucky wheel"
            role="img"
          >
            <circle cx={CX} cy={CY} r={R + 2} fill="none" style={{ stroke: "var(--ink)" }} strokeWidth={3.5} />

            {segments.map((seg, i) => {
              const midAngle = (i + 0.5) * angle;
              const textPos = polarToXY(midAngle, R * (count > 8 ? 0.68 : 0.63));
              const rot = textRotation(midAngle);
              const color = sliceColor(i, count);
              const isMultiLine = seg.lines.length > 1;
              return (
                <g key={i}>
                  <path d={slicePath(i, angle)} style={{ fill: color.bg, stroke: "var(--ink)" }} strokeWidth={1.4} />
                  <text
                    transform={`translate(${textPos.x},${textPos.y}) rotate(${rot})`}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                      fontSize: `${fontSize}px`,
                      fontFamily: "var(--font-body)",
                      fontWeight: 600,
                      fill: color.text,
                      pointerEvents: "none",
                      userSelect: "none",
                    }}
                  >
                    {seg.lines.map((line, j) => (
                      <tspan key={j} x="0" dy={j === 0 ? (isMultiLine ? `${-fontSize * 0.62}` : "0") : `${fontSize * 1.25}`}>
                        {line}
                      </tspan>
                    ))}
                  </text>
                </g>
              );
            })}

            {segments.map((_, i) => {
              const spoke = polarToXY(i * angle, R);
              return (
                <line
                  key={`spoke-${i}`}
                  x1={CX} y1={CY} x2={spoke.x} y2={spoke.y}
                  style={{ stroke: "var(--ink)" }} strokeWidth={1.4}
                />
              );
            })}

            <circle cx={CX} cy={CY} r={20} style={{ fill: "var(--ink)" }} />
            <circle cx={CX} cy={CY} r={15} style={{ fill: "var(--paper)" }} />
            <circle cx={CX} cy={CY} r={4} style={{ fill: "var(--pen)" }} />
          </svg>
        </div>

        {/* ── Spin Button ── */}
        <button
          onClick={spin}
          disabled={spinning}
          className="hs-btn hs-btn-solid mt-12 min-w-[200px]"
          aria-label={spinning ? "Spinning…" : "Spin the wheel"}
        >
          {spinning ? "spinning…" : "Spin!"}
        </button>
      </div>

      {/* ── Result Modal ── */}
      {result && (
        <RewardModal result={result} onClose={() => setResult(null)} />
      )}
    </>
  );
}
