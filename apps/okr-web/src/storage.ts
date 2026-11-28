import { openPersistence, type Persistence } from '@ilovecode33/persistence';
import {
  createSampleState,
  parseState,
  STORAGE_KEY,
  type ObjectiveSort,
  type OKRState,
} from '@ilovecode33/okr-shared';
import { isRoomKey } from './crypto';

export const OKR_DATABASE = 'okr-web';
export const OKR_DATABASE_VERSION = 1;
export const OKR_STORE = 'state';
const OKR_KEY = 'current';
/** Copy of a state that failed validation, kept for manual recovery. */
const OKR_BACKUP_KEY = 'current.corrupt';
const SYNC_ROOM_KEY = 'sync-room';
const SYNC_ROOM_VERSION = 1;
const VIEW_KEY = 'view';
const VIEW_VERSION = 1;
const DEVICE_NAME_KEY = 'device-name';
const SYNC_ROOM_PATTERN = /^[A-Za-z0-9_-]{16,64}$/;
const VIEW_PERIOD_PATTERN = /^(all|\d{4} Q[1-4])$/;
const VIEW_SORTS: readonly ObjectiveSort[] = ['updated', 'progress', 'title'];

/** Last room used by realtime sync, stored in IndexedDB. */
export interface StoredSyncRoom {
  room: string;
  role: 'host' | 'join';
  key: string;
}

/** Period and sort filters, restored on the next visit. */
export interface StoredView {
  period: string;
  sort: ObjectiveSort;
}

/** Storage contract used by the app and injected in tests. */
export interface OkrStorage {
  load(): Promise<OKRState>;
  save(state: OKRState): Promise<void>;
  loadView(): Promise<StoredView | null>;
  saveView(view: StoredView): Promise<void>;
  loadSyncRoom(): Promise<StoredSyncRoom | null>;
  saveSyncRoom(room: StoredSyncRoom): Promise<void>;
  clearSyncRoom(): Promise<void>;
  loadDeviceName(): Promise<string | null>;
  saveDeviceName(name: string): Promise<void>;
  close(): void;
  destroy(): Promise<void>;
}

/**
 * Moves pre-IndexedDB data from localStorage into IndexedDB once. The legacy
 * key is left untouched when the value cannot be read, so nothing is lost.
 */
function migrateLegacyState(): OKRState | null {
  try {
    const storage = globalThis.localStorage;
    const raw = storage?.getItem(STORAGE_KEY);
    if (raw === null || raw === undefined) return null;
    const result = parseState(JSON.parse(raw));
    if (result.status !== 'ok') return null;
    storage.removeItem(STORAGE_KEY);
    return result.state;
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
  const kv = db.kv<unknown>(OKR_STORE);

  return {
    async load() {
      const raw = await kv.get(OKR_KEY);
      if (raw !== undefined) {
        const parsed = parseState(raw);
        if (parsed.status === 'ok') {
          if (parsed.migrated) await kv.set(OKR_KEY, parsed.state);
          return parsed.state;
        }
        if (parsed.status === 'newer') {
          // Never overwrite data written by a newer app version.
          throw new Error(
            `Your saved OKRs use a newer format (version ${parsed.version}). Update the app to open them.`,
          );
        }
        // Keep the unreadable value for recovery, then start from sample data.
        await kv.set(OKR_BACKUP_KEY, raw);
        const sample = createSampleState();
        await kv.set(OKR_KEY, sample);
        return sample;
      }

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
    async loadView() {
      const value = await kv.get(VIEW_KEY);
      if (typeof value !== 'object' || value === null) return null;
      const record = value as {
        version?: unknown;
        period?: unknown;
        sort?: unknown;
      };
      if (record.version !== undefined && record.version !== VIEW_VERSION) {
        return null;
      }
      if (
        typeof record.period !== 'string' ||
        !VIEW_PERIOD_PATTERN.test(record.period)
      ) {
        return null;
      }
      if (
        typeof record.sort !== 'string' ||
        !VIEW_SORTS.includes(record.sort as ObjectiveSort)
      ) {
        return null;
      }
      return { period: record.period, sort: record.sort as ObjectiveSort };
    },
    saveView: (view) => kv.set(VIEW_KEY, { version: VIEW_VERSION, ...view }),
    async loadSyncRoom() {
      const value = await kv.get(SYNC_ROOM_KEY);
      if (typeof value !== 'object' || value === null) return null;
      const record = value as {
        version?: unknown;
        room?: unknown;
        role?: unknown;
        key?: unknown;
      };
      // Records written before versioning have no version field.
      if (record.version !== undefined && record.version !== SYNC_ROOM_VERSION) {
        return null;
      }
      if (
        typeof record.room !== 'string' ||
        !SYNC_ROOM_PATTERN.test(record.room) ||
        (record.role !== 'host' && record.role !== 'join') ||
        typeof record.key !== 'string' ||
        !isRoomKey(record.key)
      ) {
        return null;
      }
      return { room: record.room, role: record.role, key: record.key };
    },
    saveSyncRoom: (room) =>
      kv.set(SYNC_ROOM_KEY, { version: SYNC_ROOM_VERSION, ...room }),
    clearSyncRoom: () => kv.delete(SYNC_ROOM_KEY),
    async loadDeviceName() {
      const value = await kv.get(DEVICE_NAME_KEY);
      return typeof value === 'string' && value.trim()
        ? value.trim().slice(0, 40)
        : null;
    },
    saveDeviceName: (name) => kv.set(DEVICE_NAME_KEY, name.trim().slice(0, 40)),
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
