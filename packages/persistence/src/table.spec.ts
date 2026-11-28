import { afterEach, describe, expect, test } from '@rstest/core';
import { openPersistence, PersistenceError, type Persistence } from './index';

interface Note {
  id: string;
  title: string;
  updatedAt: string;
  tags: string[];
}

let seq = 0;

function uniqueName(label: string): string {
  seq += 1;
  return `persistence-table-${label}-${Date.now()}-${seq}`;
}

const opened: Persistence[] = [];

afterEach(async () => {
  while (opened.length) await opened.pop()!.destroy();
});

async function createStores() {
  const db = await openPersistence({
    name: uniqueName('store'),
    version: 1,
    stores: {
      notes: {
        type: 'table',
        keyPath: 'id',
        indexes: [
          { name: 'byUpdatedAt', keyPath: 'updatedAt' },
          { name: 'byTag', keyPath: 'tags', multiEntry: true },
        ],
      },
      events: { type: 'table', autoIncrement: true },
    },
  });
  opened.push(db);
  return {
    notes: db.table<Note, string>('notes'),
    events: db.table<{ type: string }, number>('events'),
  };
}

describe('TableStore', () => {
  test('supports add, get, has, count, getAll, delete and clear', async () => {
    const { notes } = await createStores();
    const first: Note = {
      id: 'n1',
      title: 'First',
      updatedAt: '2026-01-01',
      tags: ['a'],
    };
    const second: Note = {
      id: 'n2',
      title: 'Second',
      updatedAt: '2026-02-01',
      tags: ['b'],
    };

    expect(await notes.add(first)).toBe('n1');
    expect(await notes.add(second)).toBe('n2');
    expect(await notes.get('n1')).toEqual(first);
    expect(await notes.get('missing')).toBeUndefined();
    expect(await notes.has('n1')).toBe(true);
    expect(await notes.has('missing')).toBe(false);
    expect(await notes.count()).toBe(2);
    expect(await notes.getAll()).toEqual([first, second]);
    expect(await notes.getAllKeys()).toEqual(['n1', 'n2']);

    await notes.delete('n1');
    expect(await notes.get('n1')).toBeUndefined();
    expect(await notes.count()).toBe(1);

    await notes.clear();
    expect(await notes.count()).toBe(0);
  });

  test('put upserts and index queries work', async () => {
    const { notes } = await createStores();
    await notes.put({
      id: 'n1',
      title: 'First',
      updatedAt: '2026-01-01',
      tags: ['a'],
    });
    await notes.put({
      id: 'n2',
      title: 'Second',
      updatedAt: '2026-02-01',
      tags: ['a', 'b'],
    });
    await notes.put({
      id: 'n1',
      title: 'First updated',
      updatedAt: '2026-03-01',
      tags: ['a'],
    });

    expect(await notes.count()).toBe(2);
    expect((await notes.get('n1'))?.title).toBe('First updated');

    const recent = await notes.getAllByIndex(
      'byUpdatedAt',
      IDBKeyRange.lowerBound('2026-02-01'),
    );
    expect(recent.map((note) => note.id)).toEqual(['n2', 'n1']);
    expect(
      await notes.countByIndex(
        'byUpdatedAt',
        IDBKeyRange.lowerBound('2026-02-01'),
      ),
    ).toBe(2);

    const taggedA = await notes.getAllByIndex('byTag', 'a');
    expect(taggedA.map((note) => note.id).sort()).toEqual(['n1', 'n2']);
  });

  test('autoIncrement assigns numeric primary keys', async () => {
    const { events } = await createStores();
    expect(await events.add({ type: 'open' })).toBe(1);
    expect(await events.add({ type: 'close' })).toBe(2);
    expect(await events.get(1)).toEqual({ type: 'open' });
  });

  test('add rejects a duplicate primary key', async () => {
    const { notes } = await createStores();
    const note: Note = {
      id: 'n1',
      title: 'First',
      updatedAt: '2026-01-01',
      tags: [],
    };
    await notes.add(note);
    await expect(notes.add(note)).rejects.toBeInstanceOf(PersistenceError);
  });

  test('rejects an unknown index', async () => {
    const { notes } = await createStores();
    await expect(
      notes.getAllByIndex('missing'),
    ).rejects.toBeInstanceOf(PersistenceError);
  });
});
