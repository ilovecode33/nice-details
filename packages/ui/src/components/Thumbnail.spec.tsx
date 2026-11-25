import { describe, expect, test } from '@rstest/core';
import { render } from '@testing-library/react';
import { Thumbnail } from './Thumbnail';
describe('Thumbnail', () => {
  test('renders an emoji placeholder', () => {
    const { container } = render(<Thumbnail emoji="★" />);
    expect(container).toHaveTextContent('★');
  });
});
