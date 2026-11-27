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
  /** Human-readable period label, for example "2026 Q4". */
  period: string;
  keyResults: KeyResult[];
  createdAt: string;
  updatedAt: string;
}

/** The complete persisted state of the OKR app. */
export interface OKRState {
  version: 1;
  objectives: Objective[];
}

/** Supported objective orderings. */
export type ObjectiveSort = 'updated' | 'progress' | 'title';

/** localStorage key under which the app persists its state. */
export const STORAGE_KEY = 'okr-web.state.v1';
