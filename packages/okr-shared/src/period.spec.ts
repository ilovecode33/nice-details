import { describe, expect, test } from '@rstest/core';
import {
  addMonths,
  formatPeriodLabel,
  formatValue,
  normalizeState,
  periodProgress,
  quarterRange,
} from './index';

describe('period helpers', () => {
  test('adds calendar months and clamps month-end dates', () => {
    expect(addMonths('2026-11-27', 2)).toBe('2027-01-27');
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonths('2024-01-31', 1)).toBe('2024-02-29');
  });

  test('formats same-year and cross-year ranges', () => {
    expect(formatPeriodLabel('2026-10-01', '2026-12-31')).toBe(
      'Oct 1 – Dec 31, 2026',
    );
    expect(formatPeriodLabel('2026-12-01', '2027-01-31')).toBe(
      'Dec 1, 2026 – Jan 31, 2027',
    );
    expect(formatPeriodLabel('2026-10-01', '2026-12-31', 'de-DE')).toContain(
      'Okt',
    );
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
    expect(state.objectives[0].period).toBe('Oct 1 – Dec 31, 2026');
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
  });
});
