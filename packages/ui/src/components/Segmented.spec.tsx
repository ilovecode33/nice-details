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

  /** Drags the pill from the Day slot to the Week slot. */
  function dragDayToWeek() {
    const { track, day } = withGeometry();
    fireEvent.pointerDown(day, {
      clientX: 10,
      clientY: 20,
      pointerType: 'mouse',
      button: 0,
      buttons: 1,
    });
    fireEvent.pointerMove(day, {
      clientX: 150,
      clientY: 20,
      pointerType: 'mouse',
      button: 0,
      buttons: 1,
    });
    fireEvent.pointerUp(day, {
      clientX: 150,
      clientY: 20,
      pointerType: 'mouse',
      button: 0,
      buttons: 1,
    });
    return track.querySelector('[class*="ui-segmented__thumb"]') as HTMLElement;
  }

  /** Presses the Day pill at x=10 and moves the pointer to `clientX`, still held. */
  function dragDayTo(clientX: number) {
    const { track, day } = withGeometry();
    fireEvent.pointerDown(day, {
      clientX: 10,
      clientY: 20,
      pointerType: 'mouse',
      button: 0,
      buttons: 1,
    });
    fireEvent.pointerMove(day, {
      clientX,
      clientY: 20,
      pointerType: 'mouse',
      button: 0,
      buttons: 1,
    });
    return track.querySelector('[class*="ui-segmented__thumb"]') as HTMLElement;
  }

  test('moves the selected pill to the active option with a slide transition', () => {
    render(<SegmentedDemo />);
    const { track, week } = withGeometry();
    const thumb = track.querySelector('[class*="ui-segmented__thumb"]') as HTMLElement;

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

  test('follows the pointer while dragging the pill and snaps on release', async () => {
    render(<SegmentedDemo />);
    const { track, day, week } = withGeometry();
    const thumb = track.querySelector('[class*="ui-segmented__thumb"]') as HTMLElement;

    fireEvent.pointerDown(day, {
      clientX: 10,
      clientY: 20,
      pointerType: 'mouse',
      button: 0,
      buttons: 1,
    });
    expect(thumb.style.transition).toBe('none');
    const spot = thumb.querySelector('[class*="ui-segmented__spot"]') as HTMLElement;
    expect(spot).not.toBeNull();
    expect(spot.style.getPropertyValue('--seg-glow-x')).toBe('10%');
    expect(thumb.querySelector('[class*="ui-segmented__sheen"]')?.className).toContain('is-held');

    fireEvent.pointerMove(day, {
      clientX: 150,
      clientY: 20,
      pointerType: 'mouse',
      button: 0,
      buttons: 1,
    });
    // At the Week centre the breakaway is complete, but the magnet still pulls
    // 25% of the remaining 40px back toward the slot: 100 + 40 * 0.75 = 130px.
    // Selection still only changes on release.
    expect(thumb.style.left).toBe('130px');
    expect(thumb).toHaveAttribute(
      'data-ui',
      'segmented__thumb segmented__thumb--dragging',
    );
    expect(thumb.style.transition).toBe('none');
    expect(day).toHaveAttribute('aria-selected', 'true');

    fireEvent.pointerUp(day, {
      clientX: 150,
      clientY: 20,
      pointerType: 'mouse',
      button: 0,
      buttons: 1,
    });
    expect(week).toHaveAttribute('aria-selected', 'true');
    expect(thumb.style.left).toBe('100px');
    // A real drag springs into the slot before the ordinary slide returns.
    expect(thumb).toHaveAttribute(
      'data-ui',
      'segmented__thumb segmented__thumb--settling',
    );
    expect(thumb.style.transition).toContain('left var(--spring-dur) var(--spring-ease)');
    expect(thumb.style.transition).not.toContain('left var(--dur) var(--ease)');
    expect(thumb.querySelector('[class*="ui-segmented__sheen"]')?.className).not.toContain(
      'is-held',
    );
    expect(thumb.querySelector('[class*="ui-segmented__spot"]')?.className).not.toContain(
      'is-held',
    );
    // useDeform removes its click-suppression guard on the next tick.
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  test('barely moves for the first few pixels of a drag', () => {
    render(<SegmentedDemo />);
    // x=16 is a 6px raw delta, still 34px from the Day centre (inside the
    // radius). The MIN_FOLLOW floor plus the magnet leave it almost seated.
    const left = parseFloat(dragDayTo(16).style.left);
    expect(left).toBeCloseTo(1.2678571428571428, 6);
    expect(left).toBeLessThan(2);
  });

  test('ramps the follow up across the 28px breakaway band', () => {
    render(<SegmentedDemo />);
    const at6 = parseFloat(dragDayTo(16).style.left);
    const at20 = parseFloat(dragDayTo(30).style.left);
    const at28 = parseFloat(dragDayTo(38).style.left);

    expect(at6).toBeCloseTo(1.2678571428571428, 6);
    expect(at20).toBeCloseTo(12.698412698412698, 6);
    expect(at28).toBeCloseTo(23.333333333333332, 6);
    // The effective follow climbs as the pointer breaks away, instead of
    // jumping straight to a 1:1 track (or staying pinned at MIN_FOLLOW).
    expect(at6 / 6).toBeLessThan(at20 / 20);
    expect(at20 / 20).toBeLessThan(at28 / 28);
  });

  test('tracks the pointer one-to-one once outside the slot radius', () => {
    render(<SegmentedDemo />);
    // At exactly the 36px radius the weighted curve hands off to raw tracking.
    expect(dragDayTo(86).style.left).toBe('76px');
    // Midway between Day and Week (50px from either centre) the raw 90px wins.
    expect(dragDayTo(100).style.left).toBe('90px');
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
    const thumb = track.querySelector('[class*="ui-segmented__thumb"]') as HTMLElement;
    const sheen = thumb.querySelector('[class*="ui-segmented__sheen"]') as HTMLElement;
    const spot = thumb.querySelector('[class*="ui-segmented__spot"]') as HTMLElement;

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

  test('returns from the spring to the ordinary slide after the settle window', async () => {
    render(<SegmentedDemo />);
    const { week } = withGeometry();
    const thumb = dragDayToWeek();

    expect(thumb).toHaveAttribute(
      'data-ui',
      'segmented__thumb segmented__thumb--settling',
    );
    expect(thumb.style.transition).toContain('left var(--spring-dur) var(--spring-ease)');
    expect(thumb.style.left).toBe('100px');
    expect(week).toHaveAttribute('aria-selected', 'true');

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 250));
    });

    expect(thumb).toHaveAttribute('data-ui', 'segmented__thumb');
    expect(thumb.style.transition).toContain('left var(--dur) var(--ease)');
    expect(thumb.style.transition).not.toContain(
      'left var(--spring-dur) var(--spring-ease)',
    );
    expect(thumb.style.left).toBe('100px');
  });

  test('still accepts keyboard and click selection after a drag settles', async () => {
    render(<SegmentedDemo />);
    const { day, week, month } = withGeometry();
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
      const { track, day, week } = withGeometry();
      const thumb = track.querySelector('[class*="ui-segmented__thumb"]') as HTMLElement;

      fireEvent.pointerDown(day, {
        clientX: 10,
        clientY: 20,
        pointerType: 'mouse',
        button: 0,
        buttons: 1,
      });
      // A few pixels follow 1:1 under reduced motion; no breakaway is applied.
      fireEvent.pointerMove(day, {
        clientX: 16,
        clientY: 20,
        pointerType: 'mouse',
        button: 0,
        buttons: 1,
      });
      expect(thumb.style.left).toBe('6px');

      fireEvent.pointerMove(day, {
        clientX: 150,
        clientY: 20,
        pointerType: 'mouse',
        button: 0,
        buttons: 1,
      });
      // Reduced motion uses a plain clamp: the full 140px, not the damped 130px.
      expect(thumb.style.left).toBe('140px');
      expect(thumb).toHaveAttribute(
        'data-ui',
        'segmented__thumb segmented__thumb--dragging',
      );
      expect(thumb.style.transition).toBe('none');
      expect(day).toHaveAttribute('aria-selected', 'true');

      fireEvent.pointerUp(day, {
        clientX: 150,
        clientY: 20,
        pointerType: 'mouse',
        button: 0,
        buttons: 1,
      });
      expect(week).toHaveAttribute('aria-selected', 'true');
      expect(thumb.style.left).toBe('100px');
      expect(thumb).toHaveAttribute('data-ui', 'segmented__thumb');
      expect(thumb.style.transition).toBe('none');

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 250));
      });
      expect(thumb).toHaveAttribute('data-ui', 'segmented__thumb');
      expect(thumb.style.transition).toBe('none');
    });
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(
      <Segmented label="Range" value="day" onChange={snapNoop} options={snapSegments} />,
    );
  });
});
