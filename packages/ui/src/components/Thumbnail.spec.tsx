import { describe, expect, test } from '@rstest/core';
import { render } from '@testing-library/react';
import { expectComponentSnapshot } from '../test-utils/snapshot';
import { Thumbnail } from './Thumbnail';
describe('Thumbnail', () => {
  test('renders an emoji placeholder', () => {
    const { container } = render(<Thumbnail emoji="★" />);
    expect(container).toHaveTextContent('★');
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(<Thumbnail emoji="★" />);
  });
});
