import { openPersistence, type Persistence } from '@ilovecode33/persistence';
import {
  createSampleState,
  loadState,
  normalizeState,
  STORAGE_KEY,
  type OKRState,
} from '@ilovecode33/okr-shared';

export const OKR_DATABASE = 'okr-web';
export const OKR_DATABASE_VERSION = 1;
export const OKR_STORE = 'state';
const OKR_KEY = 'current';
const SYNC_ROOM_KEY = 'sync-room';
const DEVICE_NAME_KEY = 'device-name';
const SYNC_ROOM_PATTERN = /^[A-Za-z0-9_-]{16,64}$/;

/** Last room used by realtime sync, stored in IndexedDB. */
export interface StoredSyncRoom {
  room: string;
  role: 'host' | 'join';
}

/** Storage contract used by the app and injected in tests. */
export interface OkrStorage {
  load(): Promise<OKRState>;
  save(state: OKRState): Promise<void>;
  loadSyncRoom(): Promise<StoredSyncRoom | null>;
  saveSyncRoom(room: StoredSyncRoom): Promise<void>;
  clearSyncRoom(): Promise<void>;
  loadDeviceName(): Promise<string | null>;
  saveDeviceName(name: string): Promise<void>;
  close(): void;
  destroy(): Promise<void>;
}

/**
 * Moves pre-IndexedDB data from localStorage into IndexedDB once. The shared
 * load helper validates the value and falls back to sample data on corruption.
 */
function migrateLegacyState(): OKRState | null {
  try {
    const storage = globalThis.localStorage;
    if (!storage || storage.getItem(STORAGE_KEY) === null) return null;
    const state = loadState(storage);
    storage.removeItem(STORAGE_KEY);
    return state;
  } catch {
    return null;
  }
}

/** Opens the IndexedDB database used by the personal OKR app. */
export async function openOkrStorage(
  name = OKR_DATABASE,
): Promise<OkrStorage> {
  const db: Persistence = await openPersistence({
    name,
    version: OKR_DATABASE_VERSION,
    stores: {
      [OKR_STORE]: { type: 'kv' },
    },
  });
  const kv = db.kv<OKRState>(OKR_STORE);
  const syncKv = db.kv<unknown>(OKR_STORE);

  return {
    async load() {
      const saved = await kv.get(OKR_KEY);
      if (saved) return normalizeState(saved);

      const migrated = migrateLegacyState();
      if (migrated) {
        await kv.set(OKR_KEY, migrated);
        return migrated;
      }

      const sample = createSampleState();
      await kv.set(OKR_KEY, sample);
      return sample;
    },
    save: (state) => kv.set(OKR_KEY, state),
    async loadSyncRoom() {
      const value = await syncKv.get(SYNC_ROOM_KEY);
      if (typeof value !== 'object' || value === null) return null;
      const record = value as { room?: unknown; role?: unknown };
      if (
        typeof record.room !== 'string' ||
        !SYNC_ROOM_PATTERN.test(record.room) ||
        (record.role !== 'host' && record.role !== 'join')
      ) {
        return null;
      }
      return { room: record.room, role: record.role };
    },
    saveSyncRoom: (room) => syncKv.set(SYNC_ROOM_KEY, room),
    clearSyncRoom: () => syncKv.delete(SYNC_ROOM_KEY),
    async loadDeviceName() {
      const value = await syncKv.get(DEVICE_NAME_KEY);
      return typeof value === 'string' && value.trim()
        ? value.trim().slice(0, 40)
        : null;
    },
    saveDeviceName: (name) =>
      syncKv.set(DEVICE_NAME_KEY, name.trim().slice(0, 40)),
    close: () => db.close(),
    destroy: () => db.destroy(),
  };
}

let pending: Promise<OkrStorage> | null = null;

/**
 * Shared app connection. A failed open is not cached, so the retry action can
 * try again without reloading the page.
 */
export function getOkrStorage(): Promise<OkrStorage> {
  pending ??= openOkrStorage().catch((error: unknown) => {
    pending = null;
    throw error;
  });
  return pending;
}
