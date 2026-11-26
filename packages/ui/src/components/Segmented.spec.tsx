import { afterEach, beforeEach, describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
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
    // The pill floats at the pointer; selection only changes on release.
    expect(thumb.style.left).toBe('140px');
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
    expect(thumb.style.transition).toContain('left var(--dur)');
    expect(thumb.querySelector('[class*="ui-segmented__sheen"]')?.className).not.toContain(
      'is-held',
    );
    expect(thumb.querySelector('[class*="ui-segmented__spot"]')?.className).not.toContain(
      'is-held',
    );
    // useDeform removes its click-suppression guard on the next tick.
    await new Promise((resolve) => setTimeout(resolve, 0));
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

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(
      <Segmented label="Range" value="day" onChange={snapNoop} options={snapSegments} />,
    );
  });
});
