import { describe, expect, rs, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import type { KeyResult } from '@ilovecode33/okr-shared';
import { KeyResultRow } from './KeyResultRow';

const percentKr: KeyResult = {
  id: 'kr-1',
  title: 'Train',
  start: 0,
  target: 100,
  current: 40,
  unit: 'percent',
  weight: 5,
};

describe('KeyResultRow', () => {
  test('renders the current value and commits an update', () => {
    const onUpdate = rs.fn();
    render(<KeyResultRow kr={percentKr} onUpdate={onUpdate} onDelete={() => {}} />);

    expect(screen.getByText('Train')).toBeTruthy();
    expect(screen.getByText('40% of 100%')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Increase Train percent' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onUpdate).toHaveBeenCalledWith(45);
  });

  test('calls onDelete from the row action', () => {
    const onDelete = rs.fn();
    render(<KeyResultRow kr={percentKr} onUpdate={() => {}} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole('button', { name: 'Delete key result Train' }));

    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
