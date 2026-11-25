import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { GlassSurface } from './GlassSurface';
describe('GlassSurface', () => {
  test('renders its children', () => {
    render(<GlassSurface><span>Glass</span></GlassSurface>);
    expect(screen.getByText('Glass')).toBeInTheDocument();
  });
});
