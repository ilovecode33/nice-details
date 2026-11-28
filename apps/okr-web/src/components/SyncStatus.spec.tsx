import { describe, expect, rs, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { UIFoundation } from '@ilovecode33/ui';
import { DICTIONARIES } from '../i18n';
import { SyncStatus } from './SyncStatus';

describe('SyncStatus', () => {
  test('shows the traffic light and opens sync', () => {
    const onOpen = rs.fn();
    render(
      <UIFoundation dictionaries={DICTIONARIES}>
        <SyncStatus status="connected" onOpen={onOpen} />
      </UIFoundation>,
    );

    const button = screen.getByRole('button', { name: 'Sync: Connected' });
    fireEvent.click(button);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
