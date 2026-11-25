/**
 * Virtual light source for the Photo Wall.
 *
 * The wall is a shallow 3D scene: frames float at `z` px in front of a flat
 * wall at z = 0, and a soft ceiling light sits in front of them. This module
 * turns that light into per-frame shadows with two exact geometric relations
 * and one deliberately normalised falloff:
 *
 *  1. Pinhole projection — a ray from the light through the frame centre hits
 *     the wall at `L + t(F - L)` where `t = Lz / (Lz - Fz)`. The shadow offset
 *     is therefore `(t - 1) * (F - L)`, i.e. it points AWAY from the light and
 *     grows both with the frame's depth and with its distance from the light
 *     axis. This is the part that makes shadows react to where the light is.
 *
 *  2. Penumbra — an emitter of radius `r` seen through an occluder at Fz casts
 *     a penumbra of `r * Fz / (Lz - Fz)` on the wall (similar triangles). The
 *     same factor `t - 1` therefore drives both the throw and the softness: a
 *     frame close to the light throws a long, very soft shadow; a frame near
 *     the wall keeps a short, crisp contact shadow.
 *
 *  3. Falloff — physical inverse-square would kill the shadows of edge frames,
 *     because the wall is ~1.6 viewport widths across while the light is only
 *     a fraction of that in front of it. We use a normalised scene distance
 *     instead: it still dims prints further from the light, but keeps every
 *     frame's shadow visible. Documented here so the choice is explicit.
 *
 * Coordinate systems (kept in sync with `geometry.ts` and the CSS):
 *   x — percent of a tile; 1 tile = 1.64 × the container width (1.64 cqw per %)
 *   y — percent of the stage; 1 stage % = 1.64 cqh = 1.64 / aspect cqw
 *   z — virtual-stage px; the gallery's preview renders a 1920px-wide stage,
 *       so that is used as the fixed reference for mixing z with cqw-based x/y.
 */
import { TILE_VW } from './geometry';
import type { FrameGeometry } from './geometry';
import type { WallFrame } from './tiles';
import { DEFAULT_WALL_PARAMS, type WallParams } from './params';

/** Reference width of the virtual stage (matches the gallery's preview stage). */
export const VIRTUAL_STAGE_PX = 1920;

/** A virtual light source: tile/stage position, depth, radius, intensity and tint. */
export interface VirtualLight {
  /** x position in tile-percent. Repeats per tile so the endless strip stays seamless. */
  x: number;
  /** y position in stage-percent; negative values sit above the screen (ceiling). */
  y: number;
  /** Distance in front of the wall, in virtual-stage px. Must exceed every frame z. */
  z: number;
  /** Emitter radius in cqw — drives penumbra width and the glow size. */
  radius: number;
  /** Relative brightness. 1 is the reference warm ceiling spot. */
  intensity: number;
  /** Tint of the light's wash as an RGB triplet, e.g. '255, 250, 236'. */
  glowColor?: string;
}

/** A broad warm ceiling spot above the centre of the wall. */
export const DEFAULT_LIGHT: VirtualLight = {
  x: 50,
  y: -10,
  z: 600,
  radius: 48,
  intensity: 1,
};

/** One frame's lighting result: shadow offset/blur/spread/alpha, highlight and diagnostics. */
export interface FrameLighting {
  /** Shadow cast on the wall, in cqw (CSS multiplies by 1cqw). */
  shadowX: number;
  shadowY: number;
  /** Penumbra width and outline growth, in cqw. */
  shadowBlur: number;
  shadowSpread: number;
  /** Peak and soft shadow alpha. */
  shadowAlpha: number;
  /** Ceiling-light catch on the top bevel, 0..1. */
  highlight: number;
  /** Light-to-frame distance in virtual-stage px (exposed for tests/tuning). */
  distance: number;
  /** Projection factor (t - 1); also exposed for tuning and tests. */
  throwFactor: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * The control console still exposes the original shadow-tuning sliders. Keep
 * them meaningful as gains over the geometric result: divide the legacy
 * expression by the same expression evaluated with DEFAULT_WALL_PARAMS, so a
 * default config gives exactly 1 and moving a slider scales that attribute.
 */
function legacyGain(
  base: number,
  random: number,
  refBase: number,
  refRandom: number,
  jitter: number,
  depth = 0,
  depthTerm = 0,
  refDepthTerm = 0,
): number {
  const value = base + depth * depthTerm + jitter * random;
  const reference =
    refBase + depth * refDepthTerm + jitter * refRandom;
  if (Math.abs(reference) < 1e-6) return 1;
  return clamp(value / reference, 0.1, 4);
}

/** Inputs for `computeFrameLighting`: frame, solved geometry, light, params, aspect and jitter. */
export interface FrameLightingInput {
  frame: WallFrame;
  /** The SOLVED geometry (real image ratio), not the procedural fallback. */
  geometry: FrameGeometry;
  light?: VirtualLight;
  params: WallParams;
  /** Viewport width / height, used to convert vertical stage units to cqw. */
  aspect: number;
  /** Stable per-frame variation (0..1) from the seeded generator. */
  jitter?: number;
}

/**
 * Compute where one frame's shadow lands on the wall and how it looks.
 *
 * Pure: no DOM, no randomness beyond the caller's stable `jitter`, and no
 * viewport width — every quantity is expressed in cqw or dimensionless so the
 * preview and the fullscreen TV resolve identically.
 */
export function computeFrameLighting(input: FrameLightingInput): FrameLighting {
  const light = input.light ?? DEFAULT_LIGHT;
  const aspect = input.aspect > 0 ? input.aspect : 16 / 9;
  const { frame, geometry, params } = input;
  const jitter = clamp(input.jitter ?? 0.5, 0, 1);

  // Frame centre in the two layout coordinate systems. Frame height as a
  // fraction of the stage is widthPct * aspect / ratio (see geometry.ts).
  const centerX = frame.x + geometry.widthPct / 2;
  const centerY =
    frame.y + (geometry.widthPct * aspect) / geometry.ratio / 2;
  const frameZ = Math.max(0, frame.z);

  // Similar-triangles projection factor. The light must stay in front of the
  // frame; clamping keeps the function total for misconfigured lights.
  const separation = Math.max(1, light.z - frameZ);
  const throwFactor = Math.min(2.5, frameZ / separation);

  // Shadow displacement = (t - 1) * (F - L), converted from tile/stage units
  // to cqw. The virtual-stage constant cancels in this conversion, which is
  // exactly why the result is independent of the physical viewport width.
  const depth = frameZ / 100;
  const D = DEFAULT_WALL_PARAMS;
  const gainX = legacyGain(
    params.shadowXBase, params.shadowXRandom, D.shadowXBase, D.shadowXRandom, jitter,
  );
  const gainY = legacyGain(
    params.shadowYBase, params.shadowYRandom, D.shadowYBase, D.shadowYRandom,
    jitter, depth, params.shadowYDepth, D.shadowYDepth,
  );
  const gainBlur = legacyGain(
    params.shadowBlurBase, params.shadowBlurRandom, D.shadowBlurBase, D.shadowBlurRandom,
    jitter, depth, params.shadowBlurDepth, D.shadowBlurDepth,
  );
  const gainSpread = legacyGain(
    -params.shadowSpreadRandom, params.shadowSpreadBase,
    -D.shadowSpreadRandom, D.shadowSpreadBase, jitter,
  );

  const shadowX = throwFactor * (centerX - light.x) * TILE_VW * gainX;
  const shadowY =
    ((throwFactor * (centerY - light.y) * TILE_VW) / aspect) * gainY;

  // Penumbra of an area light: r * Fz / (Lz - Fz) = r * throwFactor.
  const shadowBlur = (0.12 + Math.max(0, light.radius) * throwFactor) * gainBlur;
  const shadowSpread = shadowBlur * 0.12 * gainSpread;

  // Normalised distance on the wall: 0 at the light axis, ~1 near a tile edge.
  const nx = (centerX - light.x) / 50;
  const ny = (centerY - light.y) / 100;
  const wallDistanceSq = nx * nx + ny * ny;
  const attenuation = 1 / (1 + 0.35 * wallDistanceSq);

  // Soft light spreads energy out, so the peak of the shadow lifts as blur grows.
  const softness = 1 / (1 + shadowBlur * 0.06);
  const variation = 0.9 + jitter * 0.2;
  const shadowAlpha = clamp(
    (params.shadowAlphaBase + params.shadowAlphaRandom * 0.5) *
      Math.max(0, light.intensity) *
      attenuation *
      softness *
      variation,
    0.03,
    0.6,
  );

  // Lambert cosine of the frame normal (+z) against the direction to the light.
  const pxPerTilePct = (TILE_VW * VIRTUAL_STAGE_PX) / 100;
  const pxPerStagePct = (TILE_VW * VIRTUAL_STAGE_PX) / (100 * aspect);
  const dxPx = (centerX - light.x) * pxPerTilePct;
  const dyPx = (centerY - light.y) * pxPerStagePct;
  const distance = Math.sqrt(dxPx * dxPx + dyPx * dyPx + separation * separation);
  const cosine = separation / distance;

  const highlight = clamp(
    (params.highlightBase + params.highlightRandom * 0.5) *
      Math.max(0, light.intensity) *
      (0.4 + 0.6 * cosine) *
      (0.7 + 0.3 * attenuation) *
      variation,
    0,
    0.4,
  );

  return {
    shadowX,
    shadowY,
    shadowBlur,
    shadowSpread,
    shadowAlpha,
    highlight,
    distance,
    throwFactor,
  };
}

/**
 * Several lights are handled by solving each one independently and compositing
 * the results. Each light contributes its OWN shadow layer (so overlapping
 * shadows accumulate as separate CSS box-shadows rather than replacing each
 * other), while their bevel highlights add together. This is the linear
 * superposition of independent light sources: no light changes where another
 * light's shadow falls — it only adds brightness or another darkening layer.
 */
export interface FrameLightingSet {
  /** One entry per light, in the same order as the input; paint in that order. */
  shadows: FrameLighting[];
  /** Sum of all light contributions to the top bevel, clamped to 0..0.4. */
  highlight: number;
}

/** `FrameLightingInput` with a list of lights instead of a single one. */
export type MultiFrameLightingInput = Omit<FrameLightingInput, 'light'> & {
  lights?: VirtualLight[];
};

/** Solve a frame against any number of lights. Empty input falls back to the default spot. */
export function computeFrameLightingMulti(
  input: MultiFrameLightingInput,
): FrameLightingSet {
  const lights = input.lights?.length ? input.lights : [DEFAULT_LIGHT];
  const shadows = lights.map((light) => computeFrameLighting({ ...input, light }));
  const highlight = clamp(
    shadows.reduce((sum, shadow) => sum + shadow.highlight, 0),
    0,
    0.4,
  );
  return { shadows, highlight };
}

/** Wall-wash parameters for one light, in stage percentages and cqw. */
export interface WallGlow {
  /** Horizontal position as a percent of the stage width. */
  xPct: number;
  /** Vertical position as a percent of the stage height (negative is above it). */
  yPct: number;
  /** Diameter of the soft pool on the wall, cqw. */
  sizeCqw: number;
  /** Strength of the warm ceiling wash, 0..1. */
  alpha: number;
  /** Tint as an RGB triplet, e.g. '255, 250, 236'. */
  color: string;
}

/**
 * Map the virtual light onto the wall-light overlay.
 *
 * Both results are percentages of the stage element, not vw/vh units: the
 * console preview renders a 1920px virtual stage that is CSS-scaled into a
 * small box, so viewport units would point at the wrong place there. The
 * camera starts at -32% of the stage and a tile is 164% of it wide, so tile
 * x = 50 lands exactly at centre: stageX% = 1.64 * tileX - 32. Light y is
 * already expressed in stage percent.
 */
export function computeWallGlow(light: VirtualLight = DEFAULT_LIGHT): WallGlow {
  return {
    xPct: TILE_VW * light.x - 32,
    yPct: light.y,
    sizeCqw: Math.max(20, Math.abs(light.radius) * 2.4),
    alpha: clamp(0.42 * Math.max(0, light.intensity), 0, 0.85),
    color: light.glowColor ?? '255, 250, 236',
  };
}

/** Wall wash for every light, in the same order as the input. */
export function computeWallGlows(lights?: VirtualLight[]): WallGlow[] {
  const active = lights?.length ? lights : [DEFAULT_LIGHT];
  return active.map(computeWallGlow);
}

/**
 * Paint one box-shadow layer per light, plus the shared contact line. Overlapping
 * shadows composite in CSS instead of replacing one another, which is how
 * independent light sources behave.
 */
export function formatFrameShadow(shadows: FrameLighting[]): string {
  const contact = '0 0.12cqw 0.3cqw rgba(36, 26, 15, 0.16)';
  const layers = shadows.flatMap((shadow) => {
    const x = shadow.shadowX.toFixed(3);
    const y = shadow.shadowY.toFixed(3);
    const blur = shadow.shadowBlur.toFixed(3);
    const spread = shadow.shadowSpread.toFixed(3);
    const alpha = shadow.shadowAlpha.toFixed(3);
    const soft = (shadow.shadowAlpha * 0.42).toFixed(3);
    return [
      `calc(${x} * 1cqw) calc(${y} * 1cqw) calc(${blur} * 1cqw) calc(${spread} * 1cqw) rgba(38, 27, 16, ${alpha})`,
      `calc(${x} * 2.1cqw) calc(${y} * 2.3cqw) calc(${blur} * 2.1cqw) calc(${spread} * 1.7cqw) rgba(38, 27, 16, ${soft})`,
    ];
  });
  return [contact, ...layers].join(', ');
}

/** One wall-wash gradient per light, followed by the ambient falloff. */
export function formatWallGlow(glows: WallGlow[]): string {
  const washes = glows.map(
    (glow) =>
      `radial-gradient(${glow.sizeCqw.toFixed(1)}cqw ${glow.sizeCqw.toFixed(1)}cqw at ${glow.xPct.toFixed(2)}% ${glow.yPct.toFixed(2)}%, rgba(${glow.color}, ${glow.alpha.toFixed(3)}), transparent 72%)`,
  );
  return [
    ...washes,
    'radial-gradient(96% 64% at 50% 0%, rgba(255, 255, 255, 0.1), transparent 70%)',
    'radial-gradient(62% 62% at 88% 98%, rgba(84, 66, 43, 0.15), transparent 72%)',
  ].join(', ');
}
