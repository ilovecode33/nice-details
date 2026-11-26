import { describe, expect, it } from '@rstest/core';
import {
  computeFrameLighting,
  computeFrameLightingMulti,
  computeWallGlow,
  computeWallGlows,
  DEFAULT_LIGHT,
  type FrameLightingInput,
  type MultiFrameLightingInput,
  type VirtualLight,
} from './light';
import { DEFAULT_WALL_PARAMS } from './params';
import type { FrameGeometry } from './geometry';
import type { WallFrame } from './tiles';

const frame = (over: Partial<WallFrame> = {}): WallFrame => ({
  x: 25,
  y: 30,
  w: 20,
  ratio: 1.4,
  frame: 'oak',
  z: 40,
  tilt: 0,
  ...over,
});

const geometry = (over: Partial<FrameGeometry> = {}): FrameGeometry => ({
  widthPct: 20,
  yPct: 30,
  ratio: 1.4,
  ...over,
});

const input = (over: Partial<FrameLightingInput> = {}): FrameLightingInput => ({
  frame: frame(),
  geometry: geometry(),
  params: DEFAULT_WALL_PARAMS,
  aspect: 16 / 9,
  jitter: 0.5,
  ...over,
});

const multiInput = (
  over: Partial<MultiFrameLightingInput> = {},
): MultiFrameLightingInput => ({ ...input(), ...over });

const lightAt = (over: Partial<VirtualLight> = {}): VirtualLight => ({
  ...DEFAULT_LIGHT,
  ...over,
});

describe('pinhole shadow projection', () => {
  it('throws the shadow away from the light', () => {
    const right = computeFrameLighting(input({ light: lightAt({ x: 80 }) }));
    const left = computeFrameLighting(input({ light: lightAt({ x: 20 }) }));
    expect(right.shadowX).toBeLessThan(0);
    expect(left.shadowX).toBeGreaterThan(0);
  });

  it('throws the shadow downwards from a ceiling light', () => {
    const result = computeFrameLighting(input());
    expect(result.shadowY).toBeGreaterThan(0);
  });

  it('uses the exact similar-triangles throw factor', () => {
    const z = 48;
    const result = computeFrameLighting(input({ frame: frame({ z }) }));
    expect(result.throwFactor).toBeCloseTo(z / (DEFAULT_LIGHT.z - z), 6);
  });

  it('lengthens and softens the shadow as the frame moves away from the wall', () => {
    const near = computeFrameLighting(input({ frame: frame({ z: 8 }) }));
    const far = computeFrameLighting(input({ frame: frame({ z: 80 }) }));
    expect(Math.abs(far.shadowX)).toBeGreaterThan(Math.abs(near.shadowX));
    expect(far.shadowBlur).toBeGreaterThan(near.shadowBlur);
    expect(far.shadowSpread).toBeGreaterThan(near.shadowSpread);
  });

  it('uses the solved geometry, not the procedural fallback, for the frame centre', () => {
    const narrow = computeFrameLighting(input({ geometry: geometry({ widthPct: 10 }) }));
    const wide = computeFrameLighting(input({ geometry: geometry({ widthPct: 30 }) }));
    expect(wide.shadowX).not.toBe(narrow.shadowX);
  });

  it('converts vertical throw with the viewport aspect', () => {
    const wide = computeFrameLighting(input({ aspect: 21 / 9 }));
    const square = computeFrameLighting(input({ aspect: 1 }));
    expect(wide.shadowY).toBeLessThan(square.shadowY);
  });
});

describe('light falloff and highlight', () => {
  it('dims shadows further from the light axis', () => {
    const under = computeFrameLighting(input({ frame: frame({ x: 48 }) }));
    const edge = computeFrameLighting(input({ frame: frame({ x: 2 }) }));
    expect(under.shadowAlpha).toBeGreaterThan(edge.shadowAlpha);
    expect(under.distance).toBeLessThan(edge.distance);
  });

  it('scales strength with light intensity but clamps it', () => {
    const dim = computeFrameLighting(input({ light: lightAt({ intensity: 0.4 }) }));
    const normal = computeFrameLighting(input());
    const blown = computeFrameLighting(input({ light: lightAt({ intensity: 20 }) }));
    expect(normal.shadowAlpha).toBeGreaterThan(dim.shadowAlpha);
    expect(normal.highlight).toBeGreaterThan(dim.highlight);
    expect(blown.shadowAlpha).toBeLessThanOrEqual(0.6);
    expect(blown.highlight).toBeLessThanOrEqual(0.4);
  });

  it('brightens the bevel of frames facing the light', () => {
    const centred = computeFrameLighting(input({ frame: frame({ x: 48 }) }));
    const offAxis = computeFrameLighting(input({ frame: frame({ x: 2 }) }));
    expect(centred.highlight).toBeGreaterThan(offAxis.highlight);
  });

  it('keeps a small stable variation without changing the shadow direction', () => {
    const low = computeFrameLighting(input({ jitter: 0 }));
    const high = computeFrameLighting(input({ jitter: 1 }));
    expect(high.shadowX).toBe(low.shadowX);
    expect(high.shadowAlpha).toBeGreaterThan(low.shadowAlpha);
  });

  it('stays finite for a light behind a frame', () => {
    const result = computeFrameLighting(input({ light: lightAt({ z: 10 }) }));
    for (const value of Object.values(result)) {
      expect(Number.isFinite(value)).toBe(true);
    }
    expect(result.throwFactor).toBeLessThanOrEqual(2.5);
  });
});

describe('existing shadow tuning knobs', () => {
  it('does not change the geometry at default params', () => {
    const result = computeFrameLighting(input());
    const centerX = frame().x + geometry().widthPct / 2;
    expect(result.shadowX).toBeCloseTo(
      result.throwFactor * (centerX - DEFAULT_LIGHT.x) * 1.64,
      6,
    );
  });

  it('still scales the result when the console sliders change', () => {
    const base = computeFrameLighting(input());
    const tuned = computeFrameLighting(
      input({
        params: {
          ...DEFAULT_WALL_PARAMS,
          shadowXBase: DEFAULT_WALL_PARAMS.shadowXBase * 2,
          shadowBlurBase: DEFAULT_WALL_PARAMS.shadowBlurBase * 1.5,
        },
      }),
    );
    expect(Math.abs(tuned.shadowX)).toBeGreaterThan(Math.abs(base.shadowX));
    expect(tuned.shadowBlur).toBeGreaterThan(base.shadowBlur);
  });
});

describe('multiple lights', () => {
  const lights: VirtualLight[] = [
    lightAt({ x: 20, y: 10 }),
    lightAt({ x: 50, y: 20, intensity: 0.6 }),
    lightAt({ x: 80, y: 8, intensity: 0.4 }),
  ];

  it('produces one independent shadow layer per light, in input order', () => {
    const result = computeFrameLightingMulti(multiInput({ lights }));
    expect(result.shadows).toHaveLength(3);
    expect(result.shadows[0].shadowX).toBe(
      computeFrameLighting(input({ light: lights[0] })).shadowX,
    );
    expect(result.shadows[2].shadowX).toBe(
      computeFrameLighting(input({ light: lights[2] })).shadowX,
    );
  });

  it('saturates the combined bevel highlight instead of exceeding it', () => {
    const result = computeFrameLightingMulti(
      multiInput({ lights: lights.map((light) => ({ ...light, intensity: 20 })) }),
    );
    expect(result.highlight).toBeLessThanOrEqual(0.4);
  });

  it('adds bevel contributions from every light', () => {
    const one = computeFrameLightingMulti(multiInput({ lights: [lights[0]] }));
    const three = computeFrameLightingMulti(multiInput({ lights }));
    expect(three.highlight).toBeGreaterThan(one.highlight);
  });

  it('falls back to the default spot for an empty light list', () => {
    const result = computeFrameLightingMulti(multiInput({ lights: [] }));
    expect(result.shadows).toHaveLength(1);
    expect(result.shadows[0].shadowX).toBe(
      computeFrameLighting(input({ light: DEFAULT_LIGHT })).shadowX,
    );
  });

  it('maps one wall glow per light and keeps each tint', () => {
    const tinted = lights.map((light, index) => ({
      ...light,
      glowColor: `10, 20, ${30 + index}`,
    }));
    const glows = computeWallGlows(tinted);
    expect(glows).toHaveLength(3);
    expect(glows.map((glow) => glow.color)).toEqual([
      '10, 20, 30',
      '10, 20, 31',
      '10, 20, 32',
    ]);
    expect(computeWallGlows()).toEqual([computeWallGlow(DEFAULT_LIGHT)]);
  });
});

describe('wall glow', () => {
  it('maps a centred tile to the centre of the screen', () => {
    const glow = computeWallGlow(DEFAULT_LIGHT);
    expect(glow.xPct).toBeCloseTo(1.64 * 50 - 32, 6);
    expect(glow.yPct).toBe(DEFAULT_LIGHT.y);
    expect(glow.sizeCqw).toBeGreaterThan(0);
    expect(glow.alpha).toBeGreaterThan(0);
  });

  it('follows the light without a light argument', () => {
    expect(computeWallGlow()).toEqual(computeWallGlow(DEFAULT_LIGHT));
  });
});
