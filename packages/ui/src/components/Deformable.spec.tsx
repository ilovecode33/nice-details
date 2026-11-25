import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
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
});
