/**
 * Procedural generation of the Photo Wall.
 *
 * A "tile" is one repeatable segment of the endless wall. Generating tiles
 * from a seed means a saved seed reproduces the exact same wall forever; no
 * layout is stored, only the seed and the tunable parameters.
 */
import { DEFAULT_WALL_PARAMS, type WallParams } from './params';

export type FrameKind = 'black' | 'walnut' | 'oak' | 'gold' | 'cherry' | 'ash';

export interface WallFrame {
  x: number;
  y: number;
  w: number;
  ratio: number;
  frame: FrameKind;
  /** Distance in front of the wall, in px. Difference drives parallax. */
  z: number;
  /** Tiny in-plane rotation, degrees. Keeps the wall from feeling CG-perfect. */
  tilt?: number;
}

export interface WallStyle {
  wood: string;
  matTop: string;
  matBottom: string;
  railScale: number;
  sheen: number;
  grainJitter: number;
  /** Top-light shadow vector, in vw, derived from position and depth. */
  shadowX: number;
  shadowY: number;
  shadowBlur: number;
  shadowSpread: number;
  shadowAlpha: number;
  /** Strength of the highlight on the top bevel of the wood rails. */
  highlight: number;
}

/** One repeatable segment of the endless Photo Wall. */
export interface WallTile {
  frames: WallFrame[];
  styles: WallStyle[];
}

const FRAME_KINDS: FrameKind[] = [
  'black',
  'walnut',
  'oak',
  'gold',
  'cherry',
  'ash',
];

/** Small, fast, seedable PRNG. Same seed always rebuilds the same wall. */
export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round2 = (value: number) => Math.round(value * 100) / 100;

/**
 * Converts a frame width (percentage of the wall tile) into its on-screen
 * height in vh. The stage keeps the viewport's 16:9 shape, which makes this
 * a single, tidy conversion.
 */
const heightInVh = (width: number, ratio: number) =>
  (width * 1.64 * (16 / 9)) / ratio;

/** Builds one frame's wood, mat and lighting from the seeded PRNG. */
export function createWallStyle(
  random: () => number,
  frame: WallFrame,
  params: WallParams,
): WallStyle {
  const roll = random();
  let wood: string;
  if (roll < 0.26) {
    // Ebony / black lacquer.
    wood = `hsl(${26 + random() * 8} ${6 + random() * 8}% ${7 + random() * 7}%)`;
  } else if (roll < 0.4) {
    // Pale ash.
    wood = `hsl(${34 + random() * 8} ${14 + random() * 12}% ${52 + random() * 12}%)`;
  } else {
    const hue = 17 + random() * 22;
    const sat = 26 + random() * 24;
    const light = 15 + random() * 24;
    wood = `hsl(${hue.toFixed(1)} ${sat.toFixed(1)}% ${light.toFixed(1)}%)`;
  }

  const matRoll = random();
  const matTop =
    matRoll < 0.25 ? '#f8f3e7' : matRoll < 0.6 ? '#fbf8f0' : '#f1ead9';
  const matBottom =
    matRoll < 0.25 ? '#e7dfcd' : matRoll < 0.6 ? '#efe9dc' : '#e4dac6';

  // A ceiling spot above the centre of the screen: side prints throw their
  // shadow outward, nearer prints throw it farther and softer.
  const unit = frame.w * 1.64;
  const offset = (frame.x + frame.w / 2 - 50) / 50;
  const depth = frame.z / 100;

  return {
    wood,
    matTop,
    matBottom,
    railScale: params.railScaleMin + random() * (params.railScaleMax - params.railScaleMin),
    sheen: params.sheenMin + random() * (params.sheenMax - params.sheenMin),
    grainJitter: Math.round(random() * params.grainJitterRange * 2 - params.grainJitterRange),
    shadowX: round2(offset * (params.shadowXBase + random() * params.shadowXRandom) * unit),
    shadowY: round2(
      (params.shadowYBase + depth * params.shadowYDepth + random() * params.shadowYRandom) * unit,
    ),
    shadowBlur: round2(
      (params.shadowBlurBase + depth * params.shadowBlurDepth + random() * params.shadowBlurRandom) * unit,
    ),
    shadowSpread: round2(
      (random() * params.shadowSpreadBase - params.shadowSpreadRandom) * unit,
    ),
    shadowAlpha: round2(params.shadowAlphaBase + random() * params.shadowAlphaRandom),
    highlight: round2(params.highlightBase + random() * params.highlightRandom),
  };
}

/**
 * Lays out one wall tile generically.
 *
 * Prints sit in independent columns, so overlap is structurally impossible.
 * Column count is fixed at four because the vertical placement alternates
 * top / bottom / top / bottom: an even count makes the alternation continue
 * across the seam, so every pair of neighbouring columns — including the last
 * print of one tile and the first of the next — contains one high and one low
 * print. Any ~two columns on screen therefore reach from the top of the safe
 * band to the bottom, which keeps the screen filled at every camera position.
 *
 * All numeric knobs come from `params`, so a control panel can retune the wall
 * without touching layout constants.
 */
export function createWallTile(
  random: () => number,
  params: WallParams,
): WallTile {
  const count = params.count;
  const marginLeft = params.marginMin + random() * (params.marginMax - params.marginMin);
  const marginRight = params.marginMin + random() * (params.marginMax - params.marginMin);
  const gap = params.gap;
  const available = 100 - marginLeft - marginRight - gap * (count - 1);

  const weights = Array.from({ length: count }, () => 0.86 + random() * 0.28);
  // Occasionally let one print dominate the tile.
  if (random() < 0.55) {
    weights[Math.floor(random() * count)] *= 1.26;
  }
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);

  const frames: WallFrame[] = [];
  const styles: WallStyle[] = [];
  let x = marginLeft;
  let previousKind: FrameKind | null = null;

  for (let i = 0; i < count; i += 1) {
    const w = (weights[i] / weightSum) * available;
    const high = i % 2 === 0;

    // High prints read as landscapes; low prints mix landscapes with the
    // occasional tall portrait that reaches back up toward the middle.
    let ratio = high
      ? 1.25 + random() * 0.5
      : random() < 0.42
        ? 0.78 + random() * 0.18
        : 1.15 + random() * 0.5;

    // Clamp the print to a comfortable height band; this also guarantees it
    // fits between the safe edges whichever anchor it uses.
    const rawHeight = heightInVh(w, ratio);
    if (rawHeight > params.maxFrameHeight) {
      ratio = (w * 1.64 * (16 / 9)) / params.maxFrameHeight;
    } else if (rawHeight < params.minFrameHeight) {
      ratio = (w * 1.64 * (16 / 9)) / params.minFrameHeight;
    }

    const h = heightInVh(w, ratio);
    const top = high
      ? params.safeTop + random() * params.verticalJitter
      : params.safeBottom - random() * params.verticalJitter - h;

    // 1.64 is the stage overhang; screen y = 1.64 * stage y - 32.
    const y = (top + 32) / 1.64;

    let kind = FRAME_KINDS[Math.floor(random() * FRAME_KINDS.length)];
    if (kind === previousKind) {
      kind =
        FRAME_KINDS[
          (FRAME_KINDS.indexOf(kind) + 1) % FRAME_KINDS.length
        ];
    }
    previousKind = kind;

    const frame: WallFrame = {
      x: round2(x),
      y: round2(y),
      w: round2(w),
      ratio: round2(ratio),
      frame: kind,
      z: Math.round(params.zMin + random() * (params.zMax - params.zMin)),
      tilt: round2((random() - 0.5) * params.tiltRange),
    };

    frames.push(frame);
    styles.push(createWallStyle(random, frame, params));
    x += w + gap;
  }

  return { frames, styles };
}

/**
 * Creates the two contrasting tiles that make up one endless wall.
 * The camera glides across [A, B, A, B] and wraps after two tiles.
 */
export function createWallTiles(seed: number, params?: WallParams): WallTile[] {
  const p = params ?? DEFAULT_WALL_PARAMS;
  const random = createSeededRandom(seed);
  return [createWallTile(random, p), createWallTile(random, p)];
}

/** Repeats a collection so sparse galleries still fill a layout. */
export function wrapImages<T>(items: T[], offset: number, count: number): T[] {
  if (!items.length) return [];
  return Array.from(
    { length: count },
    (_, index) => items[(offset + index) % items.length],
  );
}
