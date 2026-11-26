import { describe, expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { Select } from './Select';
import { expectComponentSnapshot } from '../test-utils/snapshot';

const snapNoop = () => {};

describe('Select', () => {
  test('opens the list and chooses an option', () => {
    let chosen = '';
    render(
      <Select
        aria-label="Fruit"
        value=""
        options={[{ value: 'apple', label: 'Apple' }]}
        onChange={(e) => (chosen = e.target.value)}
      />,
    );
    fireEvent.click(screen.getByRole('combobox', { name: 'Fruit' }));
    fireEvent.click(screen.getByRole('option', { name: 'Apple' }));
    expect(chosen).toBe('apple');
  });

  test('matches its structural snapshot', () => {
    expectComponentSnapshot(
      <Select
        aria-label="Fruit"
        value="apple"
        options={[{ value: 'apple', label: 'Apple' }]}
        onChange={snapNoop}
      />,
    );
  });
});
