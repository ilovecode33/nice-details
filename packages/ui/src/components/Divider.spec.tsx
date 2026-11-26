import { describe, expect, test } from '@rstest/core';
import { render } from '@testing-library/react';
import { expectComponentSnapshot } from '../test-utils/snapshot';
import { Divider } from './Divider';
describe('Divider', () => {
  test('renders a horizontal rule', () => {
    render(<Divider />);
    expect(document.querySelector('hr')).toBeInTheDocument();
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(<Divider />);
  });
});
