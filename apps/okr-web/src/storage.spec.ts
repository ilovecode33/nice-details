import 'fake-indexeddb/auto';
import { afterEach, describe, expect, test } from '@rstest/core';
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
});
