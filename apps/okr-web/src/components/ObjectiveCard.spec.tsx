import { describe, expect, rs, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import type { Objective } from '@ilovecode33/okr-shared';
import { UIFoundation } from '@ilovecode33/ui';
import { DICTIONARIES } from '../i18n';
import { ObjectiveCard } from './ObjectiveCard';

const objective: Objective = {
  id: 'o-1',
  title: 'Read more',
  note: 'Less scrolling.',
  period: '2026 Q4',
  startDate: '2026-10-01',
  endDate: '2026-12-31',
  keyResults: [
    { id: 'kr-1', title: 'Books', start: 0, target: 12, current: 6, unit: 'number', weight: 5 },
  ],
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-11-20T00:00:00.000Z',
};

function renderCard(
  props: {
    objective?: Objective;
    onEdit?: () => void;
    onDelete?: () => void;
    onUpdateKr?: (krId: string, current: number) => void;
    onDeleteKr?: (krId: string) => void;
  } = {},
) {
  return render(
    <UIFoundation dictionaries={DICTIONARIES}>
      <ObjectiveCard
        objective={props.objective ?? objective}
        onEdit={props.onEdit ?? (() => {})}
        onDelete={props.onDelete ?? (() => {})}
        onUpdateKr={props.onUpdateKr ?? (() => {})}
        onDeleteKr={props.onDeleteKr ?? (() => {})}
      />
    </UIFoundation>,
  );
}

describe('ObjectiveCard', () => {
  test('renders the objective, period, and key results', () => {
    renderCard();

    expect(screen.getByRole('heading', { level: 2, name: 'Read more' })).toBeTruthy();
    expect(screen.getByText('2026 Q4')).toBeTruthy();
    expect(screen.getByText('Books')).toBeTruthy();
    expect(screen.getByText('6 of 12')).toBeTruthy();
  });

  test('shows the full quarter span when the window crosses quarters', () => {
    renderCard({
      objective: {
        ...objective,
        startDate: '2026-11-28',
        endDate: '2027-01-28',
      },
    });

    expect(screen.getByText('2026 Q4 – 2027 Q1')).toBeTruthy();
  });

  test('wires the objective and key-result actions', () => {
    const onEdit = rs.fn();
    const onDelete = rs.fn();
    const onUpdateKr = rs.fn();
    const onDeleteKr = rs.fn();

    renderCard({ onEdit, onDelete, onUpdateKr, onDeleteKr });

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
