import { describe, expect, test } from '@rstest/core';
import {
  addMonths,
  collectPeriods,
  formatQuarterSpan,
  formatValue,
  normalizeState,
  objectiveQuarters,
  periodProgress,
  quarterLabel,
  quarterOrder,
  quarterRange,
  quarterSpan,
} from './index';

describe('period helpers', () => {
  test('adds calendar months and clamps month-end dates', () => {
    expect(addMonths('2026-11-27', 2)).toBe('2027-01-27');
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonths('2024-01-31', 1)).toBe('2024-02-29');
  });

  test('derives quarter labels from any date in the quarter', () => {
    expect(quarterLabel('2026-10-01')).toBe('2026 Q4');
    expect(quarterLabel('2026-11-28T09:00:00.000Z')).toBe('2026 Q4');
    expect(quarterLabel('2027-01-31')).toBe('2027 Q1');
    expect(quarterLabel('not a date')).toBe('');
  });

  test('orders quarters for sorting', () => {
    expect(quarterOrder('2026 Q4')).toBe(2026 * 4 + 3);
    expect(quarterOrder('2026 Q1')).toBe(2026 * 4);
    expect(quarterOrder('Autumn')).toBeNull();
  });

  test('spans every quarter a window touches', () => {
    expect(quarterSpan('2026-10-01', '2026-12-31')).toEqual(['2026 Q4']);
    expect(quarterSpan('2026-11-28', '2027-01-28')).toEqual([
      '2026 Q4',
      '2027 Q1',
    ]);
    expect(quarterSpan('2026-06-15', '2027-03-01')).toEqual([
      '2026 Q2',
      '2026 Q3',
      '2026 Q4',
      '2027 Q1',
    ]);
    expect(quarterSpan('not a date', '2026-12-31')).toEqual([]);
    // An inverted window keeps the start quarter instead of looping.
    expect(quarterSpan('2026-12-31', '2026-01-01')).toEqual(['2026 Q4']);
  });

  test('derives the quarters an objective belongs to', () => {
    expect(
      objectiveQuarters({
        startDate: '2026-11-28',
        endDate: '2027-01-28',
        period: '2026 Q4',
      }),
    ).toEqual(['2026 Q4', '2027 Q1']);
    expect(
      objectiveQuarters({ startDate: '', endDate: '', period: '2026 Q3' }),
    ).toEqual(['2026 Q3']);
    expect(
      objectiveQuarters({ startDate: '', endDate: '', period: 'Autumn' }),
    ).toEqual([]);
    expect(formatQuarterSpan(['2026 Q4'])).toBe('2026 Q4');
    expect(formatQuarterSpan(['2026 Q4', '2027 Q1'])).toBe(
      '2026 Q4 – 2027 Q1',
    );
    expect(formatQuarterSpan([])).toBe('');
  });

  test('collects every quarter covered by the objectives', () => {
    const base = {
      note: '',
      keyResults: [],
      createdAt: '2026-10-01T00:00:00.000Z',
      updatedAt: '2026-10-01T00:00:00.000Z',
    };
    expect(
      collectPeriods([
        {
          ...base,
          id: 'spanning',
          title: 'Across the year',
          period: '2026 Q4',
          startDate: '2026-11-28',
          endDate: '2027-01-28',
        },
        {
          ...base,
          id: 'single',
          title: 'Summer',
          period: '2026 Q3',
          startDate: '2026-07-01',
          endDate: '2026-09-30',
        },
      ]),
    ).toEqual(['2027 Q1', '2026 Q4', '2026 Q3']);
  });

  test('formats values with the requested locale', () => {
    expect(formatValue('percent', 68)).toBe('68%');
    expect(formatValue('number', 1200, 'de-DE')).toBe('1.200');
    expect(formatValue('currency', 320)).toBe('$320');
  });

  test('counts down by days and elapsed percent', () => {
    const upcoming = periodProgress(
      '2026-12-01',
      '2027-01-31',
      '2026-11-27',
    );
    expect(upcoming).toEqual({ status: 'upcoming', daysLeft: 4, percent: 0 });

    const active = periodProgress('2026-11-01', '2026-12-01', '2026-11-16');
    expect(active).toEqual({ status: 'active', daysLeft: 15, percent: 50 });

    const ended = periodProgress('2026-09-01', '2026-10-01', '2026-11-27');
    expect(ended).toEqual({ status: 'ended', daysLeft: 0, percent: 100 });
  });

  test('derives quarter ranges from labels', () => {
    expect(quarterRange('2026 Q4')).toEqual({
      startDate: '2026-10-01',
      endDate: '2026-12-31',
    });
    expect(quarterRange('2026 Q1')).toEqual({
      startDate: '2026-01-01',
      endDate: '2026-03-31',
    });
    expect(quarterRange('Autumn')).toBeNull();
  });
});

describe('normalizeState', () => {
  test('expands a quarter label into dates', () => {
    const state = normalizeState({
      version: 1,
      objectives: [
        {
          id: 'legacy',
          title: 'Legacy',
          note: '',
          period: '2026 Q4',
          keyResults: [],
          createdAt: '2026-10-02T00:00:00.000Z',
          updatedAt: '2026-10-02T00:00:00.000Z',
        },
      ],
    });

    expect(state.objectives[0].startDate).toBe('2026-10-01');
    expect(state.objectives[0].endDate).toBe('2026-12-31');
    expect(state.objectives[0].period).toBe('2026 Q4');
  });

  test('falls back to createdAt plus two months for unknown labels', () => {
    const state = normalizeState({
      version: 1,
      objectives: [
        {
          id: 'legacy',
          title: 'Legacy',
          note: '',
          period: 'Autumn',
          keyResults: [],
          createdAt: '2026-11-27T00:00:00.000Z',
          updatedAt: '2026-11-27T00:00:00.000Z',
        },
      ],
    });

    expect(state.objectives[0].startDate).toBe('2026-11-27');
    expect(state.objectives[0].endDate).toBe('2027-01-27');
    expect(state.objectives[0].period).toBe('2026 Q4');
  });
});
