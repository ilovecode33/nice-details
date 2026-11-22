import { describe, expect, test } from '@rstest/core';
import {
  deformReducer,
  floatingReducer,
  resist,
  toggleReducer,
} from '@ilovecode33/ui-core';

describe('resist', () => {
  test('never exceeds the resistance limit', () => {
    expect(resist(10_000, 8)).toBeLessThan(8);
    expect(resist(-10_000, 8)).toBeGreaterThan(-8);
  });

  test('gets harder the farther the pointer travels', () => {
    const near = Math.abs(resist(40, 18));
    const far = Math.abs(resist(400, 18));
    const farther = Math.abs(resist(4000, 18));
    expect(far).toBeGreaterThan(near);
    expect(farther).toBeGreaterThan(far);
    // A 10× pull must not produce a 10× offset: the curve is sublinear.
    expect(far / near).toBeLessThan(10);
  });

  test('is symmetric and collapses to zero at the origin', () => {
    expect(resist(0, 8)).toBe(0);
    expect(resist(-120, 8)).toBe(-resist(120, 8));
  });

  test('a non-positive limit disables movement', () => {
    expect(resist(500, 0)).toBe(0);
    expect(resist(500, -4)).toBe(0);
  });
});

describe('deformReducer', () => {
  test('starts from rest and reports an active drag', () => {
    const state = deformReducer(
      {
        active: false,
        dx: 0,
        dy: 0,
        rawX: 0,
        rawY: 0,
        intensityX: 0,
        intensityY: 0,
        progress: 0,
      },
      { type: 'start' },
    );
    expect(state.active).toBe(true);
  });

  test('resists the raw pointer delta on the drag axis', () => {
    const state = deformReducer(
      { active: true, dx: 0, dy: 0, rawX: 0, rawY: 0, intensityX: 0, intensityY: 0, progress: 0 },
      { type: 'move', dx: 300, dy: 0, max: 18, axis: 'x' },
    );
    expect(state.rawX).toBe(300);
    expect(state.dx).toBeCloseTo(resist(300, 18));
    expect(state.dy).toBe(0);
    expect(state.intensityY).toBe(0);
    expect(state.intensityX).toBeGreaterThan(0);
    expect(state.intensityX).toBeLessThan(1);
  });

  test('locks the perpendicular axis', () => {
    const state = deformReducer(
      { active: true, dx: 0, dy: 0, rawX: 0, rawY: 0, intensityX: 0, intensityY: 0, progress: 0 },
      { type: 'move', dx: 40, dy: 90, max: 18, axis: 'y' },
    );
    expect(state.rawX).toBe(0);
    expect(state.dx).toBe(0);
    expect(state.rawY).toBe(90);
    expect(state.dy).not.toBe(0);
  });

  test('progress saturates at 1', () => {
    const state = deformReducer(
      { active: true, dx: 0, dy: 0, rawX: 0, rawY: 0, intensityX: 0, intensityY: 0, progress: 0 },
      { type: 'move', dx: 10_000, dy: 10_000, max: 18 },
    );
    expect(state.progress).toBe(1);
  });

  test('end returns every field to rest', () => {
    const state = deformReducer(
      { active: true, dx: 4, dy: 5, rawX: 40, rawY: 50, intensityX: 0.2, intensityY: 0.3, progress: 0.4 },
      { type: 'end' },
    );
    expect(state).toEqual({
      active: false,
      dx: 0,
      dy: 0,
      rawX: 0,
      rawY: 0,
      intensityX: 0,
      intensityY: 0,
      progress: 0,
    });
  });
});

describe('floatingReducer', () => {
  const base = { collapsed: false, hidden: false };

  test('toggle flips only the collapsed flag', () => {
    expect(floatingReducer(base, { type: 'toggleCollapse' })).toEqual({
      collapsed: true,
      hidden: false,
    });
    expect(floatingReducer({ ...base, collapsed: true }, { type: 'toggleCollapse' })).toEqual(
      base,
    );
  });

  test('collapse and expand are idempotent', () => {
    expect(floatingReducer(base, { type: 'collapse' })).toEqual({ collapsed: true, hidden: false });
    expect(floatingReducer({ ...base, collapsed: true }, { type: 'collapse' })).toEqual({
      collapsed: true,
      hidden: false,
    });
    expect(floatingReducer(base, { type: 'expand' })).toEqual(base);
  });

  test('hide and show keep the collapsed state', () => {
    const hidden = floatingReducer({ ...base, collapsed: true }, { type: 'hide' });
    expect(hidden).toEqual({ collapsed: true, hidden: true });
    expect(floatingReducer(hidden, { type: 'show' })).toEqual({ collapsed: true, hidden: false });
  });
});

describe('toggleReducer', () => {
  test('flips checked', () => {
    expect(toggleReducer({ checked: false }, { type: 'toggle' })).toEqual({ checked: true });
    expect(toggleReducer({ checked: true }, { type: 'toggle' })).toEqual({ checked: false });
  });
});
