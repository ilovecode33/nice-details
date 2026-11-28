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
  /** Last local edit, used to merge concurrent changes; older data falls back to the objective. */
  updatedAt?: string;
}

/** A goal for a period, made up of zero or more key results. */
export interface Objective {
  id: string;
  title: string;
  note: string;
  /** First quarter of the window, for example "2026 Q4". Derived from the dates. */
  period: string;
  /** First day of the objective, as YYYY-MM-DD. */
  startDate: string;
  /** Last day of the objective, as YYYY-MM-DD. */
  endDate: string;
  keyResults: KeyResult[];
  createdAt: string;
  updatedAt: string;
}

/** Deleted ids and when they were deleted, so a stale device cannot revive them. */
export interface DeletedItems {
  /** Objective id to deletion time (ISO 8601). */
  objectives?: Record<string, string>;
  /** `${objectiveId}/${keyResultId}` to deletion time (ISO 8601). */
  keyResults?: Record<string, string>;
}

/** Display name shared by every device in a room. */
export interface UserProfile {
  /** Trimmed display name; empty means the name was cleared. */
  name: string;
  /** Last edit, used to merge concurrent name changes. */
  updatedAt: string;
}

/** State persisted by the app and exchanged over a sync room. */
export interface OKRState {
  version: 1;
  objectives: Objective[];
  deleted?: DeletedItems;
  profile?: UserProfile;
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
  deleted?: DeletedItems;
  profile?: UserProfile;
}

/** localStorage key used by the legacy adapter. */
export const STORAGE_KEY = 'okr-web.state.v1';
