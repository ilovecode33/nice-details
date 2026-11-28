import { afterEach, describe, expect, test } from '@rstest/core';
import { openPersistence, type Persistence } from './index';

interface Value {
  value: number;
}

let seq = 0;

function uniqueName(label: string): string {
  seq += 1;
  return `persistence-kv-${label}-${Date.now()}-${seq}`;
}

const opened: Persistence[] = [];

afterEach(async () => {
  while (opened.length) await opened.pop()!.destroy();
});

async function createKv() {
  const db = await openPersistence({
    name: uniqueName('store'),
    version: 1,
    stores: { cache: { type: 'kv' } },
  });
  opened.push(db);
  return db.kv<Value>('cache');
}

describe('KVStore', () => {
  test('supports set, get, has, count, keys, entries, delete and clear', async () => {
    const kv = await createKv();
    const a = { value: 1 };
    const b = { value: 2 };

    await kv.set('a', a);
    await kv.set('b', b);

    expect(await kv.get('a')).toEqual(a);
    expect(await kv.get('missing')).toBeUndefined();
    expect(await kv.has('a')).toBe(true);
    expect(await kv.has('missing')).toBe(false);
    expect(await kv.count()).toBe(2);
    expect(await kv.keys()).toEqual(['a', 'b']);
    expect(await kv.entries()).toEqual([
      ['a', a],
      ['b', b],
    ]);

    await kv.set('a', { value: 3 });
    expect(await kv.get('a')).toEqual({ value: 3 });

    await kv.delete('a');
    expect(await kv.get('a')).toBeUndefined();
    expect(await kv.count()).toBe(1);

    await kv.clear();
    expect(await kv.count()).toBe(0);
  });

  test('supports numeric keys', async () => {
    const kv = await createKv();
    await kv.set(1, { value: 10 });
    await kv.set(2, { value: 20 });

    expect(await kv.keys()).toEqual([1, 2]);
    expect(await kv.get(2)).toEqual({ value: 20 });
  });
});
