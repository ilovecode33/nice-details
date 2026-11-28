import 'fake-indexeddb/auto';
import { afterEach, describe, expect, test } from '@rstest/core';
import { openPersistence } from '@ilovecode33/persistence';
import { createSampleState, STORAGE_KEY } from '@ilovecode33/okr-shared';
import { openOkrStorage, type OkrStorage } from './storage';

let seq = 0;

function uniqueName(): string {
  seq += 1;
  return `okr-web-test-${Date.now()}-${seq}`;
}

const opened: OkrStorage[] = [];

afterEach(async () => {
  while (opened.length) await opened.pop()!.destroy();
});

/** Seeds raw values in the app database before the app opens it. */
async function seed(name: string, values: Record<string, unknown>) {
  const db = await openPersistence({
    name,
    version: 1,
    stores: { state: { type: 'kv' } },
  });
  const kv = db.kv('state');
  for (const [key, value] of Object.entries(values)) await kv.set(key, value);
  db.close();
}

async function readRaw(name: string, key: string) {
  const db = await openPersistence({
    name,
    version: 1,
    stores: { state: { type: 'kv' } },
  });
  const value = await db.kv('state').get(key);
  db.close();
  return value;
}

describe('openOkrStorage', () => {
  test('seeds sample data and persists across connections', async () => {
    const name = uniqueName();
    const first = await openOkrStorage(name);
    const initial = await first.load();
    expect(initial.objectives).toHaveLength(3);

    const changed = {
      ...initial,
      objectives: initial.objectives.slice(0, 1),
    };
    await first.save(changed);
    first.close();

    const second = await openOkrStorage(name);
    opened.push(second);
    expect(await second.load()).toEqual(changed);
  });

  test('migrates legacy localStorage state on first load', async () => {
    window.localStorage.clear();
    const legacy = createSampleState();
    legacy.objectives = legacy.objectives.slice(0, 1);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));

    const storage = await openOkrStorage(uniqueName());
    opened.push(storage);

    expect(await storage.load()).toEqual(legacy);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  test('keeps unreadable legacy state instead of deleting it', async () => {
    window.localStorage.clear();
    window.localStorage.setItem(STORAGE_KEY, '{"version":1,"objectives":"nope"}');

    const storage = await openOkrStorage(uniqueName());
    opened.push(storage);

    expect((await storage.load()).objectives).toHaveLength(3);
    expect(window.localStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  test('backs up a corrupt stored document and starts from sample data', async () => {
    const name = uniqueName();
    const corrupt = { version: 1, objectives: [{ id: 'broken' }] };
    await seed(name, { current: corrupt });

    const storage = await openOkrStorage(name);
    opened.push(storage);

    expect((await storage.load()).objectives).toHaveLength(3);
    expect(await readRaw(name, 'current.corrupt')).toEqual(corrupt);
  });

  test('refuses to load a document from a newer app version', async () => {
    const name = uniqueName();
    const future = { version: 2, objectives: [] };
    await seed(name, { current: future });

    const storage = await openOkrStorage(name);
    opened.push(storage);

    await expect(storage.load()).rejects.toThrow(/newer format/);
    expect(await readRaw(name, 'current')).toEqual(future);
    expect(await readRaw(name, 'current.corrupt')).toBeUndefined();
  });

  test('persists and clears the last sync room', async () => {
    const storage = await openOkrStorage(uniqueName());
    opened.push(storage);
    const key = 'A'.repeat(43);

    expect(await storage.loadSyncRoom()).toBeNull();
    await storage.saveSyncRoom({
      room: 'abcdefghijklmnop',
      role: 'host',
      key,
    });
    expect(await storage.loadSyncRoom()).toEqual({
      room: 'abcdefghijklmnop',
      role: 'host',
      key,
    });
    await storage.clearSyncRoom();
    expect(await storage.loadSyncRoom()).toBeNull();

    expect(await storage.loadDeviceName()).toBeNull();
    await storage.saveDeviceName('  Mac · Chrome  ');
    expect(await storage.loadDeviceName()).toBe('Mac · Chrome');
  });

  test('persists the period and sort filters', async () => {
    const name = uniqueName();
    const first = await openOkrStorage(name);
    expect(await first.loadView()).toBeNull();
    await first.saveView({ period: '2026 Q3', sort: 'progress' });
    first.close();

    const second = await openOkrStorage(name);
    opened.push(second);
    expect(await second.loadView()).toEqual({
      period: '2026 Q3',
      sort: 'progress',
    });
  });

  test('ignores invalid filter values and future view versions', async () => {
    const name = uniqueName();
    await seed(name, {
      view: { version: 1, period: 'Autumn', sort: 'progress' },
    });
    const storage = await openOkrStorage(name);
    opened.push(storage);
    expect(await storage.loadView()).toBeNull();

    await seed(name, {
      view: { version: 2, period: '2026 Q3', sort: 'progress' },
    });
    expect(await storage.loadView()).toBeNull();
  });

  test('copies a device-local user name into the shared profile', async () => {
    const name = uniqueName();
    const sample = createSampleState();
    await seed(name, { current: sample, 'user-name': '  Ada  ' });

    const storage = await openOkrStorage(name);
    opened.push(storage);

    const loaded = await storage.load();
    expect(loaded.profile?.name).toBe('Ada');
    expect(loaded.objectives).toEqual(sample.objectives);
    expect(typeof loaded.profile?.updatedAt).toBe('string');
    expect(await readRaw(name, 'user-name')).toBeUndefined();
    expect(await readRaw(name, 'current')).toEqual(loaded);
  });

  test('keeps a shared profile and drops the old local name', async () => {
    const name = uniqueName();
    const profile = { name: 'Grace', updatedAt: '2026-11-28T00:00:00.000Z' };
    await seed(name, {
      current: { ...createSampleState(), profile },
      'user-name': 'Ada',
    });

    const storage = await openOkrStorage(name);
    opened.push(storage);

    expect((await storage.load()).profile).toEqual(profile);
    expect(await readRaw(name, 'user-name')).toBeUndefined();
  });

  test('leaves a non-string legacy user name untouched', async () => {
    const name = uniqueName();
    const sample = createSampleState();
    await seed(name, { current: sample, 'user-name': 42 });

    const storage = await openOkrStorage(name);
    opened.push(storage);

    expect(await storage.load()).toEqual(sample);
    expect(await readRaw(name, 'user-name')).toBe(42);
  });

  test('accepts a sync room saved before records were versioned', async () => {
    const name = uniqueName();
    const key = 'A'.repeat(43);
    await seed(name, {
      'sync-room': { room: 'abcdefghijklmnop', role: 'join', key },
    });

    const storage = await openOkrStorage(name);
    opened.push(storage);

    expect(await storage.loadSyncRoom()).toEqual({
      room: 'abcdefghijklmnop',
      role: 'join',
      key,
    });
    const stored = (await readRaw(name, 'sync-room')) as { version?: number };
    expect(stored.version).toBeUndefined();
  });
});
