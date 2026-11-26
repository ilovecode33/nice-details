import type { CSSProperties } from 'react';
import type { FrameGeometry } from './geometry';
import type { WallFrame, WallStyle } from './tiles';

/**
 * Map a solved frame, its generated style and lighting result to the CSS
 * custom properties (--x, --y, --w, --ratio, --z, --tilt, --wood, --mat-a,
 * --mat-b, --rail, --sheen, --grain-jitter, --light) plus `boxShadow`.
 */
export function frameVars(
  frame: WallFrame,
  style: WallStyle,
  geo: FrameGeometry,
  shadow: string,
  highlight: number,
): CSSProperties {
  return {
    '--x': `${frame.x}%`,
    '--y': `${geo.yPct}%`,
    '--w': `${geo.widthPct}%`,
    '--ratio': String(geo.ratio),
    '--z': `${frame.z}px`,
    '--tilt': `${frame.tilt ?? 0}deg`,
    '--wood': style.wood,
    '--mat-a': style.matTop,
    '--mat-b': style.matBottom,
    '--rail': `calc(clamp(10px, 1.5vw, 26px) * ${style.railScale.toFixed(2)})`,
    '--sheen': style.sheen.toFixed(2),
    '--grain-jitter': `${style.grainJitter}deg`,
    boxShadow: shadow,
    '--light': String(highlight),
  } as CSSProperties;
}
