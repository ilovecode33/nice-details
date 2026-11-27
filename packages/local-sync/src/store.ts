import { openPersistence } from '@ilovecode33/persistence';
import type {
  LocalSyncIdentity,
  LocalSyncPeer,
  LocalSyncStorage,
} from './types';

export const LOCAL_SYNC_DATABASE = 'local-sync';
export const LOCAL_SYNC_VERSION = 1;

/** Opens the default IndexedDB-backed trust store. */
export async function openLocalSyncStorage(
  name = LOCAL_SYNC_DATABASE,
): Promise<LocalSyncStorage> {
  const db = await openPersistence({
    name,
    version: LOCAL_SYNC_VERSION,
    stores: {
      identity: { type: 'kv' },
      peers: {
        type: 'table',
        keyPath: 'id',
        indexes: [{ name: 'byLastSeen', keyPath: 'lastSeen' }],
      },
    },
  });
  const identities = db.kv<LocalSyncIdentity>('identity');
  const peers = db.table<LocalSyncPeer, string>('peers');

  return {
    getIdentity: (role) => identities.get(role),
    saveIdentity: (identity) => identities.set(identity.role, identity),
    listPeers: async () => {
      const all = await peers.getAll();
      return all.sort((a, b) => b.lastSeen.localeCompare(a.lastSeen));
    },
    savePeer: async (peer) => {
      await peers.put(peer);
    },
    deletePeer: (id) => peers.delete(id),
    close: () => db.close(),
  };
}
