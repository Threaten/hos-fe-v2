"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTenant } from "@/app/contexts/TenantContext";
import { createSpinHistory, API_URL } from "@/api/queries";

// ─── Wheel Configuration ──────────────────────────────────────────────────────

const SEGMENTS = [
  { lines: ["Free", "Dessert"] },
  { lines: ["10% Off"] },
  { lines: ["Free", "Cocktail"] },
  { lines: ["5%", "Off"] },
  { lines: ["Free", "Starter"] },
  { lines: ["3%", "Off"] },
  { lines: ["Free", "Drink"] },
  { lines: ["Chef's", "Surprise"] },
];

// Alternating warm-earth tones from brand palette
const COLORS = [
  { bg: "#6b5e38", text: "#f2ede4" }, // deep earth → cream text
  { bg: "#c8b98a", text: "#3d3018" }, // light gold → dark text
  { bg: "#8a7a50", text: "#f2ede4" }, // medium earth → cream text
  { bg: "#ddd0b3", text: "#3d3018" }, // parchment → dark text
  { bg: "#6b5e38", text: "#f2ede4" },
  { bg: "#c8b98a", text: "#3d3018" },
  { bg: "#8a7a50", text: "#f2ede4" },
  { bg: "#ddd0b3", text: "#3d3018" },
];

const NUM = SEGMENTS.length;
const ANGLE_DEG = 360 / NUM; // 45° each
const R = 145;
const CX = 160;
const CY = 160;
const VIEWBOX = 320;
const SPIN_DURATION_MS = 4200;

// ─── SVG Helpers ──────────────────────────────────────────────────────────────

/** Convert polar (angle from 12 o'clock, clockwise) to SVG cartesian. */
function polarToXY(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
}

/** Build a pie-slice SVG path for segment `i`. */
function slicePath(i: number): string {
  const start = i * ANGLE_DEG;
  const end = (i + 1) * ANGLE_DEG;
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

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "transparent",
    border: "none",
    borderBottom: "1px solid color-mix(in srgb, var(--color-tan) 45%, transparent)",
    outline: "none",
    padding: "10px 0",
    fontSize: "13px",
    color: "var(--foreground)",
    fontFamily: "var(--font-body)",
    letterSpacing: "0.03em",
  };

  return (
    <div
      className="flex flex-col items-center justify-center px-6"
      style={{ minHeight: "calc(100vh - 80px)" }}
    >
      <div className="w-full max-w-sm">
        <p
          className="text-[10px] tracking-[0.38em] uppercase mb-5 text-center"
          style={{ color: "var(--color-tan)" }}
        >
          — members only
        </p>
        <h1
          className="text-[clamp(2rem,5vw,3rem)] font-semibold leading-tight tracking-tight text-center mb-10"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Lucky Wheel
        </h1>

        <form onSubmit={submit} noValidate>
          <div className="mb-6">
            <label
              className="block text-[10px] tracking-[0.3em] uppercase mb-2"
              style={{ color: "var(--color-tan)" }}
            >
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              placeholder="your@email.com"
            />
          </div>

          <div className="mb-8">
            <label
              className="block text-[10px] tracking-[0.3em] uppercase mb-2"
              style={{ color: "var(--color-tan)" }}
            >
              Password
            </label>
            <input
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
              className="text-[11px] mb-5 tracking-wide"
              style={{ color: "#b04040" }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-xs tracking-[0.28em] uppercase transition-opacity"
            style={{
              backgroundColor: loading ? "var(--color-tan)" : "var(--color-earth)",
              color: "#f2ede4",
              fontFamily: "var(--font-body)",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              border: "none",
              outline: "none",
            }}
          >
            {loading ? "signing in…" : "sign in"}
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
  const isNoReward = result === "Try Again";
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
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: "rgba(15,14,11,0.55)",
        backdropFilter: "blur(4px)",
        paddingLeft: leftOffset,
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Your reward"
    >
      <div
        className="relative flex flex-col items-center justify-center text-center px-12 py-16"
        style={{
          background: "var(--background)",
          maxWidth: 480,
          width: "calc(100% - 48px)",
          animation: "modalIn 0.35s cubic-bezier(0.22,1,0.36,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 16,
            right: 20,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--color-tan)",
            fontSize: "20px",
            lineHeight: 1,
            padding: 4,
          }}
        >
          ×
        </button>

        <p
          className="text-[10px] tracking-[0.38em] uppercase mb-6"
          style={{ color: "var(--color-tan)" }}
        >
          — your reward
        </p>

        {isNoReward ? (
          <p
            className="text-3xl font-semibold"
            style={{ fontFamily: "var(--font-body)", color: "var(--color-sand)" }}
          >
            Better luck next time
          </p>
        ) : (
          <>
            <p
              className="text-[clamp(2rem,8vw,3.2rem)] font-semibold leading-tight"
              style={{ fontFamily: "var(--font-body)", color: "var(--foreground)" }}
            >
              {result}
            </p>

            <div
              className="w-16 my-8"
              style={{ height: 1, backgroundColor: "color-mix(in srgb, var(--color-tan) 35%, transparent)" }}
            />

            <p
              className="text-[11px] tracking-wide leading-relaxed"
              style={{ color: "var(--color-sand)" }}
            >
              Show this screen to your server to redeem your reward.
            </p>
          </>
        )}
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.94) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ─── Main Wheel Component ─────────────────────────────────────────────────────

export default function LuckyWheel() {
  const { tenant } = useTenant();

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

    const selectedIndex = Math.floor(Math.random() * NUM);

    const targetOffset =
      (360 - (selectedIndex + 0.5) * ANGLE_DEG + 360) % 360;
    const currentMod = rotationRef.current % 360;
    const delta = (targetOffset - currentMod + 360) % 360;
    const newRotation = rotationRef.current + 5 * 360 + delta;

    rotationRef.current = newRotation;
    setRotation(newRotation);

    setTimeout(async () => {
      const reward = SEGMENTS[selectedIndex].lines.join(" ");
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
      <div
        className="flex flex-col items-center justify-start px-6 py-16"
        style={{ minHeight: "calc(100vh - 80px)" }}
      >
        {/* ── Header ── */}
        <div className="text-center mb-10">
          <p
            className="text-[10px] tracking-[0.38em] uppercase mb-5"
            style={{ color: "var(--color-tan)" }}
          >
            — try your luck
          </p>
          <h1
            className="text-[clamp(2.6rem,6vw,4.2rem)] font-semibold leading-[0.92] tracking-tight"
            style={{ fontFamily: "var(--font-body)", color: "var(--foreground)" }}
          >
            Lucky Wheel
          </h1>
          {userName && (
            <p
              className="mt-4 text-[12px] tracking-wide"
              style={{ color: "var(--color-tan)" }}
            >
              welcome, {userName}
            </p>
          )}
          <p
            className="mt-3 text-[13px] leading-relaxed max-w-xs mx-auto"
            style={{ color: "var(--color-sand)" }}
          >
            One spin per visit. Show your reward to the team to redeem it.
          </p>
        </div>

        {/* ── Wheel ── */}
        <div className="relative select-none" style={{ width: VIEWBOX, height: VIEWBOX }}>
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
              borderTop: "22px solid #3d3018",
              zIndex: 10,
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))",
            }}
          />

          {/* SVG Wheel */}
          <svg
            width={VIEWBOX}
            height={VIEWBOX}
            viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning
                ? `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)`
                : "none",
              filter: "drop-shadow(0 6px 20px rgba(61,48,24,0.18))",
            }}
            aria-label="Lucky wheel"
            role="img"
          >
            <circle cx={CX} cy={CY} r={R + 2} fill="none" stroke="#3d3018" strokeWidth={4} />

            {SEGMENTS.map((seg, i) => {
              const midAngle = (i + 0.5) * ANGLE_DEG;
              const textPos = polarToXY(midAngle, R * 0.63);
              const rot = textRotation(midAngle);
              const color = COLORS[i];
              const isMultiLine = seg.lines.length > 1;
              return (
                <g key={i}>
                  <path d={slicePath(i)} fill={color.bg} stroke="#f2ede4" strokeWidth={1.5} />
                  <text
                    transform={`translate(${textPos.x},${textPos.y}) rotate(${rot})`}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                      fontSize: "9.5px",
                      fontFamily: "var(--font-body)",
                      fontWeight: 600,
                      fill: color.text,
                      letterSpacing: "0.04em",
                      pointerEvents: "none",
                      userSelect: "none",
                    }}
                  >
                    {seg.lines.map((line, j) => (
                      <tspan key={j} x="0" dy={j === 0 ? (isMultiLine ? "-7" : "0") : "14"}>
                        {line}
                      </tspan>
                    ))}
                  </text>
                </g>
              );
            })}

            {SEGMENTS.map((_, i) => {
              const spoke = polarToXY(i * ANGLE_DEG, R);
              return (
                <line
                  key={`spoke-${i}`}
                  x1={CX} y1={CY} x2={spoke.x} y2={spoke.y}
                  stroke="#f2ede4" strokeWidth={1.5}
                />
              );
            })}

            <circle cx={CX} cy={CY} r={20} fill="#3d3018" />
            <circle cx={CX} cy={CY} r={15} fill="#f2ede4" />
            <circle cx={CX} cy={CY} r={4} fill="#3d3018" />
          </svg>
        </div>

        {/* ── Spin Button ── */}
        <button
          onClick={spin}
          disabled={spinning}
          className="mt-10 px-14 py-3 text-xs tracking-[0.28em] uppercase transition-opacity"
          style={{
            backgroundColor: spinning ? "var(--color-tan)" : "var(--color-earth)",
            color: "#f2ede4",
            fontFamily: "var(--font-body)",
            cursor: spinning ? "not-allowed" : "pointer",
            opacity: spinning ? 0.65 : 1,
            outline: "none",
            border: "none",
          }}
          aria-label={spinning ? "Spinning…" : "Spin the wheel"}
        >
          {spinning ? "spinning…" : "spin"}
        </button>
      </div>

      {/* ── Result Modal ── */}
      {result && (
        <RewardModal result={result} onClose={() => setResult(null)} />
      )}
    </>
  );
}
