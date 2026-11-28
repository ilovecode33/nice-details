import { createSampleState } from './sample';
import { parseState } from './schema';
import { STORAGE_KEY } from './types';
import type { OKRState, StoredOKRState } from './types';

/**
 * Loads and validates state from the legacy localStorage store, normalizes it,
 * and falls back to sample data on any problem. IndexedDB data goes through
 * `parseState` in the app instead, which can keep backups and report versions.
 */
export function loadState(storage?: Storage): OKRState {
  try {
    const store = storage ?? globalThis.localStorage;
    if (!store) return createSampleState();
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return createSampleState();
    const parsed: unknown = JSON.parse(raw);
    const result = parseState(parsed);
    return result.status === 'ok' ? result.state : createSampleState();
  } catch {
    return createSampleState();
  }
}

/** Persists state to localStorage; silently ignores unavailable or failing storage. */
export function saveState(state: StoredOKRState, storage?: Storage): void {
  try {
    const store = storage ?? globalThis.localStorage;
    if (!store) return;
    store.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* Storage is unavailable or full; the app keeps working in memory. */
  }
}
