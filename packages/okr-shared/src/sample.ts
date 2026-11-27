import { formatPeriodLabel } from './period';
import type { KeyResult, OKRState, Objective } from './types';

const Q4_START = '2026-10-01';
const Q4_END = '2026-12-31';
const Q3_START = '2026-07-01';
const Q3_END = '2026-09-30';

function kr(
  id: string,
  title: string,
  start: number,
  target: number,
  current: number,
  unit: KeyResult['unit'],
  weight: number,
): KeyResult {
  return { id, title, start, target, current, unit, weight };
}

/** Builds a deterministic sample state with three personal objectives across two periods. */
export function createSampleState(): OKRState {
  const objectives: Objective[] = [
    {
      id: 'sample-running',
      title: 'Build a consistent running habit',
      note: 'Train steadily and finish the autumn half marathon.',
      period: formatPeriodLabel(Q4_START, Q4_END),
      startDate: Q4_START,
      endDate: Q4_END,
      keyResults: [
        kr('sample-running-1', 'Complete planned training sessions', 0, 100, 68, 'percent', 5),
        kr('sample-running-2', 'Runs per month', 0, 12, 9, 'number', 3),
        kr('sample-running-3', 'Save for new running shoes', 0, 500, 320, 'currency', 2),
      ],
      createdAt: '2026-10-02T08:00:00.000Z',
      updatedAt: '2026-11-24T18:30:00.000Z',
    },
    {
      id: 'sample-reading',
      title: 'Read more deliberately',
      note: 'Less scrolling, more finished books and notes.',
      period: formatPeriodLabel(Q4_START, Q4_END),
      startDate: Q4_START,
      endDate: Q4_END,
      keyResults: [
        kr('sample-reading-1', 'Books finished', 0, 12, 7, 'number', 6),
        kr('sample-reading-2', 'Books with reading notes', 0, 100, 90, 'percent', 4),
      ],
      createdAt: '2026-10-05T09:15:00.000Z',
      updatedAt: '2026-11-20T20:00:00.000Z',
    },
    {
      id: 'sample-mornings',
      title: 'Make mornings calmer',
      note: 'A small routine that survives busy weeks.',
      period: formatPeriodLabel(Q3_START, Q3_END),
      startDate: Q3_START,
      endDate: Q3_END,
      keyResults: [
        kr('sample-mornings-1', 'Days without checking the phone first', 0, 90, 90, 'number', 6),
        kr('sample-mornings-2', 'Morning routine completion', 0, 100, 100, 'percent', 4),
      ],
      createdAt: '2026-07-01T07:00:00.000Z',
      updatedAt: '2026-09-30T07:45:00.000Z',
    },
  ];
  return { version: 1, objectives };
}
