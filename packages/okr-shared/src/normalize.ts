import {
  addMonths,
  quarterLabel,
  quarterRange,
  toDateOnly,
  todayIso,
} from './period';
import type {
  DeletedItems,
  Objective,
  OKRState,
  StoredObjective,
  StoredOKRState,
} from './types';

/**
 * Fills in start/end dates for objectives saved before periods became date
 * windows. Quarter labels such as "2026 Q4" are expanded; anything else falls
 * back to the creation date plus two months. The period label is always
 * recomputed from the resulting dates.
 */
export function normalizeObjective(objective: StoredObjective): Objective {
  const range = quarterRange(objective.period);
  const startDate =
    objective.startDate ||
    range?.startDate ||
    toDateOnly(objective.createdAt) ||
    todayIso();
  const endDate =
    objective.endDate ||
    (range && range.startDate === startDate ? range.endDate : undefined) ||
    addMonths(startDate, 2);

  return {
    ...objective,
    startDate,
    endDate,
    period: quarterLabel(startDate),
  };
}

/** Keeps only the id-to-timestamp entries a tombstone map can hold. */
function normalizeTombstones(
  value: unknown,
): Record<string, string> | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return undefined;
  }
  const entries = Object.entries(value as Record<string, unknown>).filter(
    (entry): entry is [string, string] => typeof entry[1] === 'string',
  );
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

function normalizeDeleted(value: unknown): DeletedItems | undefined {
  if (typeof value !== 'object' || value === null) return undefined;
  const record = value as DeletedItems;
  const objectives = normalizeTombstones(record.objectives);
  const keyResults = normalizeTombstones(record.keyResults);
  if (!objectives && !keyResults) return undefined;
  return {
    ...(objectives ? { objectives } : {}),
    ...(keyResults ? { keyResults } : {}),
  };
}

/** Normalizes every objective in a persisted state. */
export function normalizeState(state: StoredOKRState): OKRState {
  const { deleted: rawDeleted, ...rest } = state;
  const deleted = normalizeDeleted(rawDeleted);
  return {
    ...rest,
    objectives: rest.objectives.map(normalizeObjective),
    ...(deleted ? { deleted } : {}),
  };
}
