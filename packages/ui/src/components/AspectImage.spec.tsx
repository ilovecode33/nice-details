import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { AspectImage } from './AspectImage';
describe('AspectImage', () => {
  test('renders an image with its alt text', () => {
    render(<AspectImage src="/photo.jpg" alt="Mountains" />);
    expect(screen.getByRole('img', { name: 'Mountains' })).toHaveAttribute('src', '/photo.jpg');
  });
  test('falls back to a labelled placeholder', () => {
    render(<AspectImage alt="Ocean">≈</AspectImage>);
    expect(screen.getByRole('img', { name: 'Ocean' })).toHaveTextContent('≈');
  });
});
