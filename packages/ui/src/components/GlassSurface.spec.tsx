import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { expectComponentSnapshot } from '../test-utils/snapshot';
import { GlassSurface } from './GlassSurface';
describe('GlassSurface', () => {
  test('renders its children', () => {
    render(<GlassSurface><span>Glass</span></GlassSurface>);
    expect(screen.getByText('Glass')).toBeInTheDocument();
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(
      <GlassSurface>
        <span>Glass</span>
      </GlassSurface>,
    );
  });
});
