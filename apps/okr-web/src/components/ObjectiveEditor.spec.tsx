import { describe, expect, rs, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import type { Objective } from '@ilovecode33/okr-shared';
import { UIFoundation } from '@ilovecode33/ui';
import { DICTIONARIES } from '../i18n';
import { ObjectiveEditor } from './ObjectiveEditor';

function renderEditor(
  onSave: (objective: Objective) => void = () => {},
  onClose: () => void = () => {},
) {
  return render(
    <UIFoundation dictionaries={DICTIONARIES}>
      <ObjectiveEditor objective={null} onSave={onSave} onClose={onClose} />
    </UIFoundation>,
  );
}

describe('ObjectiveEditor', () => {
  test('requires a title before saving', () => {
    const onSave = rs.fn();
    renderEditor(onSave);

    fireEvent.click(screen.getByRole('button', { name: 'Save objective' }));

    expect(screen.getByRole('alert').textContent).toContain('Add a title for this objective.');
    expect(onSave).not.toHaveBeenCalled();
  });

  test('saves the edited objective and calls onClose from cancel', () => {
    const onSave = rs.fn();
    const onClose = rs.fn();
    renderEditor(onSave, onClose);

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New goal' } });
    fireEvent.change(screen.getByLabelText('Start date'), {
      target: { value: '2027-01-01' },
    });
    fireEvent.change(screen.getByLabelText('End date'), {
      target: { value: '2027-03-01' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save objective' }));

    expect(onSave).toHaveBeenCalledTimes(1);
    const saved = onSave.mock.calls[0][0] as Objective;
    expect(saved.title).toBe('New goal');
    expect(saved.startDate).toBe('2027-01-01');
    expect(saved.endDate).toBe('2027-03-01');
    expect(saved.period).toBe('2027 Q1');

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
