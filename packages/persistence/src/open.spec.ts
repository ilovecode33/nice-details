import { afterEach, describe, expect, test } from '@rstest/core';
import { openPersistence, PersistenceError, type Persistence } from './index';

let seq = 0;

function uniqueName(label: string): string {
  seq += 1;
  return `persistence-open-${label}-${Date.now()}-${seq}`;
}

const opened: Persistence[] = [];

afterEach(async () => {
  while (opened.length) await opened.pop()!.destroy();
});

describe('openPersistence', () => {
  test('creates key-value and table stores', async () => {
    const db = await openPersistence({
      name: uniqueName('schema'),
      version: 1,
      stores: {
        settings: { type: 'kv' },
        notes: {
          type: 'table',
          keyPath: 'id',
          indexes: [{ name: 'byUpdatedAt', keyPath: 'updatedAt' }],
        },
      },
    });
    opened.push(db);

    expect(db.version).toBe(1);
    expect(await db.kv('settings').count()).toBe(0);
    expect(await db.table('notes').count()).toBe(0);
  });

  test('adds stores on a later version without losing data', async () => {
    const name = uniqueName('upgrade');
    const first = await openPersistence({
      name,
      version: 1,
      stores: { settings: { type: 'kv' } },
    });
    await first.kv<{ theme: string }>('settings').set('prefs', { theme: 'dark' });
    first.close();

    const second = await openPersistence({
      name,
      version: 2,
      stores: {
        settings: { type: 'kv' },
        notes: { type: 'table', keyPath: 'id' },
      },
    });
    opened.push(second);

    expect(second.version).toBe(2);
    expect(await second.kv<{ theme: string }>('settings').get('prefs')).toEqual({
      theme: 'dark',
    });
    await second.table<{ id: string }>('notes').put({ id: 'n1' });
    expect(await second.table('notes').count()).toBe(1);
  });

  test('runs onUpgrade after the built-in schema', async () => {
    let oldVersion = -1;
    const db = await openPersistence({
      name: uniqueName('callback'),
      version: 1,
      stores: { settings: { type: 'kv' } },
      onUpgrade: (_db, _transaction, previous) => {
        oldVersion = previous;
      },
    });
    opened.push(db);
    expect(oldVersion).toBe(0);
  });

  test('rejects a table store without a key strategy', async () => {
    await expect(
      openPersistence({
        name: uniqueName('invalid'),
        version: 1,
        stores: { broken: { type: 'table' } },
      }),
    ).rejects.toBeInstanceOf(PersistenceError);
  });

  test('destroy removes the database contents', async () => {
    const name = uniqueName('destroy');
    const db = await openPersistence({
      name,
      version: 1,
      stores: { settings: { type: 'kv' } },
    });
    await db.kv('settings').set('key', 'value');
    await db.destroy();

    const reopened = await openPersistence({
      name,
      version: 1,
      stores: { settings: { type: 'kv' } },
    });
    opened.push(reopened);
    expect(await reopened.kv('settings').get('key')).toBeUndefined();
  });
});
