import { describe, expect, rs, test } from '@rstest/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createSampleState } from '@ilovecode33/okr-shared';
import { UIFoundation } from '@ilovecode33/ui';
import { App } from './App';
import { DICTIONARIES } from './i18n';
import type { OkrStorage, StoredView } from './storage';

function createTestStorage(): OkrStorage {
  return {
    load: async () => createSampleState(),
    save: async () => {},
    loadView: async () => null,
    saveView: async () => {},
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

  test('restores the saved period and sort filters', async () => {
    const saveView = rs.fn();
    const view: StoredView = { period: '2026 Q3', sort: 'title' };
    render(
      <UIFoundation dictionaries={DICTIONARIES}>
        <App
          storage={{
            ...createTestStorage(),
            loadView: async () => view,
            saveView,
          }}
        />
      </UIFoundation>,
    );

    // The saved period filters out the Q4 objectives.
    expect(await screen.findByText('Make mornings calmer')).toBeTruthy();
    expect(
      screen.queryByText('Build a consistent running habit'),
    ).toBeNull();
    await waitFor(() => {
      expect(
        screen.getByRole('combobox', { name: 'Filter by period' })
          .textContent,
      ).toContain('2026 Q3');
      expect(
        screen.getByRole('combobox', { name: 'Sort objectives' }).textContent,
      ).toContain('Title');
    });

    fireEvent.click(
      screen.getByRole('combobox', { name: 'Sort objectives' }),
    );
    fireEvent.click(screen.getByText('Progress'));
    await waitFor(() => {
      expect(saveView).toHaveBeenCalledWith({
        period: '2026 Q3',
        sort: 'progress',
      });
    });
  });

  test('keeps a spanning objective under every quarter it covers', async () => {
    const spanning = {
      id: 'spanning',
      title: 'Across the new year',
      note: '',
      period: '2026 Q4',
      startDate: '2026-11-28',
      endDate: '2027-01-28',
      keyResults: [],
      createdAt: '2026-11-01T00:00:00.000Z',
      updatedAt: '2026-11-20T00:00:00.000Z',
    };
    render(
      <UIFoundation dictionaries={DICTIONARIES}>
        <App
          storage={{
            ...createTestStorage(),
            load: async () => ({ version: 1, objectives: [spanning] }),
            loadView: async () => ({ period: '2027 Q1', sort: 'updated' }),
          }}
        />
      </UIFoundation>,
    );

    expect(await screen.findByText('Across the new year')).toBeTruthy();
    await waitFor(() => {
      expect(
        screen.getByRole('combobox', { name: 'Filter by period' })
          .textContent,
      ).toContain('2027 Q1');
    });
  });

  test('falls back to all periods when the saved quarter is gone', async () => {
    render(
      <UIFoundation dictionaries={DICTIONARIES}>
        <App
          storage={{
            ...createTestStorage(),
            loadView: async () => ({ period: '2019 Q1', sort: 'updated' }),
          }}
        />
      </UIFoundation>,
    );

    expect(
      await screen.findByText('Build a consistent running habit'),
    ).toBeTruthy();
    await waitFor(() => {
      expect(
        screen.getByRole('combobox', { name: 'Filter by period' })
          .textContent,
      ).toContain('All periods');
    });
  });
});
