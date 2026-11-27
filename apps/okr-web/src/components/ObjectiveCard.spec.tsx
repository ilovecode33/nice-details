import { describe, expect, rs, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import type { Objective } from '@ilovecode33/okr-shared';
import { ObjectiveCard } from './ObjectiveCard';

const objective: Objective = {
  id: 'o-1',
  title: 'Read more',
  note: 'Less scrolling.',
  period: '2026 Q4',
  keyResults: [
    { id: 'kr-1', title: 'Books', start: 0, target: 12, current: 6, unit: 'number', weight: 5 },
  ],
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-11-20T00:00:00.000Z',
};

describe('ObjectiveCard', () => {
  test('renders the objective, period, and key results', () => {
    render(
      <ObjectiveCard
        objective={objective}
        onEdit={() => {}}
        onDelete={() => {}}
        onUpdateKr={() => {}}
        onDeleteKr={() => {}}
      />,
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Read more' })).toBeTruthy();
    expect(screen.getByText('2026 Q4')).toBeTruthy();
    expect(screen.getByText('Books')).toBeTruthy();
    expect(screen.getByText('6 of 12')).toBeTruthy();
  });

  test('wires the objective and key-result actions', () => {
    const onEdit = rs.fn();
    const onDelete = rs.fn();
    const onUpdateKr = rs.fn();
    const onDeleteKr = rs.fn();

    render(
      <ObjectiveCard
        objective={objective}
        onEdit={onEdit}
        onDelete={onDelete}
        onUpdateKr={onUpdateKr}
        onDeleteKr={onDeleteKr}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Edit Read more' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete Read more' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete key result Books' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDeleteKr).toHaveBeenCalledWith('kr-1');
    expect(onUpdateKr).toHaveBeenCalledWith('kr-1', 6);
  });
});
