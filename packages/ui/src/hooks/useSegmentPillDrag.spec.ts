import { describe, expect, test } from '@rstest/core';
import { weightedOffset, type SegmentPillFeel } from './useSegmentPillDrag';

const slots = [
  { left: 0, width: 100 },
  { left: 100, width: 100 },
  { left: 200, width: 100 },
];

const compact: SegmentPillFeel = {
  slotRadius: 14,
  deadZone: 3,
  breakaway: 10,
  magnetStrength: 0.2,
};

describe('weightedOffset', () => {
  test('default feel keeps the pill damped inside the 36px radius', () => {
    expect(weightedOffset(20, 50, 0, slots)).toBeLessThan(20);
  });

  test('compact feel tracks 1:1 once past its smaller radius', () => {
    // pointerX 70 is 20px from the slot centre, outside the 14px compact radius.
    expect(weightedOffset(20, 70, 0, slots, compact)).toBeCloseTo(20, 5);
  });

  test('compact feel still starts heavy just off the seat', () => {
    const value = weightedOffset(5, 50, 0, slots, compact);
    expect(value).toBeGreaterThan(0);
    expect(value).toBeLessThan(5);
  });

  test('hard-clamps at the end slots for every feel', () => {
    expect(weightedOffset(300, 300, 0, slots, compact)).toBe(200);
    expect(weightedOffset(-40, -40, 0, slots, compact)).toBe(0);
  });
});
