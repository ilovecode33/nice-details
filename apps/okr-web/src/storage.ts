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

/** Storage contract used by the app and injected in tests. */
export interface OkrStorage {
  load(): Promise<OKRState>;
  save(state: OKRState): Promise<void>;
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
