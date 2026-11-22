/**
 * Design tokens as framework-neutral data.
 *
 * This module is the single source of truth for values that are currently
 * mirrored in `packages/ui/src/styles.css`. Dev-time generators turn it into
 * CSS custom properties, JSON, and Swift constants so a native renderer can
 * use the same design decisions. No runtime dependency, no DOM access.
 */

/* ── Accent palettes ─────────────────────────────────────────────────────── */

export const ACCENTS = [
  'warmth',
  'serenity',
  'growth',
  'gentle',
  'vitality',
] as const;
export type Accent = (typeof ACCENTS)[number];
export const DEFAULT_ACCENT: Accent = 'warmth';

export interface Palette {
  accent: string;
  ink: string;
  soft: string;
  glow: string;
  tint: string;
}

export const ACCENT_PALETTES: Record<Accent, Record<'light' | 'dark', Palette>> = {
  warmth: {
    light: {
      accent: '#b23a0a',
      ink: '#ffffff',
      soft: 'rgba(178,58,10,0.12)',
      glow: 'rgba(178,58,10,0.4)',
      tint: 'rgba(178,58,10,0.08)',
    },
    dark: {
      accent: '#ff9a76',
      ink: '#2a0e04',
      soft: 'rgba(255,154,118,0.16)',
      glow: 'rgba(255,154,118,0.55)',
      tint: 'rgba(255,154,118,0.07)',
    },
  },
  serenity: {
    light: {
      accent: '#1565c0',
      ink: '#ffffff',
      soft: 'rgba(21,101,192,0.12)',
      glow: 'rgba(21,101,192,0.4)',
      tint: 'rgba(21,101,192,0.08)',
    },
    dark: {
      accent: '#7ab8ff',
      ink: '#082744',
      soft: 'rgba(122,184,255,0.16)',
      glow: 'rgba(122,184,255,0.5)',
      tint: 'rgba(122,184,255,0.07)',
    },
  },
  growth: {
    light: {
      accent: '#2e7d32',
      ink: '#ffffff',
      soft: 'rgba(46,125,50,0.12)',
      glow: 'rgba(46,125,50,0.4)',
      tint: 'rgba(46,125,50,0.08)',
    },
    dark: {
      accent: '#8fd694',
      ink: '#0a2a0d',
      soft: 'rgba(143,214,148,0.16)',
      glow: 'rgba(143,214,148,0.5)',
      tint: 'rgba(143,214,148,0.07)',
    },
  },
  gentle: {
    light: {
      accent: '#6a1b9a',
      ink: '#ffffff',
      soft: 'rgba(106,27,154,0.12)',
      glow: 'rgba(106,27,154,0.4)',
      tint: 'rgba(106,27,154,0.08)',
    },
    dark: {
      accent: '#c4a8f0',
      ink: '#1a0e2e',
      soft: 'rgba(196,168,240,0.16)',
      glow: 'rgba(196,168,240,0.5)',
      tint: 'rgba(196,168,240,0.07)',
    },
  },
  vitality: {
    light: {
      accent: '#5a7d00',
      ink: '#ffffff',
      soft: 'rgba(90,125,0,0.12)',
      glow: 'rgba(90,125,0,0.4)',
      tint: 'rgba(90,125,0,0.08)',
    },
    dark: {
      accent: '#d7ff5f',
      ink: '#15190a',
      soft: 'rgba(215,255,95,0.14)',
      glow: 'rgba(215,255,95,0.55)',
      tint: 'rgba(215,255,95,0.07)',
    },
  },
};

/* ── Surfaces (theme-dependent, accent-independent) ─────────────────────── */

export interface Surfaces {
  bg: string;
  bgElevated: string;
  bgElevated2: string;
  bgGlass: string;
  text: string;
  textDim: string;
  textFaint: string;
  border: string;
  borderStrong: string;
  danger: string;
  dangerSoft: string;
  success: string;
  successSoft: string;
  track: string;
  knobBorder: string;
  scrim: string;
  shadowSm: string;
  shadowMd: string;
}

export const SURFACES: Record<'light' | 'dark', Surfaces> = {
  light: {
    bg: '#f2f3f7',
    bgElevated: '#ffffff',
    bgElevated2: '#f7f8fa',
    bgGlass: 'rgba(255,255,255,0.78)',
    text: '#15171c',
    textDim: '#5a6270',
    textFaint: '#8b93a1',
    border: 'rgba(0,0,0,0.09)',
    borderStrong: 'rgba(0,0,0,0.16)',
    danger: '#c62828',
    dangerSoft: 'rgba(198,40,40,0.1)',
    success: '#1b7f3a',
    successSoft: 'rgba(27,127,58,0.12)',
    track: 'rgba(0,0,0,0.14)',
    knobBorder: '#ffffff',
    scrim: 'rgba(0,0,0,0.4)',
    shadowSm: '0 2px 8px rgba(0,0,0,0.08)',
    shadowMd: '0 8px 24px rgba(0,0,0,0.14)',
  },
  dark: {
    bg: '#0a0b0f',
    bgElevated: '#12141a',
    bgElevated2: '#191c24',
    bgGlass: 'rgba(18,20,26,0.72)',
    text: '#f2f3f7',
    textDim: '#9aa1b0',
    textFaint: '#666e7e',
    border: 'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.16)',
    danger: '#ff6b6b',
    dangerSoft: 'rgba(255,107,107,0.14)',
    success: '#7ee787',
    successSoft: 'rgba(126,231,135,0.14)',
    track: 'rgba(255,255,255,0.14)',
    knobBorder: '#0a0b0f',
    scrim: 'rgba(0,0,0,0.6)',
    shadowSm: '0 2px 8px rgba(0,0,0,0.28)',
    shadowMd: '0 8px 24px rgba(0,0,0,0.36)',
  },
};

/** CSS variable name for each surface key. Shared by the CSS/Swift generators. */
export const SURFACE_VARS: Record<keyof Surfaces, string> = {
  bg: '--bg',
  bgElevated: '--bg-elevated',
  bgElevated2: '--bg-elevated-2',
  bgGlass: '--bg-glass',
  text: '--text',
  textDim: '--text-dim',
  textFaint: '--text-faint',
  border: '--border',
  borderStrong: '--border-strong',
  danger: '--danger',
  dangerSoft: '--danger-soft',
  success: '--success',
  successSoft: '--success-soft',
  track: '--track',
  knobBorder: '--knob-border',
  scrim: '--scrim',
  shadowSm: '--shadow-sm',
  shadowMd: '--shadow-md',
};

export const PALETTE_VARS: Record<keyof Palette, string> = {
  accent: '--accent',
  ink: '--accent-ink',
  soft: '--accent-soft',
  glow: '--accent-glow',
  tint: '--accent-tint',
};

/* ── Glass material ───────────────────────────────────────────────────────── */

export interface Glass {
  fill: string;
  stroke: string;
  highlight: string;
  shadow: string;
}

/** Translucent material for surfaces that float above content. */
export const GLASS: Record<'light' | 'dark', Glass> = {
  light: {
    fill: 'rgba(255,255,255,0.52)',
    stroke: 'rgba(255,255,255,0.82)',
    highlight: 'rgba(255,255,255,0.92)',
    shadow: '0 8px 32px rgba(15,23,42,0.16)',
  },
  dark: {
    fill: 'rgba(24,26,34,0.52)',
    stroke: 'rgba(255,255,255,0.14)',
    highlight: 'rgba(255,255,255,0.24)',
    shadow: '0 10px 36px rgba(0,0,0,0.48)',
  },
};

export const GLASS_METRICS = {
  blur: '20px',
  saturate: '180%',
} as const;

export const GLASS_VARS: Record<keyof Glass, string> = {
  fill: '--glass-fill',
  stroke: '--glass-stroke',
  highlight: '--glass-highlight',
  shadow: '--glass-shadow',
};

function glassEntries(mode: 'light' | 'dark'): Array<[string, string]> {
  return Object.entries(GLASS[mode]).map(
    ([key, value]) => [GLASS_VARS[key as keyof Glass], value] as [string, string],
  );
}

/* ── Scales ──────────────────────────────────────────────────────────────── */

export const SPACING = {
  s1: '4px',
  s2: '8px',
  s3: '12px',
  s4: '16px',
  s5: '20px',
  s6: '24px',
  s8: '32px',
} as const;

export const RADII = {
  sm: '10px',
  md: '14px',
  lg: '20px',
  pill: '999px',
} as const;

export const TYPOGRAPHY = {
  font: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif",
  fontMono: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  xs: '11px',
  sm: '12.5px',
  base: '14px',
  lg: '17px',
  xl: '22px',
} as const;

export const MOTION = {
  ease: 'cubic-bezier(0.32, 0.72, 0, 1)',
  duration: '0.2s',
  /** Resistance limit in px; drag asymptotically approaches it. */
  deformShift: '18px',
  /** Axis stretch applied at full drag. */
  deformStretch: '10px',
  /** Perpendicular squash in px, independent of element size. */
  deformSquash: '5px',
  /** Scale applied at full drag. */
  deformScale: '0.96',
  /** Spring-back timing for release. */
  springDuration: '0.22s',
  springEase: 'cubic-bezier(0.16, 1.45, 0.3, 1)',
  /** Timing for layout morphs — surfaces that change size or position. */
  morphDuration: '0.26s',
  morphEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

export const TOUCH = '44px';

export const SAFE_AREA = {
  top: 'env(safe-area-inset-top, 0px)',
  bottom: 'env(safe-area-inset-bottom, 0px)',
  left: 'env(safe-area-inset-left, 0px)',
  right: 'env(safe-area-inset-right, 0px)',
} as const;

/* ── Generators (dev-time only) ──────────────────────────────────────────── */

function cssBlock(selector: string, entries: Array<[string, string]>): string {
  const body = entries.map(([name, value]) => `  ${name}: ${value};`).join('\n');
  return `${selector} {\n${body}\n}`;
}

/** CSS custom properties matching the values in `packages/ui/src/styles.css`. */
export function buildCssVariables(): string {
  const defaultPalette = ACCENT_PALETTES[DEFAULT_ACCENT];
  const surfaceEntries = (mode: 'light' | 'dark'): Array<[string, string]> => [
    ...Object.entries(SURFACES[mode]).map(
      ([key, value]) => [SURFACE_VARS[key as keyof Surfaces], value] as [string, string],
    ),
    ...Object.entries(defaultPalette[mode]).map(
      ([key, value]) => [PALETTE_VARS[key as keyof Palette], value] as [string, string],
    ),
  ];

  const systemDarkEntries: Array<[string, string]> = [
    ['color-scheme', 'dark'],
    ...surfaceEntries('dark').filter(
      ([name]) => name !== '--accent' && !name.startsWith('--accent-'),
    ),
    ...glassEntries('dark'),
  ];

  return [
    '/* Generated by @ilovecode33/ui-tokens. Do not edit by hand. */',
    cssBlock(':root, :root[data-theme=\'light\']', [
      ['color-scheme', 'light'],
      ...surfaceEntries('light'),
      ...glassEntries('light'),
    ]),
    '',
    cssBlock(':root[data-theme=\'dark\']', [
      ['color-scheme', 'dark'],
      ...surfaceEntries('dark'),
      ...glassEntries('dark'),
    ]),
    '',
    '@media (prefers-color-scheme: dark) {',
    cssBlock('  :root[data-theme=\'system\']', systemDarkEntries).replace(/^/gm, '  '),
    '}',
    '',
    cssBlock(':root', [
      ...Object.entries(SPACING).map(([key, value]) => [`--space-${key.slice(1)}`, value] as [string, string]),
      ['--gap', 'var(--space-4)'],
      ...Object.entries(RADII).map(([key, value]) => [`--radius${key === 'md' ? '' : `-${key}`}`, value] as [string, string]),
      ['--font', TYPOGRAPHY.font],
      ['--font-mono', TYPOGRAPHY.fontMono],
      ['--text-xs', TYPOGRAPHY.xs],
      ['--text-sm', TYPOGRAPHY.sm],
      ['--text-base', TYPOGRAPHY.base],
      ['--text-lg', TYPOGRAPHY.lg],
      ['--text-xl', TYPOGRAPHY.xl],
      ['--touch', TOUCH],
      ['--glass-blur', GLASS_METRICS.blur],
      ['--glass-saturate', GLASS_METRICS.saturate],
      ['--ease', MOTION.ease],
      ['--dur', MOTION.duration],
      ['--deform-shift', MOTION.deformShift],
      ['--deform-stretch', MOTION.deformStretch],
      ['--deform-squash', MOTION.deformSquash],
      ['--deform-scale', MOTION.deformScale],
      ['--spring-dur', MOTION.springDuration],
      ['--spring-ease', MOTION.springEase],
      ['--morph-dur', MOTION.morphDuration],
      ['--morph-ease', MOTION.morphEase],
      ...Object.entries(SAFE_AREA).map(([key, value]) => [`--safe-${key}`, value] as [string, string]),
    ]),
    '',
  ].join('\n');
}

/** A portable JSON representation for non-web clients. */
export function buildTokensJson(): string {
  return JSON.stringify(
    {
      accents: ACCENTS,
      palettes: ACCENT_PALETTES,
      surfaces: SURFACES,
      glass: GLASS,
      glassMetrics: GLASS_METRICS,
      spacing: SPACING,
      radii: RADII,
      typography: TYPOGRAPHY,
      motion: MOTION,
      touch: TOUCH,
      safeArea: SAFE_AREA,
    },
    null,
    2,
  );
}

/* ── Swift generation helpers ────────────────────────────────────────────── */

interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

function parseColor(value: string): Rgba {
  const hex = value.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const n = Number.parseInt(hex[1], 16);
    return {
      r: ((n >> 16) & 255) / 255,
      g: ((n >> 8) & 255) / 255,
      b: (n & 255) / 255,
      a: 1,
    };
  }
  const rgba = value.match(/^rgba\(([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)\)$/);
  if (rgba) {
    return {
      r: Number(rgba[1]) / 255,
      g: Number(rgba[2]) / 255,
      b: Number(rgba[3]) / 255,
      a: Number(rgba[4]),
    };
  }
  throw new Error(`Unsupported token color: ${value}`);
}

function swiftColor(value: string): string {
  const { r, g, b, a } = parseColor(value);
  const f = (n: number) => n.toFixed(3);
  return `Color(red: ${f(r)}, green: ${f(g)}, blue: ${f(b)}, opacity: ${f(a)})`;
}

function swiftName(key: string): string {
  return key.charAt(0).toLowerCase() + key.slice(1);
}

/** A SwiftUI draft with the same values, intended for a future native renderer. */
export function buildSwiftTokens(): string {
  const paletteStruct = (accent: Accent, mode: 'light' | 'dark'): string => {
    const p = ACCENT_PALETTES[accent][mode];
    return `    public static let ${accent}${mode === 'light' ? 'Light' : 'Dark'} = Palette(
      accent: ${swiftColor(p.accent)},
      ink: ${swiftColor(p.ink)},
      soft: ${swiftColor(p.soft)},
      glow: ${swiftColor(p.glow)},
      tint: ${swiftColor(p.tint)}
    )`;
  };

  const surfaceStruct = (mode: 'light' | 'dark'): string => {
    const s = SURFACES[mode];
    const lines = Object.entries(s)
      .map(([key, value]) =>
        key.startsWith('shadow')
          ? `      ${swiftName(key)}: ${JSON.stringify(value)}`
          : `      ${swiftName(key)}: ${swiftColor(value)}`,
      )
      .join(',\n');
    return `    public static let ${mode} = Surfaces(\n${lines}\n    )`;
  };

  const spacingLines = Object.entries(SPACING)
    .map(([key, value]) => `    public static let ${key}: CGFloat = ${Number.parseFloat(value)}`)
    .join('\n');
  const radiusLines = Object.entries(RADII)
    .map(([key, value]) => `    public static let ${key}: CGFloat = ${Number.parseFloat(value)}`)
    .join('\n');
  const paletteLines = ACCENTS.map((a) => paletteStruct(a, 'light')).concat(
    ACCENTS.map((a) => paletteStruct(a, 'dark')),
  ).join('\n');

  const glassStruct = (mode: 'light' | 'dark'): string => {
    const g = GLASS[mode];
    return `    public static let ${mode} = Glass(
      fill: ${swiftColor(g.fill)},
      stroke: ${swiftColor(g.stroke)},
      highlight: ${swiftColor(g.highlight)},
      shadow: ${JSON.stringify(g.shadow)}
    )`;
  };

  return `// Generated by @ilovecode33/ui-tokens. Do not edit by hand.
import SwiftUI

public enum UITokens {
  public struct Palette {
    public let accent: Color
    public let ink: Color
    public let soft: Color
    public let glow: Color
    public let tint: Color
  }

  public struct Surfaces {
${Object.keys(SURFACES.light).map((key) => `    public let ${swiftName(key)}: ${key.startsWith('shadow') ? 'String' : 'Color'}`).join('\n')}
  }

  public enum Spacing {
${spacingLines}
  }

  public enum Radius {
${radiusLines}
  }

  public enum Typography {
    public static let small: CGFloat = ${Number.parseFloat(TYPOGRAPHY.sm)}
    public static let body: CGFloat = ${Number.parseFloat(TYPOGRAPHY.base)}
    public static let title: CGFloat = ${Number.parseFloat(TYPOGRAPHY.lg)}
    public static let largeTitle: CGFloat = ${Number.parseFloat(TYPOGRAPHY.xl)}
  }

  public enum Motion {
    public static let duration: Double = ${Number.parseFloat(MOTION.duration)}
    public static let deformShift: CGFloat = ${Number.parseFloat(MOTION.deformShift)}
    public static let deformStretch: Double = ${Number.parseFloat(MOTION.deformStretch)}
    public static let deformSquash: Double = ${Number.parseFloat(MOTION.deformSquash)}
    public static let deformScale: Double = ${Number.parseFloat(MOTION.deformScale)}
    public static let springDuration: Double = ${Number.parseFloat(MOTION.springDuration)}
    public static let morphDuration: Double = ${Number.parseFloat(MOTION.morphDuration)}
  }

  /// Minimum touch target, matching --touch in CSS.
  public static let touch: CGFloat = ${Number.parseFloat(TOUCH)}

  public enum Surface {
${surfaceStruct('light')}
${surfaceStruct('dark')}
  }

  public struct Glass {
    public let fill: Color
    public let stroke: Color
    public let highlight: Color
    public let shadow: String
  }

  public enum Material {
${glassStruct('light')}
${glassStruct('dark')}
    public static let blur: CGFloat = ${Number.parseFloat(GLASS_METRICS.blur)}
    public static let saturation: Double = ${Number.parseFloat(GLASS_METRICS.saturate) / 100}
  }

  public enum Accent {
${paletteLines}
  }
}
`;
}
