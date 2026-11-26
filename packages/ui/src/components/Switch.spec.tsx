import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
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

/** The component listens for move/up on document, outside the React tree. */
const move = (clientX: number) =>
  fireEvent.pointerMove(document, { ...pointer, clientX });
const release = (clientX: number) =>
  fireEvent.pointerUp(document, { ...pointer, clientX });

const getKnob = (control: HTMLElement) =>
  control.querySelector('[class*="ui-switch__knob"]') as HTMLElement;

describe('Switch', () => {
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
    move(30);
    // The knob follows the finger; the committed state waits for release.
    expect(getKnob(control).style.transform).toContain('translateX(20px)');
    // The knob stretches towards the pull while held.
    expect(getKnob(control).style.transform).toContain('scaleX(1.18)');
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
