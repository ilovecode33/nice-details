/**
 * Geometry solver for the endless Photo Wall.
 *
 * A frame's displayed height is `width / imageRatio`. The layout allocates
 * widths as a percentage of a tile (tile = 1.64 × viewport width), while the
 * safe band is in vh. Picking widths with a fixed ratio and swapping in the
 * real image ratio later made portrait images grow too tall and clip. This
 * pure solver derives width AND vertical anchor from the real image ratio and
 * the real viewport aspect, so every frame fits the safe band on any screen.
 *
 * Unit convention (matches the CSS stage):
 *   width is a percentage of the tile (0-100)
 *   heightVh = widthPct * TILE_VW * viewportAspect / ratio
 *   stageY%  = (screenVh + 32) / TILE_VW
 */

/** 1 tile = 1.64 × viewport width. */
export const TILE_VW = 1.64;

export interface FrameGeometryInput {
  /** Column width as a percentage of the tile (0-100), from the layout. */
  columnWidthPct: number;
  /** Real image aspect ratio (width / height); undefined until measured. */
  imageRatio: number | undefined;
  /** Fallback ratio used by the procedural layout before an image is measured. */
  layoutRatio: number;
  /** Viewport width / height. */
  viewportAspect: number;
  /** Vertical safe band in vh. */
  safeTop: number;
  safeBottom: number;
  /** Jitter (vh) on the anchor edge. */
  jitter: number;
  /** Max / min frame height in vh, from tunable params. */
  maxFrameHeight: number;
  minFrameHeight: number;
  /** High frames pin their top, low frames pin their bottom. */
  high: boolean;
}

export interface FrameGeometry {
  /** Final frame width as a percentage of the tile (CSS --w). */
  widthPct: number;
  /** Final top position as a percentage of the tile (CSS --y). */
  yPct: number;
  /** Ratio to render (real image ratio when known). */
  ratio: number;
}

/** Height in vh of a frame `widthPct` of a tile, given ratio + viewport aspect. */
export function frameHeightVh(
  widthPct: number,
  ratio: number,
  viewportAspect: number,
): number {
  return (widthPct * TILE_VW * viewportAspect) / ratio;
}

/** Convert a vh screen position into the stage-y percentage used by CSS. */
export function vhToStageY(vh: number): number {
  return (vh + 32) / TILE_VW;
}

/**
 * Solve a frame's width and vertical anchor from its real image ratio.
 *
 * Width = min(column width, width that makes the frame exactly fill the
 * allowed height band). That guarantees the frame never exceeds the safe band
 * vertically (no clipping) and never grows wider than its column (no overlap).
 * High frames pin their top to safeTop; low frames pin their bottom to
 * safeBottom, preserving the alternating arrangement that fills the screen.
 */
export function solveFrameGeometry(input: FrameGeometryInput): FrameGeometry {
  const ratio =
    input.imageRatio && input.imageRatio > 0 ? input.imageRatio : input.layoutRatio;
  const aspect = input.viewportAspect > 0 ? input.viewportAspect : 16 / 9;

  const band = Math.max(1, input.safeBottom - input.safeTop - input.jitter);
  const maxH = Math.min(band, input.maxFrameHeight);
  const minH = Math.min(maxH, input.minFrameHeight);

  const widthForMaxH = (maxH * ratio) / (TILE_VW * aspect);
  const widthForMinH = (minH * ratio) / (TILE_VW * aspect);

  let widthPct = Math.min(input.columnWidthPct, widthForMaxH);
  widthPct = Math.max(widthPct, Math.min(widthForMinH, widthForMaxH));

  const heightVh = frameHeightVh(widthPct, ratio, aspect);
  const topVh = input.high
    ? input.safeTop + input.jitter / 2
    : input.safeBottom - input.jitter / 2 - heightVh;

  return {
    widthPct,
    yPct: vhToStageY(topVh),
    ratio,
  };
}
