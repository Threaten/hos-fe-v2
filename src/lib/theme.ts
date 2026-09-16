/** Derives readable foreground + accent shades from a tenant's brand hex color. */

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace("#", "").trim();
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const [rl, gl, bl] = [channel(r), channel(g), channel(b)];
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function mix(
  rgb: [number, number, number],
  target: number,
  amount: number,
): string {
  const [r, g, b] = rgb;
  const m = (c: number) => Math.round(c + (target - c) * amount);
  return `rgb(${m(r)}, ${m(g)}, ${m(b)})`;
}

export interface TenantTheme {
  primary: string;
  primaryForeground: string;
  primarySoft: string;
  primaryDeep: string;
  primaryTint: string;
  primaryMuted: string;
  primaryGlow: string;
  ring: string;
}

const FALLBACK_COLOR = "#8a1f1f";

export function buildTenantTheme(mainColor?: string | null): TenantTheme {
  const hex =
    mainColor && /^#?[0-9a-fA-F]{3,6}$/.test(mainColor)
      ? mainColor
      : FALLBACK_COLOR;
  const rgb =
    hexToRgb(hex) ?? (hexToRgb(FALLBACK_COLOR) as [number, number, number]);
  const luminance = relativeLuminance(rgb);
  const foreground = luminance > 0.55 ? "#171310" : "#fdfaf6";

  return {
    primary: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`,
    primaryForeground: foreground,
    primarySoft: mix(rgb, 255, 0.88),
    primaryDeep: mix(rgb, 0, 0.4),
    primaryTint: `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.06)`,
    primaryMuted: `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.12)`,
    primaryGlow: `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.25)`,
    ring: mix(rgb, 0, 0.1),
  };
}

/** CSS custom-property declarations to inject for a tenant's theme scope. */
export function themeCssVars(theme: TenantTheme): Record<string, string> {
  return {
    "--tenant-primary": theme.primary,
    "--tenant-primary-foreground": theme.primaryForeground,
    "--tenant-primary-soft": theme.primarySoft,
    "--tenant-primary-deep": theme.primaryDeep,
    "--tenant-primary-tint": theme.primaryTint,
    "--tenant-primary-muted": theme.primaryMuted,
    "--tenant-primary-glow": theme.primaryGlow,
    "--tenant-ring": theme.ring,
    "--primary": theme.primary,
    "--primary-foreground": theme.primaryForeground,
    "--ring": theme.ring,
  } as Record<string, string>;
}
