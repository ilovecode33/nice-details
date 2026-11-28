import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { createSampleState } from '@ilovecode33/okr-shared';
import { UIFoundation } from '@ilovecode33/ui';
import { App } from './App';
import { DICTIONARIES } from './i18n';
import type { OkrStorage } from './storage';

function createTestStorage(): OkrStorage {
  return {
    load: async () => createSampleState(),
    save: async () => {},
    loadSyncRoom: async () => null,
    saveSyncRoom: async () => {},
    clearSyncRoom: async () => {},
    loadDeviceName: async () => null,
    saveDeviceName: async () => {},
    close: () => {},
    destroy: async () => {},
  };
}

describe('App', () => {
  test('renders the dashboard with the sample objectives', async () => {
    render(
      <UIFoundation dictionaries={DICTIONARIES}>
        <App storage={createTestStorage()} />
      </UIFoundation>,
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'My OKRs' }),
    ).toBeTruthy();
    expect(
      await screen.findByText('Build a consistent running habit'),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'New objective' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /^Sync/ })).toBeTruthy();
    // Sample-data reset is a development-only convenience.
    expect(
      screen.queryByRole('button', { name: 'Reset sample data' }),
    ).toBeNull();
  });
});
