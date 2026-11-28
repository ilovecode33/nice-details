import { afterEach, describe, expect, rs, test } from '@rstest/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { expectComponentSnapshot } from '../test-utils/snapshot';
import { Switch } from './Switch';

const snapNoop = () => {};

function SwitchDemo({ initial = false, deform = true }: { initial?: boolean; deform?: boolean }) {
  const [checked, setChecked] = useState(initial);
  return <Switch label="Wifi" checked={checked} onChange={setChecked} deform={deform} />;
}

const pointer = {
  pointerId: 1,
  pointerType: 'mouse',
  button: 0,
} as const;

const touch = {
  pointerId: 2,
  pointerType: 'touch',
  isPrimary: true,
  button: 0,
} as const;

const control = () => screen.getByRole('switch', { name: 'Wifi' });
const move = (clientX: number) =>
  fireEvent.pointerMove(control(), { ...pointer, clientX });
const release = (clientX: number) =>
  fireEvent.pointerUp(control(), { ...pointer, clientX });

const getKnob = (control: HTMLElement) =>
  control.querySelector('[class*="ui-switch__knob"]') as HTMLElement;

// Drag gestures schedule a one-tick click blocker; flush it between tests.
afterEach(async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));
});

describe('Switch', () => {
  test('a touch swipe scrolls instead of flipping the switch', () => {
    render(<SwitchDemo />);
    const control = screen.getByRole('switch', { name: 'Wifi' });

    fireEvent.pointerDown(control, { ...touch, clientX: 100 });
    fireEvent.pointerMove(control, { ...touch, clientX: 160 });
    fireEvent.pointerUp(control, { ...touch, clientX: 160 });

    expect(control).toHaveAttribute('aria-checked', 'false');
  });

  test('a held touch then drag flips the switch', () => {
    rs.useFakeTimers();
    try {
      render(<SwitchDemo />);
      const control = screen.getByRole('switch', { name: 'Wifi' });

      fireEvent.pointerDown(control, { ...touch, clientX: 100 });
      act(() => {
        rs.advanceTimersByTime(500);
      });
      fireEvent.pointerMove(control, { ...touch, clientX: 130 });
      fireEvent.pointerUp(control, { ...touch, clientX: 130 });
      // Flush the deferred click blocker so it cannot leak into the next test.
      act(() => {
        rs.advanceTimersByTime(0);
      });

      expect(control).toHaveAttribute('aria-checked', 'true');
    } finally {
      rs.useRealTimers();
    }
  });

  test('exposes switch semantics and syncs aria-checked with the visual state', () => {
    render(<SwitchDemo />);
    const control = screen.getByRole('switch', { name: 'Wifi' });
    expect(control).toHaveAttribute('aria-checked', 'false');
    expect(control.className).not.toContain('is-on');

    fireEvent.click(control);
    expect(control).toHaveAttribute('aria-checked', 'true');
    expect(control.className).toContain('is-on');

    fireEvent.click(control);
    expect(control).toHaveAttribute('aria-checked', 'false');
    expect(control.className).not.toContain('is-on');
  });

  test('dragging the knob past the midpoint turns it on', () => {
    render(<SwitchDemo />);
    const control = screen.getByRole('switch', { name: 'Wifi' });

    fireEvent.pointerDown(control, { ...pointer, clientX: 10 });
    // Halfway across the track the knob is at its widest.
    move(20);
    expect(getKnob(control).style.transform).toBe('translateX(10px) scaleX(1.18)');
    // It rounds back to a circle as it reaches the opposite seat.
    move(30);
    expect(getKnob(control).style.transform).toBe('translateX(20px) scaleX(1)');
    expect(control).toHaveAttribute('aria-checked', 'false');

    release(30);
    expect(control).toHaveAttribute('aria-checked', 'true');
    expect(control.className).toContain('is-on');

    // The synthetic click after the drag must not toggle it back.
    fireEvent.click(control);
    expect(control).toHaveAttribute('aria-checked', 'true');
  });

  test('dragging the knob back turns it off', () => {
    render(<SwitchDemo initial />);
    const control = screen.getByRole('switch', { name: 'Wifi' });

    fireEvent.pointerDown(control, { ...pointer, clientX: 40 });
    move(20);
    expect(getKnob(control).style.transform).toContain('translateX(0px)');
    expect(control).toHaveAttribute('aria-checked', 'true');

    release(20);
    expect(control).toHaveAttribute('aria-checked', 'false');
    expect(control.className).not.toContain('is-on');
  });

  test('a drag that stays on the same side snaps back without toggling', () => {
    render(<SwitchDemo />);
    const control = screen.getByRole('switch', { name: 'Wifi' });

    fireEvent.pointerDown(control, { ...pointer, clientX: 10 });
    move(18);
    expect(getKnob(control).style.transform).toContain('translateX(8px)');
    release(18);

    expect(control).toHaveAttribute('aria-checked', 'false');
    expect(getKnob(control).style.transform).toContain('translateX(0px)');
  });

  test('drag-to-toggle still works when deform feedback is disabled', () => {
    render(<SwitchDemo deform={false} />);
    const control = screen.getByRole('switch', { name: 'Wifi' });

    fireEvent.pointerDown(control, { ...pointer, clientX: 10 });
    move(30);
    release(30);

    expect(control).toHaveAttribute('aria-checked', 'true');
    // No double toggle from the synthetic click.
    fireEvent.click(control);
    expect(control).toHaveAttribute('aria-checked', 'true');
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(<Switch label="Wifi" checked={false} onChange={snapNoop} />);
  });
});
