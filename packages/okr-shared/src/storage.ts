import { createSampleState } from './sample';
import { STORAGE_KEY } from './types';
import type { KeyResult, KRUnit, Objective, OKRState } from './types';

const UNITS: readonly KRUnit[] = ['percent', 'number', 'currency'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isKeyResult(value: unknown): value is KeyResult {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.start === 'number' &&
    typeof value.target === 'number' &&
    typeof value.current === 'number' &&
    typeof value.weight === 'number' &&
    typeof value.unit === 'string' &&
    UNITS.includes(value.unit as KRUnit)
  );
}

function isObjective(value: unknown): value is Objective {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.note === 'string' &&
    typeof value.period === 'string' &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string' &&
    Array.isArray(value.keyResults) &&
    value.keyResults.every(isKeyResult)
  );
}

function isOKRState(value: unknown): value is OKRState {
  return (
    isRecord(value) &&
    value.version === 1 &&
    Array.isArray(value.objectives) &&
    value.objectives.every(isObjective)
  );
}

/** Loads and validates persisted state, falling back to sample data on any problem. */
export function loadState(storage?: Storage): OKRState {
  try {
    const store = storage ?? globalThis.localStorage;
    if (!store) return createSampleState();
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return createSampleState();
    const parsed: unknown = JSON.parse(raw);
    return isOKRState(parsed) ? parsed : createSampleState();
  } catch {
    return createSampleState();
  }
}

/** Persists state to localStorage; silently ignores unavailable or failing storage. */
export function saveState(state: OKRState, storage?: Storage): void {
  try {
    const store = storage ?? globalThis.localStorage;
    if (!store) return;
    store.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* Storage is unavailable or full; the app keeps working in memory. */
  }
}
