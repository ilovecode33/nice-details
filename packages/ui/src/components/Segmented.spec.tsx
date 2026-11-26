import { afterEach, beforeEach, describe, expect, test } from '@rstest/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { Segmented } from './Segmented';
import { expectComponentSnapshot } from '../test-utils/snapshot';

const snapNoop = () => {};
const snapSegments = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
];

/** Expected values for a 140px pointer delta (Day at x=10 → x=150). */
const DEFORM_DX_140 = 1.2989690721649485; // resist(140, 18)
const DAMPED_140 = 128.33333333333334; // 100 + 40 * (34/36) * 0.75
const SHIFT_140 = DAMPED_140 - DEFORM_DX_140; // 127.034364...

function SegmentedDemo() {
  const [value, setValue] = useState<'day' | 'week' | 'month'>('day');
  return (
    <Segmented
      label="Range"
      value={value}
      onChange={setValue}
      options={[
        { value: 'day', label: 'Day' },
        { value: 'week', label: 'Week' },
        { value: 'month', label: 'Month' },
      ]}
    />
  );
}

describe('Segmented', () => {
  /** Outer pill; the prefix also matches the compound drag/settle data-ui values. */
  const getThumb = (track: HTMLElement) =>
    track.querySelector('[data-ui^="segmented__thumb"]') as HTMLElement;

  /** The single persistent layer carrying the damped visual offset. */
  const getShift = (thumb: HTMLElement) =>
    thumb.querySelector('[data-ui="segmented__thumb-shift"]') as HTMLElement;

  /** Reads the leading translateX (px) from an inline transform, defaulting to 0. */
  const translateX = (element: HTMLElement) => {
    const match = /^translate(?:3d|X)?\(\s*(-?[\d.]+)px/.exec(element.style.transform);
    return match ? Number(match[1]) : 0;
  };

  /** Seat + outer deform translate + inner shift = the pill's visual position. */
  const netPosition = (track: HTMLElement) => {
    const thumb = getThumb(track);
    return parseFloat(thumb.style.left) + translateX(thumb) + translateX(getShift(thumb));
  };

  const press = (element: Element, clientX: number) =>
    fireEvent.pointerDown(element, {
      clientX,
      clientY: 20,
      pointerType: 'mouse',
      button: 0,
      buttons: 1,
    });
  const move = (element: Element, clientX: number) =>
    fireEvent.pointerMove(element, {
      clientX,
      clientY: 20,
      pointerType: 'mouse',
      button: 0,
      buttons: 1,
    });
  const release = (element: Element, clientX: number) =>
    fireEvent.pointerUp(element, {
      clientX,
      clientY: 20,
      pointerType: 'mouse',
      button: 0,
      buttons: 1,
    });

  test('marks the current item selected and updates on click', () => {
    render(<SegmentedDemo />);
    const day = screen.getByRole('tab', { name: 'Day' });
    const week = screen.getByRole('tab', { name: 'Week' });

    expect(day).toHaveAttribute('aria-selected', 'true');
    expect(week).toHaveAttribute('aria-selected', 'false');

    fireEvent.click(week);
    expect(week).toHaveAttribute('aria-selected', 'true');
    expect(day).toHaveAttribute('aria-selected', 'false');
  });

  test('moves selection with arrow keys and keeps one tab stop', () => {
    render(<SegmentedDemo />);
    const day = screen.getByRole('tab', { name: 'Day' });
    const week = screen.getByRole('tab', { name: 'Week' });
    const month = screen.getByRole('tab', { name: 'Month' });

    fireEvent.keyDown(day, { key: 'ArrowRight' });
    expect(week).toHaveAttribute('aria-selected', 'true');
    expect(week).toHaveAttribute('tabindex', '0');
    expect(day).toHaveAttribute('tabindex', '-1');

    fireEvent.keyDown(week, { key: 'End' });
    expect(month).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(month, { key: 'Home' });
    expect(day).toHaveAttribute('aria-selected', 'true');
  });

  const rect = (left: number) =>
    ({
      left,
      top: 0,
      width: 100,
      height: 44,
      right: left + 100,
      bottom: 44,
      x: left,
      y: 0,
      toJSON: () => ({}),
    }) as DOMRect;

  let restoreGeometry: () => void;
  beforeEach(() => {
    // Patch before render: the pill is measured in a layout effect on mount.
    const original = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function () {
      const element = this as HTMLElement;
      if (element.getAttribute('role') === 'tablist') return rect(0);
      const index = Number(element.dataset?.index);
      return rect(Number.isInteger(index) && index >= 0 ? index * 100 : 0);
    };
    restoreGeometry = () => {
      Element.prototype.getBoundingClientRect = original;
    };
  });
  afterEach(() => restoreGeometry());

  function withGeometry() {
    const track = screen.getByRole('tablist', { name: 'Range' });
    const tabs = ['Day', 'Week', 'Month'].map((name) => screen.getByRole('tab', { name }));
    return { track, day: tabs[0], week: tabs[1], month: tabs[2] };
  }

  /** Runs a test with `prefers-reduced-motion: reduce` reported as matching. */
  async function withReducedMotion(run: () => void | Promise<void>) {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) =>
      query === '(prefers-reduced-motion: reduce)'
        ? ({
            matches: true,
            media: query,
            onchange: null,
            addEventListener: () => {},
            removeEventListener: () => {},
            addListener: () => {},
            removeListener: () => {},
            dispatchEvent: () => false,
          }) as unknown as MediaQueryList
        : original.call(window, query)) as typeof window.matchMedia;
    try {
      await run();
    } finally {
      window.matchMedia = original;
    }
  }

  /** Presses Day at x=10, drags to Week, releases, and returns the thumb. */
  function dragDayToWeek() {
    const { day, track } = withGeometry();
    press(day, 10);
    move(day, 150);
    release(day, 150);
    return getThumb(track);
  }

  test('moves the selected pill to the active option with a slide transition', () => {
    render(<SegmentedDemo />);
    const { track, week } = withGeometry();
    const thumb = getThumb(track);

    expect(thumb.style.transition).toContain('left var(--dur)');
    fireEvent.click(week);
    expect(thumb.style.left).toBe('100px');
    expect(thumb.style.width).toBe('100px');
    expect(week).toHaveAttribute('data-active', 'true');
  });

  test('highlights the pill only when the selected item is hovered', () => {
    render(<SegmentedDemo />);
    const { track, day, week } = withGeometry();
    const sheen = track.querySelector('[class*="ui-segmented__sheen"]') as HTMLElement;

    expect(sheen.className).not.toContain('is-hovered');
    fireEvent.pointerEnter(week);
    expect(sheen.className).not.toContain('is-hovered');
    fireEvent.pointerEnter(day);
    expect(sheen.className).toContain('is-hovered');
    fireEvent.pointerLeave(day);
    expect(sheen.className).not.toContain('is-hovered');
  });

  test('keeps the outer pill seated and deform-transformed throughout a drag', () => {
    render(<SegmentedDemo />);
    const { day, track } = withGeometry();
    press(day, 10);
    move(day, 150);

    const thumb = getThumb(track);
    expect(thumb.style.left).toBe('0px');
    expect(thumb.style.width).toBe('100px');
    expect(thumb.style.transition).toBe('none');
    expect(thumb.style.transform).toContain('translate3d(');
    expect(translateX(thumb)).toBeCloseTo(DEFORM_DX_140, 5);
    expect(thumb).toHaveAttribute('data-ui', 'segmented__thumb segmented__thumb--dragging');
    expect(getShift(thumb)).not.toBeNull();

    // Moving further never accumulates into the outer seat.
    move(day, 100);
    expect(thumb.style.left).toBe('0px');
    expect(thumb.style.width).toBe('100px');
  });

  test('barely moves for the first few pixels of a drag', () => {
    render(<SegmentedDemo />);
    // x=16 is a 6px raw delta: inside the dead zone, so the damped offset is 0
    // and the inner layer only cancels the outer deform translate.
    const { day, track } = withGeometry();
    press(day, 10);
    move(day, 16);
    const thumb = getThumb(track);

    expect(netPosition(track)).toBeCloseTo(0, 5);
    expect(translateX(getShift(thumb))).toBeCloseTo(-0.059800664, 5);
  });

  test('ramps the follow up across the 28px breakaway band', () => {
    render(<SegmentedDemo />);
    const { day, track } = withGeometry();
    press(day, 10);

    move(day, 16);
    const at6 = netPosition(track);
    move(day, 30);
    const at20 = netPosition(track);
    move(day, 38);
    const at28 = netPosition(track);

    expect(at6).toBeCloseTo(0, 5);
    expect(at20).toBeCloseTo(6.913580246, 5);
    expect(at28).toBeCloseTo(14.259259259, 5);
    // The effective follow climbs as the pointer breaks away, instead of
    // jumping straight to a 1:1 track (or staying pinned at zero).
    expect(at6 / 6).toBeLessThan(at20 / 20);
    expect(at20 / 20).toBeLessThan(at28 / 28);
  });

  test('tracks the pointer one-to-one once outside the slot radius', () => {
    render(<SegmentedDemo />);
    const { day, track } = withGeometry();
    press(day, 10);

    // At exactly the 36px radius the weighted curve hands off to raw tracking.
    move(day, 86);
    expect(netPosition(track)).toBeCloseTo(76, 5);
    // Midway between Day and Week (50px from either centre) the raw 90px wins.
    move(day, 100);
    expect(netPosition(track)).toBeCloseTo(90, 5);
  });

  test('keeps the pill highlighted after clicking a non-active slot', () => {
    render(<SegmentedDemo />);
    const { track, week } = withGeometry();
    const sheen = track.querySelector('[class*="ui-segmented__sheen"]') as HTMLElement;

    fireEvent.pointerEnter(week);
    fireEvent.click(week, { detail: 1 });
    // Even after the click bloom fades, the pointer is still over the now-active
    // slot, so the pill must stay lit instead of dropping back to rest.
    expect(sheen.className).toContain('is-hovered');
    expect(week).toHaveAttribute('aria-selected', 'true');
  });

  test('clicking another slot slides the pill without a delayed bloom', () => {
    render(<SegmentedDemo />);
    const { track, week } = withGeometry();
    const thumb = getThumb(track);
    const shift = getShift(thumb);
    const sheen = shift.querySelector('[class*="ui-segmented__sheen"]') as HTMLElement;
    const spot = shift.querySelector('[class*="ui-segmented__spot"]') as HTMLElement;

    fireEvent.pointerEnter(week);
    fireEvent.click(week);

    // No press bloom is left running after the click — the highlight comes
    // purely from the pointer resting on the now-active slot.
    expect(spot.className).not.toContain('is-held');
    expect(sheen.className).not.toContain('is-held');
    expect(sheen.className).toContain('is-hovered');
    expect(thumb.style.left).toBe('100px');
    expect(thumb.style.transition).toContain('left var(--dur)');
  });

  test('follows the pointer while dragging the pill and snaps on release', async () => {
    render(<SegmentedDemo />);
    const { day, week, track } = withGeometry();
    press(day, 10);
    expect(getThumb(track).style.transition).toBe('none');

    const thumb = getThumb(track);
    const shift = getShift(thumb);
    const spot = shift.querySelector('[class*="ui-segmented__spot"]') as HTMLElement;
    expect(spot).not.toBeNull();
    expect(spot.style.getPropertyValue('--seg-glow-x')).toBe('10%');
    expect(shift.querySelector('[class*="ui-segmented__sheen"]')?.className).toContain(
      'is-held',
    );

    move(day, 150);
    // The outer stays seated at Day and keeps only useDeform's small translate;
    // the inner shift carries the damped offset minus that translate.
    expect(thumb.style.left).toBe('0px');
    expect(translateX(thumb)).toBeCloseTo(DEFORM_DX_140, 5);
    expect(translateX(shift)).toBeCloseTo(SHIFT_140, 5);
    expect(netPosition(track)).toBeCloseTo(DAMPED_140, 5);
    expect(thumb).toHaveAttribute('data-ui', 'segmented__thumb segmented__thumb--dragging');
    expect(thumb.style.transition).toBe('none');
    expect(day).toHaveAttribute('aria-selected', 'true');

    release(day, 150);
    expect(week).toHaveAttribute('aria-selected', 'true');
    expect(translateX(shift)).toBe(0);
    expect(shift.style.transition).toContain('transform var(--spring-dur) var(--ease)');
    expect(shift.style.transition).not.toContain('--spring-ease');
    expect(thumb.style.left).toBe('100px');
    expect(thumb).toHaveAttribute('data-ui', 'segmented__thumb segmented__thumb--settling');
    expect(shift.querySelector('[class*="ui-segmented__sheen"]')?.className).not.toContain(
      'is-held',
    );
    expect(shift.querySelector('[class*="ui-segmented__spot"]')?.className).not.toContain(
      'is-held',
    );
    // useDeform removes its click-suppression guard on the next tick.
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  test('returns from the spring to the ordinary slide after the settle window', async () => {
    render(<SegmentedDemo />);
    const { week } = withGeometry();
    const thumb = dragDayToWeek();
    const shift = getShift(thumb);

    expect(thumb).toHaveAttribute('data-ui', 'segmented__thumb segmented__thumb--settling');
    expect(shift.style.transition).toContain('transform var(--spring-dur) var(--ease)');
    expect(shift.style.transition).not.toContain('--spring-ease');
    expect(translateX(shift)).toBe(0);
    expect(thumb.style.left).toBe('100px');
    expect(week).toHaveAttribute('aria-selected', 'true');

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 250));
    });

    expect(thumb).toHaveAttribute('data-ui', 'segmented__thumb');
    expect(thumb.style.transition).toContain('left var(--dur) var(--ease)');
    expect(thumb.style.left).toBe('100px');
    expect(shift.style.transition).not.toContain('--spring-dur');
  });

  test('does not accumulate the drag offset across repeated drags', async () => {
    render(<SegmentedDemo />);
    const { week, month, track } = withGeometry();
    dragDayToWeek();
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 250));
    });

    const thumb = getThumb(track);
    const shift = getShift(thumb);
    expect(thumb.style.left).toBe('100px');
    expect(translateX(shift)).toBe(0);
    expect(shift.style.transition).not.toContain('--spring-dur');

    // A fresh press cancels any leftover settle before the second drag.
    press(week, 110);
    expect(translateX(shift)).toBe(0);
    expect(shift.style.transition).not.toContain('--spring-dur');
    expect(thumb.style.left).toBe('100px');

    move(week, 250);
    // Seated at Week (left 100px), a 140px raw delta runs past the last slot's
    // relative edge (200 - 100 = 100px), so the offset hard-clamps to 100. The
    // outer keeps its seat and the inner carries 100 - deform, with no trace of
    // the first drag.
    expect(thumb.style.left).toBe('100px');
    expect(translateX(thumb)).toBeCloseTo(DEFORM_DX_140, 5);
    expect(translateX(shift)).toBeCloseTo(100 - DEFORM_DX_140, 5);
    expect(netPosition(track)).toBeCloseTo(200, 5);

    release(week, 250);
    // The pointer lands on Month, so selection changes and the pill settles
    // into its new seat even though the drag itself was clamped at the end.
    expect(month).toHaveAttribute('aria-selected', 'true');
    expect(thumb.style.left).toBe('200px');
    expect(thumb).toHaveAttribute('data-ui', 'segmented__thumb segmented__thumb--settling');
    expect(shift.style.transition).toContain('transform var(--spring-dur) var(--ease)');
    expect(translateX(shift)).toBe(0);
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  test('does not rebound when an end-clamped drag keeps the last slot selected', async () => {
    render(<SegmentedDemo />);
    const { month, track } = withGeometry();
    fireEvent.click(month);
    expect(month).toHaveAttribute('aria-selected', 'true');

    const thumb = getThumb(track);
    const shift = getShift(thumb);
    expect(thumb.style.left).toBe('200px');

    press(month, 210);
    // Seated at Month (left 200px), its own relative edge is 200 - 200 = 0, so
    // a positive raw delta hard-clamps to 0 and the inner layer only cancels
    // the outer deform translate.
    move(month, 350);
    expect(thumb.style.left).toBe('200px');
    expect(translateX(thumb)).toBeCloseTo(DEFORM_DX_140, 5);
    expect(translateX(shift)).toBeCloseTo(-DEFORM_DX_140, 5);
    expect(netPosition(track)).toBeCloseTo(200, 5);
    expect(thumb).toHaveAttribute('data-ui', 'segmented__thumb segmented__thumb--dragging');

    release(month, 350);
    // The pointer is still over Month, so selection does not change and the
    // clamped end has no stored excess: the settle is skipped entirely.
    expect(month).toHaveAttribute('aria-selected', 'true');
    expect(thumb.style.left).toBe('200px');
    expect(thumb).toHaveAttribute('data-ui', 'segmented__thumb');
    expect(shift.style.transition).toBe('none');
    expect(shift.style.transition).not.toContain('--spring-dur');
    expect(translateX(shift)).toBe(0);
    expect(netPosition(track)).toBeCloseTo(200, 5);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 250));
    });
    expect(thumb).toHaveAttribute('data-ui', 'segmented__thumb');
    expect(shift.style.transition).toBe('none');
  });

  test('still accepts keyboard and click selection after a drag settles', async () => {
    render(<SegmentedDemo />);
    const { day, week, month, track } = withGeometry();
    const thumb = dragDayToWeek();
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 250));
    });
    expect(week).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(week, { key: 'ArrowRight' });
    expect(month).toHaveAttribute('aria-selected', 'true');
    expect(month).toHaveAttribute('tabindex', '0');
    expect(thumb.style.left).toBe('200px');
    expect(thumb).toHaveAttribute('data-ui', 'segmented__thumb');
    expect(thumb.style.transition).toContain('left var(--dur) var(--ease)');

    fireEvent.click(day);
    expect(day).toHaveAttribute('aria-selected', 'true');
    expect(thumb.style.left).toBe('0px');
    expect(thumb).toHaveAttribute('data-ui', 'segmented__thumb');
  });

  test('clamps the drag and skips settling under reduced motion', async () => {
    await withReducedMotion(async () => {
      render(<SegmentedDemo />);
      const { day, week, track } = withGeometry();
      press(day, 10);
      const thumb = getThumb(track);
      const shift = getShift(thumb);

      // A few pixels follow 1:1 under reduced motion; no breakaway is applied.
      move(day, 16);
      expect(netPosition(track)).toBeCloseTo(6, 5);
      expect(translateX(shift)).toBeCloseTo(6, 5);
      expect(thumb.style.transform).toBe('');

      move(day, 150);
      // Reduced motion uses a plain clamp: the full 140px, not the damped 130px.
      expect(netPosition(track)).toBeCloseTo(140, 5);
      expect(translateX(shift)).toBeCloseTo(140, 5);
      expect(thumb).toHaveAttribute('data-ui', 'segmented__thumb segmented__thumb--dragging');
      expect(thumb.style.transition).toBe('none');
      expect(day).toHaveAttribute('aria-selected', 'true');

      release(day, 150);
      expect(week).toHaveAttribute('aria-selected', 'true');
      expect(thumb.style.left).toBe('100px');
      expect(translateX(shift)).toBe(0);
      expect(shift.style.transition).toBe('none');
      expect(shift.style.transition).not.toContain('--spring-ease');
      expect(thumb).toHaveAttribute('data-ui', 'segmented__thumb');

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 250));
      });
      expect(thumb).toHaveAttribute('data-ui', 'segmented__thumb');
      expect(shift.style.transition).toBe('none');
    });
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(
      <Segmented label="Range" value="day" onChange={snapNoop} options={snapSegments} />,
    );
  });
});
