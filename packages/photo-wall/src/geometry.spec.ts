import { describe, expect, it } from '@rstest/core';
import {
  solveFrameGeometry,
  frameHeightVh,
  vhToStageY,
  type FrameGeometryInput,
} from './geometry';

const base: FrameGeometryInput = {
  columnWidthPct: 24,
  imageRatio: 1.5,
  layoutRatio: 1.4,
  viewportAspect: 16 / 9,
  safeTop: 3.5,
  safeBottom: 96,
  jitter: 3,
  maxFrameHeight: 84,
  minFrameHeight: 32,
  high: true,
};

describe('solveFrameGeometry', () => {
  it('fits every ratio and viewport aspect inside the safe band', () => {
    for (const ratio of [0.5, 0.6, 0.72, 0.85, 1.0, 1.5, 2.0]) {
      for (const aspect of [16 / 9, 21 / 9, 4 / 3, 1.0]) {
        const geo = solveFrameGeometry({
          ...base,
          imageRatio: ratio,
          viewportAspect: aspect,
          high: false,
        });
        const h = frameHeightVh(geo.widthPct, geo.ratio, aspect);
        expect(h).toBeLessThanOrEqual(96 - 3.5 + 0.01);

        const topVh = geo.yPct * 1.64 - 32;
        expect(topVh + h).toBeLessThanOrEqual(96 + 0.01);
      }
    }
  });

  it('never widens a frame beyond its allocated column', () => {
    const narrow = solveFrameGeometry({ ...base, imageRatio: 0.5 });
    expect(narrow.widthPct).toBeLessThanOrEqual(base.columnWidthPct + 0.01);
  });

  it('uses the real image ratio, not the layout fallback', () => {
    expect(solveFrameGeometry({ ...base, imageRatio: 0.5 }).ratio).toBe(0.5);
    expect(solveFrameGeometry({ ...base, imageRatio: undefined }).ratio).toBe(
      base.layoutRatio,
    );
  });

  it('pins high frames to the top and low frames to the bottom', () => {
    const high = solveFrameGeometry({ ...base, high: true });
    const low = solveFrameGeometry({ ...base, high: false });
    expect(Math.abs(high.yPct * 1.64 - 32 - 3.5)).toBeLessThan(2);

    const lowH = frameHeightVh(low.widthPct, low.ratio, base.viewportAspect);
    expect(Math.abs(low.yPct * 1.64 - 32 + lowH - 96)).toBeLessThan(2);
  });

  it('falls back to 16:9 for an invalid aspect', () => {
    const geo = solveFrameGeometry({ ...base, viewportAspect: 0 });
    expect(frameHeightVh(geo.widthPct, geo.ratio, 16 / 9)).toBeGreaterThan(0);
  });
});

describe('unit conversion', () => {
  it('maps vh to stage-y percentage', () => {
    expect(vhToStageY(3.5)).toBeCloseTo(21.65, 1);
  });
});
