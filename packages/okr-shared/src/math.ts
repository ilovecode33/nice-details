import { objectiveQuarters, quarterOrder } from './period';
import type { KRUnit, KeyResult, Objective, ObjectiveSort } from './types';

interface ValueFormatters {
  number: Intl.NumberFormat;
  currency: Intl.NumberFormat;
}

const formatterCache = new Map<string, ValueFormatters>();

function valueFormatters(locale: string): ValueFormatters {
  let formatters = formatterCache.get(locale);
  if (!formatters) {
    formatters = {
      number: new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }),
      currency: new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }),
    };
    formatterCache.set(locale, formatters);
  }
  return formatters;
}

/** Creates a unique id using crypto.randomUUID when available, with a safe fallback. */
export function newId(): string {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi && typeof cryptoApi.randomUUID === 'function') {
    return cryptoApi.randomUUID();
  }
  return `okr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Clamps a number into the inclusive range [min, max]; non-finite values become min. */
export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}

/** Returns a key result's completion as a number from 0 to 1. */
export function keyResultProgress(kr: KeyResult): number {
  const span = kr.target - kr.start;
  if (!Number.isFinite(span) || !Number.isFinite(kr.current)) return 0;
  if (span === 0) return kr.current >= kr.target ? 1 : 0;
  return clamp((kr.current - kr.start) / span, 0, 1);
}

/** Returns the weight-weighted mean of an objective's key results, from 0 to 1. */
export function objectiveProgress(objective: Objective): number {
  const results = objective.keyResults;
  if (!results.length) return 0;
  let weighted = 0;
  let total = 0;
  for (const kr of results) {
    const weight = Number.isFinite(kr.weight) && kr.weight > 0 ? kr.weight : 0;
    weighted += keyResultProgress(kr) * weight;
    total += weight;
  }
  return total > 0 ? clamp(weighted / total, 0, 1) : 0;
}

/** Returns the unweighted mean of objective progress, from 0 to 1. */
export function overallProgress(objectives: Objective[]): number {
  if (!objectives.length) return 0;
  const total = objectives.reduce((sum, objective) => sum + objectiveProgress(objective), 0);
  return clamp(total / objectives.length, 0, 1);
}

/** Formats a value for display with locale-aware currency and number grouping. */
export function formatValue(
  unit: KRUnit,
  value: number,
  locale = 'en-US',
): string {
  const safe = Number.isFinite(value) ? value : 0;
  if (unit === 'percent') return `${Math.round(safe)}%`;
  const formatters = valueFormatters(locale);
  return unit === 'currency'
    ? formatters.currency.format(safe)
    : formatters.number.format(safe);
}

/** Returns a new sorted array without mutating the input or its objectives. */
export function sortObjectives(objectives: Objective[], sort: ObjectiveSort): Objective[] {
  const copy = objectives.slice();
  switch (sort) {
    case 'progress':
      return copy.sort((a, b) => objectiveProgress(b) - objectiveProgress(a));
    case 'title':
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case 'updated':
      return copy.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
}

/** Returns unique period labels sorted by their latest start date, newest first. */
/** Distinct quarters covered by the objectives, newest first. */
export function collectPeriods(objectives: Objective[]): string[] {
  const periods = new Set<string>();
  for (const objective of objectives) {
    for (const quarter of objectiveQuarters(objective)) periods.add(quarter);
  }
  return [...periods].sort((a, b) => {
    const left = quarterOrder(a);
    const right = quarterOrder(b);
    if (left !== null && right !== null) return right - left;
    if (left !== null) return -1;
    if (right !== null) return 1;
    return b.localeCompare(a);
  });
}
