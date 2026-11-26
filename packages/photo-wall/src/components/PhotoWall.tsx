import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { solveFrameGeometry } from '../geometry';
import { frameVars } from '../frame-vars';
import {
  computeFrameLightingMulti,
  computeWallGlows,
  formatFrameShadow,
  formatWallGlow,
  DEFAULT_LIGHT,
  type VirtualLight,
} from '../light';
import {
  createWallTiles,
  wrapImages,
  type FrameKind,
  type WallTile,
} from '../tiles';
import { DEFAULT_WALL_PARAMS, type WallParams } from '../params';
import styles from './PhotoWall.module.css';
import { WallImageSlot } from './WallImageSlot';

/** Fallback frames per tile for malformed tile data. */
const DEFAULT_FRAMES_PER_TILE = 4;

const FRAME_CLASS: Record<FrameKind, string> = {
  black: styles.frameBlack,
  walnut: styles.frameWalnut,
  oak: styles.frameOak,
  gold: styles.frameGold,
  cherry: styles.frameCherry,
  ash: styles.frameAsh,
};

/** Minimal photo shape needed by the wall; wider app models are assignable. */
export interface WallImage {
  id?: string;
  src: string;
  width?: number;
  height?: number;
}

/** Props controlling the endless Photo Wall's photos, tiles, tuning, playback and lighting. */
export interface PhotoWallProps {
  /** Photo pool. One group of four is used per tile. */
  images: WallImage[];
  /** Pre-generated tiles (e.g. restored from storage). Generated from `seed` when omitted. */
  tiles?: WallTile[];
  params?: WallParams;
  seed?: number;
  /** Playback speed multiplier for the pan. */
  speed?: number;
  playing?: boolean;
  /** Measured viewport aspect (width / height). Auto-measured when omitted. */
  viewportAspect?: number;
  /** Known ratios keyed by src, for photos without stored dimensions. */
  imageRatios?: Map<string, number>;
  /** Virtual ceiling light. Defaults to a broad warm spot above the wall. */
  light?: VirtualLight;
  /** Several lights; each contributes its own shadow layer. Overrides `light`. */
  lights?: VirtualLight[];
  className?: string;
}

/**
 * The endless Photo Wall: framed prints on a wall, gliding left to right.
 *
 * Photos are fixed on a long strip of distinct tiles; the camera dollies
 * across a mirrored copy of the strip so the -50% wrap is seamless. Nothing on
 * the strip is swapped mid-pan, so the scrolling never flickers.
 */
export function PhotoWall({
  images,
  tiles: tilesProp,
  params,
  seed,
  speed = 1,
  playing = true,
  viewportAspect,
  imageRatios,
  light = DEFAULT_LIGHT,
  lights,
  className,
}: PhotoWallProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [measuredAspect, setMeasuredAspect] = useState(16 / 9);

  useEffect(() => {
    const measure = () => {
      const el = rootRef.current;
      if (el && el.clientHeight > 0) setMeasuredAspect(el.clientWidth / el.clientHeight);
      else if (window.innerHeight > 0) setMeasuredAspect(window.innerWidth / window.innerHeight);
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (rootRef.current) observer.observe(rootRef.current);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const activeParams = params ?? DEFAULT_WALL_PARAMS;
  const activeSeed = seed ?? 1;
  const generated = useMemo(
    () => createWallTiles(activeSeed >>> 0, activeParams),
    [activeSeed, activeParams],
  );
  const tiles = tilesProp && tilesProp.length > 0 ? tilesProp : generated;
  const framesPerTile = tiles[0]?.frames.length || DEFAULT_FRAMES_PER_TILE;
  const photos = wrapImages(images, 0, tiles.length * framesPerTile);
  const passCount = tiles.length * 2;
  const aspect = viewportAspect && viewportAspect > 0 ? viewportAspect : measuredAspect;
  const activeLights = lights && lights.length > 0 ? lights : [light];
  const glowStyle = {
    backgroundImage: formatWallGlow(computeWallGlows(activeLights)),
  } as CSSProperties;

  const rootStyle = {
    '--pass-count': passCount,
    '--pass-w': `${100 / passCount}%`,
    // Pan duration scales with strip length so the per-tile glide speed stays
    // constant, and is inversely proportional to the playback speed.
    '--pan-duration': `${((180 * (tiles.length / 2)) / (speed > 0 ? speed : 1)).toFixed(2)}s`,
    '--pan-play-state': playing ? 'running' : 'paused',
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className={className ? `${styles.scene} ${className}` : styles.scene}
      style={rootStyle}
    >
      <div className={styles.room}>
        <div className={styles.camera}>
          {Array.from({ length: passCount }, (_, pass) => {
            const tileIndex = pass % tiles.length;
            const tile = tiles[tileIndex];
            const picked = photos.slice(
              tileIndex * framesPerTile,
              (tileIndex + 1) * framesPerTile,
            );
            return (
              <div
                key={pass}
                className={styles.pass}
                style={{ left: `calc(${pass} * var(--pass-w))` }}
              >
                {tile.frames.map((frame, position) => {
                  const image = picked[position];
                  const storedRatio =
                    image && image.width && image.height
                      ? image.width / image.height
                      : undefined;
                  const imageRatio = storedRatio ?? imageRatios?.get(image?.src ?? '');
                  const geo = solveFrameGeometry({
                    columnWidthPct: frame.w,
                    imageRatio,
                    layoutRatio: frame.ratio,
                    viewportAspect: aspect,
                    safeTop: activeParams.safeTop,
                    safeBottom: activeParams.safeBottom,
                    jitter: activeParams.verticalJitter,
                    maxFrameHeight: activeParams.maxFrameHeight,
                    minFrameHeight: activeParams.minFrameHeight,
                    high: position % 2 === 0,
                  });
                  const lighting = computeFrameLightingMulti({
                    frame,
                    geometry: geo,
                    lights: activeLights,
                    params: activeParams,
                    aspect,
                    jitter: tile.styles[position]?.lightJitter ?? 0.5,
                  });
                  return (
                    <div
                      key={position}
                      className={`${styles.frame} ${FRAME_CLASS[frame.frame]}`}
                      data-wall-frame=""
                      style={frameVars(
                        frame,
                        tile.styles[position],
                        geo,
                        formatFrameShadow(lighting.shadows),
                        lighting.highlight,
                      )}
                    >
                      <span className={`${styles.rail} ${styles.railTop}`} aria-hidden="true" />
                      <span className={`${styles.rail} ${styles.railRight}`} aria-hidden="true" />
                      <span className={`${styles.rail} ${styles.railBottom}`} aria-hidden="true" />
                      <span className={`${styles.rail} ${styles.railLeft}`} aria-hidden="true" />
                      <div className={styles.mat}>
                        <WallImageSlot src={image?.src ?? ''} className={styles.photo} />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div className={styles.light} style={glowStyle} aria-hidden="true" />
        <div className={styles.vignette} aria-hidden="true" />
      </div>
    </div>
  );
}
