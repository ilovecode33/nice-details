import { normalizeState } from './normalize';
import type {
  KeyResult,
  KRUnit,
  OKRState,
  StoredOKRState,
  StoredObjective,
} from './types';

/**
 * Version of the stored OKR document. Bump this together with a new entry in
 * `STATE_MIGRATIONS` whenever a stored field is renamed, removed, or changes
 * meaning. Additive optional fields do not need a bump.
 */
export const CURRENT_STATE_VERSION = 1;

type RawState = Record<string, unknown>;

/**
 * Migrations from version N to N + 1. Each step receives the raw stored object
 * and must return the next shape. The chain runs before validation, so a step
 * may still see fields that the current types no longer describe.
 *
 * Example:
 *   1: (state) => ({ ...state, version: 2, objectives: ... })
 */
const STATE_MIGRATIONS: Record<number, (state: RawState) => RawState> = {};

export type StateReadResult =
  | { status: 'ok'; state: OKRState; migrated: boolean }
  | { status: 'invalid'; reason: string }
  /** The value was written by a newer app version and must not be rewritten. */
  | { status: 'newer'; version: number };

const UNITS: readonly KRUnit[] = ['percent', 'number', 'currency'];

function isRecord(value: unknown): value is RawState {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isKeyResult(value: unknown): value is KeyResult {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.start === 'number' &&
    Number.isFinite(value.start) &&
    typeof value.target === 'number' &&
    Number.isFinite(value.target) &&
    typeof value.current === 'number' &&
    Number.isFinite(value.current) &&
    typeof value.weight === 'number' &&
    typeof value.unit === 'string' &&
    UNITS.includes(value.unit as KRUnit) &&
    (value.updatedAt === undefined || typeof value.updatedAt === 'string')
  );
}

/** Validates one stored objective, including legacy rows without dates. */
export function isStoredObjective(value: unknown): value is StoredObjective {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.note === 'string' &&
    typeof value.period === 'string' &&
    (value.startDate === undefined || typeof value.startDate === 'string') &&
    (value.endDate === undefined || typeof value.endDate === 'string') &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string' &&
    Array.isArray(value.keyResults) &&
    value.keyResults.every(isKeyResult)
  );
}

/** Validates the outer document without normalizing it. */
export function isStoredOKRState(value: unknown): value is StoredOKRState {
  if (!isRecord(value)) return false;
  return (
    typeof value.version === 'number' &&
    Array.isArray(value.objectives) &&
    value.objectives.every(isStoredObjective)
  );
}

function validateObjectives(value: RawState): string | null {
  if (!Array.isArray(value.objectives)) return 'State has no objectives list';
  const index = value.objectives.findIndex(
    (objective) => !isStoredObjective(objective),
  );
  return index === -1 ? null : `Objective ${index} is malformed`;
}

/**
 * Reads a persisted or synced document: checks the version, runs migrations,
 * then normalizes derived fields. Never throws and never rewrites the input.
 */
export function parseState(value: unknown): StateReadResult {
  if (!isRecord(value)) {
    return { status: 'invalid', reason: 'State is not an object' };
  }
  const version = value.version;
  if (
    typeof version !== 'number' ||
    !Number.isInteger(version) ||
    version < 1
  ) {
    return { status: 'invalid', reason: 'State has no schema version' };
  }
  if (version > CURRENT_STATE_VERSION) {
    return { status: 'newer', version };
  }

  let current = value;
  let migrated = false;
  for (let from = version; from < CURRENT_STATE_VERSION; from += 1) {
    const migrate = STATE_MIGRATIONS[from];
    if (!migrate) {
      return {
        status: 'invalid',
        reason: `No migration from state version ${from}`,
      };
    }
    current = migrate(current);
    migrated = true;
  }

  const problem = validateObjectives(current);
  if (problem) return { status: 'invalid', reason: problem };
  if (current.version !== CURRENT_STATE_VERSION) {
    return {
      status: 'invalid',
      reason: `Migration left state at version ${String(current.version)}`,
    };
  }

  return {
    status: 'ok',
    state: normalizeState(current as unknown as StoredOKRState),
    migrated,
  };
}
