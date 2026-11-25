/**
 * Every numeric knob of the procedural Photo Wall.
 *
 * The shape intentionally mirrors the `WallParams` message generated from
 * `proto/gallery.proto`, so a live `RoomState.params` object can be handed to
 * the generator and the renderer without any mapping layer.
 */
export interface WallParams {
  /** Frames per tile. */
  count: number;
  marginMin: number;
  marginMax: number;
  gap: number;
  safeTop: number;
  safeBottom: number;
  maxFrameHeight: number;
  minFrameHeight: number;
  verticalJitter: number;
  zMin: number;
  zMax: number;
  tiltRange: number;
  railScaleMin: number;
  railScaleMax: number;
  sheenMin: number;
  sheenMax: number;
  grainJitterRange: number;
  shadowXBase: number;
  shadowXRandom: number;
  shadowYBase: number;
  shadowYDepth: number;
  shadowYRandom: number;
  shadowBlurBase: number;
  shadowBlurDepth: number;
  shadowBlurRandom: number;
  shadowSpreadBase: number;
  shadowSpreadRandom: number;
  shadowAlphaBase: number;
  shadowAlphaRandom: number;
  highlightBase: number;
  highlightRandom: number;
}

/** Tuned defaults (not proto zero defaults). */
export const DEFAULT_WALL_PARAMS: WallParams = {
  count: 4,
  marginMin: 2.6,
  marginMax: 3.2,
  gap: 8,
  safeTop: 3.5,
  safeBottom: 96,
  maxFrameHeight: 84,
  minFrameHeight: 32,
  verticalJitter: 3,
  zMin: 8,
  zMax: 84,
  tiltRange: 0.6,
  railScaleMin: 0.85,
  railScaleMax: 1.4,
  sheenMin: 0.7,
  sheenMax: 1.2,
  grainJitterRange: 6,
  shadowXBase: 0.035,
  shadowXRandom: 0.02,
  shadowYBase: 0.045,
  shadowYDepth: 0.05,
  shadowYRandom: 0.02,
  shadowBlurBase: 0.16,
  shadowBlurDepth: 0.1,
  shadowBlurRandom: 0.05,
  shadowSpreadBase: 0.025,
  shadowSpreadRandom: 0.008,
  shadowAlphaBase: 0.14,
  shadowAlphaRandom: 0.05,
  highlightBase: 0.09,
  highlightRandom: 0.07,
};
