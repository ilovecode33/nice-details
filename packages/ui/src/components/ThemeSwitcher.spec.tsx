import { afterEach, beforeEach, describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { expectComponentSnapshot } from '../test-utils/snapshot';
import { ThemeProvider } from './ThemeProvider';
import { ThemeSwitcher } from './ThemeSwitcher';

const labels = { group: 'Appearance', system: 'System', light: 'Light', dark: 'Dark' };

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
  window.localStorage.clear();
  const original = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = function () {
    const element = this as HTMLElement;
    if (element.getAttribute('role') === 'group') return rect(0);
    const index = Number(element.dataset?.index);
    return rect(Number.isInteger(index) && index >= 0 ? index * 100 : 0);
  };
  restoreGeometry = () => {
    Element.prototype.getBoundingClientRect = original;
  };
});
afterEach(() => restoreGeometry());

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

/** Outer pill; the prefix also matches the compound drag/settle data-ui values. */
const getThumb = (group: HTMLElement) =>
  group.querySelector('[data-ui^="theme__thumb"]') as HTMLElement;

/** The persistent inner layer carrying the damped visual offset. */
const getShift = (thumb: HTMLElement) =>
  thumb.querySelector('[data-ui="theme__thumb-shift"]') as HTMLElement;

/** Reads the leading translateX (px) from an inline transform, defaulting to 0. */
const translateX = (element: HTMLElement) => {
  const match = /^translate(?:3d|X)?\(\s*(-?[\d.]+)px/.exec(element.style.transform);
  return match ? Number(match[1]) : 0;
};

function withGeometry() {
  const group = screen.getByRole('group', { name: 'Appearance' });
  const buttons = ['System', 'Light', 'Dark'].map((name) =>
    screen.getByRole('button', { name }),
  );
  return { group, system: buttons[0], light: buttons[1], dark: buttons[2] };
}

describe('ThemeSwitcher', () => {
  test('offers three appearance options', () => {
    render(<ThemeProvider><ThemeSwitcher labels={labels} /></ThemeProvider>);
    const group = screen.getByRole('group', { name: 'Appearance' });
    expect(group).toBeInTheDocument();
    expect(group.querySelectorAll('button')).toHaveLength(3);
  });

  test('slides a pill to the selected option', () => {
    render(<ThemeProvider><ThemeSwitcher labels={labels} /></ThemeProvider>);
    const { group } = withGeometry();
    const thumb = getThumb(group);
    expect(thumb.style.left).toBe('0px');
    expect(thumb.style.width).toBe('100px');
  });

  test('drags the active pill to the next option and updates on release', async () => {
    render(<ThemeProvider><ThemeSwitcher labels={labels} /></ThemeProvider>);
    const { group, system, light } = withGeometry();
    const thumb = getThumb(group);
    const shift = getShift(thumb);

    press(system, 10);
    move(system, 150);
    // The outer seat stays put; the inner layer carries the damped offset.
    expect(thumb.style.left).toBe('0px');
    expect(translateX(shift)).toBeGreaterThan(0);

    release(system, 150);
    expect(light).toHaveAttribute('aria-pressed', 'true');
    expect(thumb.style.left).toBe('100px');
    expect(translateX(shift)).toBe(0);
    // useDeform removes its one-tick click-suppression guard on the next tick.
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  test('still selects on a plain click', () => {
    render(<ThemeProvider><ThemeSwitcher labels={labels} /></ThemeProvider>);
    const { dark } = withGeometry();
    fireEvent.click(dark);
    expect(dark).toHaveAttribute('aria-pressed', 'true');
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(
      <ThemeProvider>
        <ThemeSwitcher labels={labels} />
      </ThemeProvider>,
    );
  });
});
