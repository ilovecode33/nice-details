import { describe, expect, it } from '@rstest/core';
import {
  createSeededRandom,
  createWallTiles,
  wrapImages,
  type WallTile,
} from '../tiles';
import { DEFAULT_WALL_PARAMS } from '../params';

describe('createSeededRandom', () => {
  it('reproduces the same sequence for the same seed', () => {
    const a = createSeededRandom(42);
    const b = createSeededRandom(42);
    const seqA = Array.from({ length: 8 }, () => a());
    const seqB = Array.from({ length: 8 }, () => b());
    expect(seqA).toEqual(seqB);
    expect(new Set(seqA).size).toBe(8);
  });

  it('produces a different sequence for a different seed', () => {
    expect(createSeededRandom(1)()).not.toBe(createSeededRandom(2)());
  });
});

describe('createWallTiles', () => {
  const tiles = createWallTiles(1234);

  it('returns two contrasting tiles with the configured frame count', () => {
    expect(tiles).toHaveLength(2);
    for (const tile of tiles) {
      expect(tile.frames).toHaveLength(DEFAULT_WALL_PARAMS.count);
      expect(tile.styles).toHaveLength(DEFAULT_WALL_PARAMS.count);
    }
  });

  it('is deterministic for a given seed', () => {
    expect(createWallTiles(1234)).toEqual(tiles);
    expect(createWallTiles(999)).not.toEqual(tiles);
  });

  it('never puts the same frame kind in adjacent columns', () => {
    for (const tile of tiles) {
      for (let i = 1; i < tile.frames.length; i += 1) {
        expect(tile.frames[i].frame).not.toBe(tile.frames[i - 1].frame);
      }
    }
  });

  it('lays columns out left-to-right without overlaps', () => {
    for (const tile of tiles) {
      const last = tile.frames[tile.frames.length - 1];
      expect(last.x + last.w).toBeLessThanOrEqual(100);
      for (let i = 1; i < tile.frames.length; i += 1) {
        expect(tile.frames[i].x).toBeGreaterThan(
          tile.frames[i - 1].x + tile.frames[i - 1].w,
        );
      }
    }
  });

  it('keeps the aesthetic style values within the tunable ranges', () => {
    for (const tile of tiles) {
      for (const style of tile.styles) {
        expect(style.railScale).toBeGreaterThanOrEqual(DEFAULT_WALL_PARAMS.railScaleMin);
        expect(style.railScale).toBeLessThanOrEqual(DEFAULT_WALL_PARAMS.railScaleMax);
        expect(style.sheen).toBeGreaterThanOrEqual(DEFAULT_WALL_PARAMS.sheenMin);
        expect(style.sheen).toBeLessThanOrEqual(DEFAULT_WALL_PARAMS.sheenMax);
        expect(style.lightJitter).toBeGreaterThanOrEqual(0);
        expect(style.lightJitter).toBeLessThanOrEqual(1);
      }
    }
  });

  it('honours a custom frame count', () => {
    const custom = createWallTiles(7, { ...DEFAULT_WALL_PARAMS, count: 6 });
    expect(custom[0].frames).toHaveLength(6);
  });

  it('handles an empty photo pool in wrapImages', () => {
    expect(wrapImages<string>([], 0, 4)).toEqual([]);
    expect(wrapImages(['a', 'b'], 0, 5)).toEqual(['a', 'b', 'a', 'b', 'a']);
  });

  it('exposes all generated frame kinds as valid types', () => {
    const kinds = new Set(tiles.flatMap((tile: WallTile) => tile.frames.map((f) => f.frame)));
    for (const kind of kinds) {
      expect(['black', 'walnut', 'oak', 'gold', 'cherry', 'ash']).toContain(kind);
    }
  });
});
