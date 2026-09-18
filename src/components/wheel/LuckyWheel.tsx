"use client";

import React, { useState, useRef, useEffect } from "react";
import type { Tenant } from "@/types/payload";
import { staffLoginAction, recordSpinAction } from "@/lib/actions";

// ─── Wheel Configuration ──────────────────────────────────────────────────────

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

const R = 145;
const CX = 160;
const CY = 160;
const VIEWBOX = 320;
const WHEEL_SIZE = "min(460px, calc(100vw - 48px))";
const SPIN_DURATION_MS = 4200;
const CREAM_COLOR = "#faf8f5";

// ─── SVG Helpers ──────────────────────────────────────────────────────────────

/** Convert polar (angle from 12 o'clock, clockwise) to SVG cartesian. */
function polarToXY(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
}

/** Split longer prize labels over two balanced lines. */
function splitPrizeLabel(label: string): string[] {
  const normalized = label.trim().replace(/\s+/g, " ");
  const words = normalized.split(" ");

  if (normalized.length <= 11 || words.length === 1) return [normalized];

  let bestSplit = 1;
  let smallestDifference = Number.POSITIVE_INFINITY;

  for (let i = 1; i < words.length; i += 1) {
    const firstLine = words.slice(0, i).join(" ");
    const secondLine = words.slice(i).join(" ");
    const difference = Math.abs(firstLine.length - secondLine.length);

    if (difference < smallestDifference) {
      bestSplit = i;
      smallestDifference = difference;
    }
  }

  return [
    words.slice(0, bestSplit).join(" "),
    words.slice(bestSplit).join(" "),
  ];
}

/** Build a pie-slice SVG path for segment `i`. */
function slicePath(i: number, angleDeg: number): string {
  const start = i * angleDeg;
  const end = (i + 1) * angleDeg;
  const s = polarToXY(start, R);
  const e = polarToXY(end, R);
  const largeArc = angleDeg > 180 ? 1 : 0;
  return `M ${CX} ${CY} L ${s.x} ${s.y} A ${R} ${R} 0 ${largeArc} 1 ${e.x} ${e.y} Z`;
}

function getSegmentColor(index: number, mainColor: string) {
  return index % 2 === 0
    ? { bg: mainColor, text: CREAM_COLOR }
    : { bg: CREAM_COLOR, text: mainColor };
}

// ─── Login Gate Component ─────────────────────────────────────────────────────

function LoginGate({
  tenant,
  onLogin,
}: {
  tenant: Tenant;
  onLogin: (token: string, name: string) => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const mainColor = tenant.mainColor || "var(--primary, #8a1f1f)";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please enter your staff username and password.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await staffLoginAction(username, password, tenant.domain);
      if (!res.success) {
        setError(res.error || "Invalid credentials.");
        return;
      }
      onLogin(res.token || "staff-token", res.name || "Staff");
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "transparent",
    border: "none",
    borderBottom: "1px solid color-mix(in srgb, currentColor 35%, transparent)",
    outline: "none",
    padding: "10px 0",
    fontSize: "15px",
    color: "inherit",
    letterSpacing: "0.03em",
  };

  return (
    <div
      className="flex flex-col items-center justify-center px-6 py-16"
      style={{ minHeight: "calc(100vh - 180px)" }}
    >
      <div className="w-full max-w-sm">
        <p
          className="text-xs tracking-[0.38em] uppercase mb-4 text-center font-medium opacity-80"
          style={{ color: mainColor }}
        >
          — staff authorization
        </p>
        <h1
          className="font-heading text-4xl sm:text-5xl font-semibold leading-tight tracking-tight text-center mb-10"
          style={{ color: mainColor }}
        >
          Lucky Wheel
        </h1>

        <form onSubmit={submit} noValidate className="space-y-6">
          <div>
            <label
              htmlFor="wheel-login-username"
              className="block text-xs font-medium tracking-[0.25em] uppercase mb-1.5 opacity-80"
              style={{ color: mainColor }}
            >
              Username / Email
            </label>
            <input
              id="wheel-login-username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
              placeholder="staff username or email"
            />
          </div>

          <div>
            <label
              htmlFor="wheel-login-password"
              className="block text-xs font-medium tracking-[0.25em] uppercase mb-1.5 opacity-80"
              style={{ color: mainColor }}
            >
              Password
            </label>
            <input
              id="wheel-login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p
              className="text-xs text-red-600 bg-red-500/10 px-3 py-2 rounded tracking-wide"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 text-xs tracking-[0.28em] uppercase font-semibold transition-all duration-200 mt-4 cursor-pointer"
            style={{
              backgroundColor: mainColor,
              color: CREAM_COLOR,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Authenticating…" : "Unlock Wheel"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Reward Modal Component ───────────────────────────────────────────────────

function RewardModal({
  result,
  mainColor,
  onClose,
}: {
  result: string;
  mainColor: string;
  onClose: () => void;
}) {
  const isNoReward = result.toLowerCase() === "try again";

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(15, 14, 11, 0.65)",
        backdropFilter: "blur(5px)",
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Your reward"
    >
      <div
        className="relative flex flex-col items-center justify-center text-center px-8 sm:px-12 py-12 sm:py-16 paper-texture bg-background text-foreground border border-foreground/10 shadow-2xl rounded-sm"
        style={{
          maxWidth: 480,
          width: "100%",
          animation: "wheelModalIn 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-2 text-2xl leading-none opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
          style={{ color: mainColor }}
        >
          ×
        </button>

        <p
          className="text-xs font-medium tracking-[0.38em] uppercase mb-5"
          style={{ color: mainColor }}
        >
          — your reward
        </p>

        {isNoReward ? (
          <p
            className="font-heading text-3xl sm:text-4xl font-semibold"
            style={{ color: mainColor }}
          >
            Better luck next time
          </p>
        ) : (
          <>
            <p
              className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight my-2"
              style={{ color: mainColor }}
            >
              {result}
            </p>

            <div
              className="w-16 my-6 h-px"
              style={{
                backgroundColor: `color-mix(in srgb, ${mainColor} 40%, transparent)`,
              }}
            />

            <p className="text-sm tracking-wide leading-relaxed text-foreground/85 max-w-xs">
              Show this screen to your server to redeem your reward.
            </p>
          </>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-8 px-8 py-2.5 text-xs font-semibold tracking-[0.25em] uppercase transition-opacity cursor-pointer"
          style={{
            backgroundColor: mainColor,
            color: CREAM_COLOR,
          }}
        >
          Done
        </button>
      </div>

      <style>{`
        @keyframes wheelModalIn {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ─── Main LuckyWheel Component ────────────────────────────────────────────────

export default function LuckyWheel({ tenant }: { tenant: Tenant }) {
  const mainColor = tenant.mainColor || "#8a1f1f";

  // Prizes config
  const configuredPrizes =
    tenant?.spinWheelPrizes
      ?.map((prize) => prize.label?.trim())
      .filter((label): label is string => Boolean(label)) ?? [];
  const prizeLabels =
    configuredPrizes.length >= 2 ? configuredPrizes : DEFAULT_PRIZES;
  const segments = prizeLabels.map((label) => ({
    label,
    lines: splitPrizeLabel(label),
  }));
  const numSegments = segments.length;
  const angleDeg = 360 / numSegments;

  // Authentication state
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

  const handleLock = () => {
    setToken(null);
    setUserName("");
    setResult(null);
  };

  const spin = () => {
    if (spinning || !tenant || !token) return;

    setSpinning(true);
    setResult(null);

    const selectedIndex = Math.floor(Math.random() * numSegments);

    const targetOffset = (360 - (selectedIndex + 0.5) * angleDeg + 360) % 360;
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
          await recordSpinAction({
            occurredAt: new Date().toISOString(),
            reward,
            branchId: tenant.id,
          });
        } catch {
          // Absorbed silently
        }
      }
    }, SPIN_DURATION_MS);
  };

  // Render Login Gate until staff authenticates
  if (!token) {
    return <LoginGate tenant={tenant} onLogin={handleLogin} />;
  }

  return (
    <>
      <div
        className="flex flex-col items-center justify-start px-6 py-12 sm:py-16"
        style={{ minHeight: "calc(100vh - 180px)" }}
      >
        {/* ── Header ── */}
        <div className="text-center mb-8 sm:mb-10 max-w-lg mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <p
              className="text-xs tracking-[0.38em] uppercase font-medium"
              style={{ color: mainColor }}
            >
              — try your luck
            </p>
            <span className="opacity-40">•</span>
            <button
              onClick={handleLock}
              className="text-[11px] uppercase tracking-[0.2em] underline opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
              title="Lock wheel for staff login"
            >
              Lock
            </button>
          </div>

          <h1
            className="font-heading font-semibold leading-[0.95] tracking-tight text-center"
            style={{
              fontSize: "clamp(2.4rem, 7vw, 4.5rem)",
              color: mainColor,
            }}
          >
            Lucky Wheel
          </h1>

          {userName && (
            <p className="mt-3 text-xs tracking-widest uppercase opacity-75">
              Staff: {userName}
            </p>
          )}

          <p className="mt-3 text-sm sm:text-base leading-relaxed text-foreground/80">
            One spin per visit. Show your reward to the team to redeem it.
          </p>
        </div>

        {/* ── Wheel Container ── */}
        <div
          className="relative select-none my-4"
          style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}
        >
          {/* Top Indicator / Pointer */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute z-20 left-1/2 -translate-x-1/2 filter drop-shadow-md"
            style={{
              top: -14,
              width: 0,
              height: 0,
              borderLeft: "12px solid transparent",
              borderRight: "12px solid transparent",
              borderTop: `24px solid ${mainColor}`,
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
              filter: "drop-shadow(0 8px 24px rgba(0, 0, 0, 0.14))",
            }}
            aria-label="Lucky wheel"
            role="img"
          >
            {/* Outer border ring */}
            <circle
              cx={CX}
              cy={CY}
              r={R + 2}
              fill="none"
              stroke={mainColor}
              strokeWidth={4}
            />

            {/* Slices & Text */}
            {segments.map((seg, i) => {
              const midAngle = (i + 0.5) * angleDeg;
              const textPos = polarToXY(midAngle, R * 0.63);
              const color = getSegmentColor(i, mainColor);
              const isMultiLine = seg.lines.length > 1;

              return (
                <g key={i}>
                  <path
                    d={slicePath(i, angleDeg)}
                    fill={color.bg}
                    stroke={CREAM_COLOR}
                    strokeWidth={1.5}
                  />
                  <g transform={`translate(${textPos.x},${textPos.y})`}>
                    <g
                      style={{
                        transform: `rotate(${-rotation}deg)`,
                        transformOrigin: "0 0",
                        transition: spinning
                          ? `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)`
                          : "none",
                      }}
                    >
                      <text
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{
                          fontSize: numSegments > 8 ? "9px" : "11px",
                          fontFamily: "var(--font-sans), sans-serif",
                          fontWeight: 600,
                          fill: color.text,
                          letterSpacing: "0.04em",
                          pointerEvents: "none",
                          userSelect: "none",
                        }}
                      >
                        {seg.lines.map((line, j) => (
                          <tspan
                            key={j}
                            x="0"
                            dy={j === 0 ? (isMultiLine ? "-6" : "0") : "13"}
                          >
                            {line}
                          </tspan>
                        ))}
                      </text>
                    </g>
                  </g>
                </g>
              );
            })}

            {/* Segment dividing spokes */}
            {segments.map((_, i) => {
              const spoke = polarToXY(i * angleDeg, R);
              return (
                <line
                  key={`spoke-${i}`}
                  x1={CX}
                  y1={CY}
                  x2={spoke.x}
                  y2={spoke.y}
                  stroke={CREAM_COLOR}
                  strokeWidth={1.5}
                />
              );
            })}

            {/* Central hub */}
            <circle cx={CX} cy={CY} r={22} fill={mainColor} />
            <circle cx={CX} cy={CY} r={16} fill={CREAM_COLOR} />
            <circle cx={CX} cy={CY} r={5} fill={mainColor} />
          </svg>
        </div>

        {/* ── Spin Button ── */}
        <button
          onClick={spin}
          disabled={spinning}
          className="mt-8 px-14 py-3.5 text-xs font-semibold tracking-[0.28em] uppercase transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
          style={{
            backgroundColor: mainColor,
            color: CREAM_COLOR,
            cursor: spinning ? "not-allowed" : "pointer",
            opacity: spinning ? 0.65 : 1,
          }}
          aria-label={spinning ? "Spinning the wheel…" : "Spin the lucky wheel"}
        >
          {spinning ? "Spinning…" : "Spin Wheel"}
        </button>
      </div>

      {/* ── Reward Modal ── */}
      {result && (
        <RewardModal
          result={result}
          mainColor={mainColor}
          onClose={() => setResult(null)}
        />
      )}
    </>
  );
}
