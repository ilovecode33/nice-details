import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { expectComponentSnapshot } from '../test-utils/snapshot';
import { Button } from './Button';

describe('Button', () => {
  test('renders its label and fires onClick', () => {
    let clicks = 0;
    render(<Button onClick={() => (clicks += 1)}>Save</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(clicks).toBe(1);
  });

  test('keeps the variant and size classes', () => {
    render(
      <Button variant="primary" size="compact">
        Continue
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Continue' });
    expect(button.className).toContain('ui-btn--primary');
    expect(button.className).toContain('ui-btn--compact');
  });

  test('does not fire when disabled', () => {
    let clicks = 0;
    render(
      <Button disabled onClick={() => (clicks += 1)}>
        Disabled
      </Button>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Disabled' }));
    expect(clicks).toBe(0);
  });

  test('is a submit-less button by default so it never submits a form', () => {
    render(<Button>Neutral</Button>);
    expect(screen.getByRole('button', { name: 'Neutral' })).toHaveAttribute('type', 'button');
  });

  test('portals the whole anchor-positioned button with a layout placeholder', () => {
    const { unmount } = render(
      <>
        <Button haloPortal>Save</Button>
        <Button haloPortal>Discard</Button>
      </>,
    );
    const save = screen.getByRole('button', { name: 'Save' });
    const discard = screen.getByRole('button', { name: 'Discard' });

    // The button itself is portalled to body and fixed to its placeholder.
    expect(save.parentElement).toBe(document.body);
    expect(discard.parentElement).toBe(document.body);
    expect(getComputedStyle(save).position).toBe('fixed');
    const anchor = getComputedStyle(save).getPropertyValue('position-anchor');
    expect(anchor).toMatch(/^--btn-halo-/);
    expect(getComputedStyle(discard).getPropertyValue('position-anchor')).not.toBe(
      anchor,
    );

    // The placeholder holds the layout slot and carries the anchor name.
    const placeholders = document.querySelectorAll('[class*="ui-btn-placeholder"]');
    expect(placeholders).toHaveLength(2);
    expect(getComputedStyle(placeholders[0]).getPropertyValue('anchor-name')).toBe(
      anchor,
    );
    expect(placeholders[0]).toHaveAttribute('aria-hidden', 'true');
    unmount();
  });

  test('has no press-point glow layer', () => {
    render(<Button variant="primary">Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    fireEvent.pointerDown(button, { clientX: 50, clientY: 20, pointerType: 'mouse', button: 0 });
    expect(button.querySelector('[class*="ui-glow"]')).toBeNull();
  });

  test('keeps transform feedback without a glow layer', () => {
    render(<Button deform={false}>Quiet</Button>);
    const button = screen.getByRole('button', { name: 'Quiet' });
    fireEvent.pointerDown(button, { clientX: 10, clientY: 10, pointerType: 'mouse', button: 0 });
    expect(button.querySelector('[class*="ui-glow"]')).toBeNull();
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(
      <Button variant="primary" size="compact" haloPortal>
        Save
      </Button>,
    );
  });
});
