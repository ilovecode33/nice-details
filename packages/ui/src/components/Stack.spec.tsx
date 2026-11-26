import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { Stack } from './Stack';
import { expectComponentSnapshot } from '../test-utils/snapshot';

describe('Stack', () => {
  test('renders vertically stacked children', () => {
    render(<Stack gap="lg"><span>One</span><span>Two</span></Stack>);
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(
      <Stack gap="lg">
        <span>One</span>
        <span>Two</span>
      </Stack>,
    );
  });
});
