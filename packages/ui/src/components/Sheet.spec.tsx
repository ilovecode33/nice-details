import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { Sheet } from './Sheet';
import { expectComponentSnapshot } from '../test-utils/snapshot';

const snapNoop = () => {};

describe('Sheet', () => {
  test('renders a modal dialog when open', () => {
    render(<Sheet open title="Details" onClose={() => {}}><p>Body</p></Sheet>);
    expect(screen.getByRole('dialog', { name: 'Details' })).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(
      <Sheet open title="Details" onClose={snapNoop}>
        <p>Body</p>
      </Sheet>,
    );
  });
});
