/** Unit used to display and format a key result's numbers. */
export type KRUnit = 'percent' | 'number' | 'currency';

/** A measurable result that contributes to an objective. */
export interface KeyResult {
  id: string;
  title: string;
  start: number;
  target: number;
  current: number;
  unit: KRUnit;
  /** Relative importance inside the objective, from 1 to 10. */
  weight: number;
}

/** A goal for a period, made up of zero or more key results. */
export interface Objective {
  id: string;
  title: string;
  note: string;
  /** Derived label for the start/end range, for example "Oct 1 – Dec 31, 2026". */
  period: string;
  /** First day of the objective, as YYYY-MM-DD. */
  startDate: string;
  /** Last day of the objective, as YYYY-MM-DD. */
  endDate: string;
  keyResults: KeyResult[];
  createdAt: string;
  updatedAt: string;
}

/** State persisted by the app. */
export interface OKRState {
  version: 1;
  objectives: Objective[];
}

/** Supported objective orderings. */
export type ObjectiveSort = 'updated' | 'progress' | 'title';

/** Storage shape that may predate startDate/endDate. */
export type StoredObjective = Omit<Objective, 'startDate' | 'endDate'> &
  Partial<Pick<Objective, 'startDate' | 'endDate'>>;

/** Persisted state that may still need date normalization. */
export interface StoredOKRState {
  version: 1;
  objectives: StoredObjective[];
}

/** localStorage key used by the legacy adapter. */
export const STORAGE_KEY = 'okr-web.state.v1';
