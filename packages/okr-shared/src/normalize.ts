import {
  addMonths,
  formatPeriodLabel,
  quarterRange,
  toDateOnly,
  todayIso,
} from './period';
import type {
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
    period: formatPeriodLabel(startDate, endDate),
  };
}

/** Normalizes every objective in a persisted state. */
export function normalizeState(state: StoredOKRState): OKRState {
  return {
    ...state,
    objectives: state.objectives.map(normalizeObjective),
  };
}
