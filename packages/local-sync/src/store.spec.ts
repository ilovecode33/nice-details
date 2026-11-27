import 'fake-indexeddb/auto';
import { afterEach, describe, expect, test } from '@rstest/core';
import { deletePersistence } from '@ilovecode33/persistence';
import { openLocalSyncStorage } from './store';

let seq = 0;
const names: string[] = [];

function uniqueName(): string {
  seq += 1;
  return `local-sync-test-${Date.now()}-${seq}`;
}

afterEach(async () => {
  while (names.length) await deletePersistence(names.pop()!);
});

describe('local-sync store', () => {
  test('persists identities and peers', async () => {
    const name = uniqueName();
    names.push(name);
    const store = await openLocalSyncStorage(name);

    await store.saveIdentity({
      role: 'host',
      id: 'host-1',
      label: 'Desktop',
      password: 'pw',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    expect(await store.getIdentity('host')).toMatchObject({
      id: 'host-1',
      password: 'pw',
    });

    await store.savePeer({
      id: 'guest-1',
      role: 'guest',
      label: 'Phone',
      password: 'pw',
      lastSeen: '2026-01-01T00:00:00.000Z',
    });
    await store.savePeer({
      id: 'guest-2',
      role: 'guest',
      label: 'Tablet',
      password: 'pw',
      lastSeen: '2026-02-01T00:00:00.000Z',
    });

    expect((await store.listPeers()).map((peer) => peer.id)).toEqual([
      'guest-2',
      'guest-1',
    ]);

    await store.deletePeer('guest-1');
    expect((await store.listPeers()).map((peer) => peer.id)).toEqual([
      'guest-2',
    ]);

    store.close();
  });
});
