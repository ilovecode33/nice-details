import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { Popover } from './Popover';
import { expectComponentSnapshot } from '../test-utils/snapshot';

const snapNoop = () => {};

describe('Popover', () => {
  test('renders only when open', () => {
    const { rerender } = render(<Popover open={false} label="Info" onClose={() => {}}><p>Body</p></Popover>);
    expect(screen.queryByRole('dialog')).toBeNull();
    rerender(<Popover open label="Info" onClose={() => {}}><p>Body</p></Popover>);
    expect(screen.getByRole('dialog', { name: 'Info' })).toBeInTheDocument();
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(
      <Popover open label="Info" onClose={snapNoop}>
        <p>Body</p>
      </Popover>,
    );
  });
});
