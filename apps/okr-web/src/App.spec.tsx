import { describe, expect, rs, test } from '@rstest/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  addMonths,
  createSampleState,
  todayIso,
  type OKRState,
} from '@ilovecode33/okr-shared';
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

function renderApp(storage: OkrStorage = createTestStorage()) {
  return render(
    <UIFoundation dictionaries={DICTIONARIES}>
      <App storage={storage} />
    </UIFoundation>,
  );
}

async function openPage(name: 'Dashboard' | 'OKRs' | 'Settings') {
  fireEvent.click(await screen.findByRole('button', { name }));
}

/** A state with one objective whose window contains today. */
function activeState(): OKRState {
  const today = todayIso();
  return {
    version: 1,
    objectives: [
      {
        id: 'active',
        title: 'Ship the mobile layout',
        note: '',
        period: '2026 Q4',
        startDate: addMonths(today, -1),
        endDate: addMonths(today, 1),
        keyResults: [
          {
            id: 'kr',
            title: 'Screens',
            start: 0,
            target: 10,
            current: 5,
            unit: 'number',
            weight: 5,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  };
}

describe('App', () => {
  test('renders the dashboard with summary and primary navigation', async () => {
    renderApp();

    expect(
      screen.getByRole('heading', { level: 1, name: 'My OKRs' }),
    ).toBeTruthy();
    expect(await screen.findByText('Current focus')).toBeTruthy();
    expect(screen.getByText('Objectives')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Dashboard' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'OKRs' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Settings' })).toBeTruthy();
    // The list actions and sync entry live on their own pages.
    expect(screen.queryByRole('button', { name: 'New objective' })).toBeNull();
    expect(screen.queryByRole('button', { name: /^Sync/ })).toBeNull();
    // Sample-data reset is a development-only convenience.
    expect(
      screen.queryByRole('button', { name: 'Reset sample data' }),
    ).toBeNull();
  });

  test('shows active objectives on the dashboard', async () => {
    renderApp({
      ...createTestStorage(),
      load: async () => activeState(),
    });

    expect(await screen.findByText('Ship the mobile layout')).toBeTruthy();
    expect(
      screen
        .getByRole('progressbar', {
          name: 'Ship the mobile layout progress',
        })
        .getAttribute('aria-valuenow'),
    ).toBe('50');
  });

  test('opens the OKR list from the dashboard', async () => {
    renderApp();
    await screen.findByText('Current focus');

    fireEvent.click(screen.getByRole('button', { name: 'View all objectives' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'OKRs' }),
    ).toBeTruthy();
    expect(
      await screen.findByRole('button', { name: 'New objective' }),
    ).toBeTruthy();
  });

  test('moves appearance, language, and sync into settings', async () => {
    renderApp();
    await screen.findByText('Current focus');
    await openPage('Settings');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Settings' }),
    ).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Appearance' })).toBeTruthy();
    expect(
      screen.getByRole('combobox', { name: 'Accent color' }),
    ).toBeTruthy();
    expect(screen.getByRole('combobox', { name: 'Language' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /^Sync/ })).toBeTruthy();
  });

  test('restores the saved period and sort filters on the OKR list', async () => {
    const saveView = rs.fn();
    const view: StoredView = { period: '2026 Q3', sort: 'title' };
    renderApp({
      ...createTestStorage(),
      loadView: async () => view,
      saveView,
    });

    await openPage('OKRs');

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
    renderApp({
      ...createTestStorage(),
      load: async () => ({ version: 1, objectives: [spanning] }),
      loadView: async () => ({ period: '2027 Q1', sort: 'updated' }),
    });

    await openPage('OKRs');

    expect(await screen.findByText('Across the new year')).toBeTruthy();
    await waitFor(() => {
      expect(
        screen.getByRole('combobox', { name: 'Filter by period' })
          .textContent,
      ).toContain('2027 Q1');
    });
  });

  test('falls back to all periods when the saved quarter is gone', async () => {
    renderApp({
      ...createTestStorage(),
      loadView: async () => ({ period: '2019 Q1', sort: 'updated' }),
    });

    await openPage('OKRs');

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
