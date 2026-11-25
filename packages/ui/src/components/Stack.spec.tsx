import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { Stack } from './Stack';
describe('Stack', () => {
  test('renders vertically stacked children', () => {
    render(<Stack gap="lg"><span>One</span><span>Two</span></Stack>);
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
  });
});
