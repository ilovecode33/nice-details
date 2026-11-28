import { describe, expect, rs, test } from '@rstest/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { expectComponentSnapshot } from '../test-utils/snapshot';
import { Deformable } from './Deformable';

describe('Deformable press bloom', () => {
  test('shares the same press-point highlight with wrapped content', () => {
    render(
      <Deformable>
        <span>Content</span>
      </Deformable>,
    );
    const surface = document.querySelector('[class*="ui-deform"]') as HTMLElement;
    expect(surface).not.toBeNull();
    expect(surface.querySelector('span[aria-hidden="true"]')).toBeNull();

    fireEvent.pointerDown(surface, { clientX: 20, clientY: 10, pointerType: 'mouse', button: 0 });
    expect(surface.querySelector('span[aria-hidden="true"]')).not.toBeNull();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  test('a touch swipe before the long press leaves the surface at rest', () => {
    render(
      <Deformable longPressMs={450} touchAction="pan-y">
        <span>Content</span>
      </Deformable>,
    );
    const surface = document.querySelector('[class*="ui-deform"]') as HTMLElement;
    const touch = { pointerId: 3, pointerType: 'touch', isPrimary: true, button: 0 };

    fireEvent.pointerDown(surface, { ...touch, clientX: 20, clientY: 20 });
    fireEvent.pointerMove(surface, { ...touch, clientY: 60 });

    expect(surface.style.transform).toBe('');
  });

  test('a held touch arms the drag after the long press', () => {
    rs.useFakeTimers();
    try {
      render(
        <Deformable longPressMs={450} touchAction="pan-y">
          <span>Content</span>
        </Deformable>,
      );
      const surface = document.querySelector('[class*="ui-deform"]') as HTMLElement;
      const touch = { pointerId: 4, pointerType: 'touch', isPrimary: true, button: 0 };

      fireEvent.pointerDown(surface, { ...touch, clientX: 20, clientY: 20 });
      fireEvent.pointerMove(surface, { ...touch, clientY: 60 });
      expect(surface.style.transform).toBe('');

      fireEvent.pointerDown(surface, { ...touch, clientX: 20, clientY: 20 });
      act(() => {
        rs.advanceTimersByTime(500);
      });
      fireEvent.pointerMove(surface, { ...touch, clientY: 60 });

      expect(surface.style.transform).toContain('translate3d');
    } finally {
      rs.useRealTimers();
    }
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(
      <Deformable>
        <span>Content</span>
      </Deformable>,
    );
  });
});
