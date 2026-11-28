# @ilovecode33/okr-shared

Framework-neutral domain helpers for a personal OKR app. The package owns the
OKR data model, pure progress calculations, deterministic sample data, and safe
`localStorage` persistence. It has no runtime dependencies and no React or DOM
requirement; storage is an optional `Storage`-shaped argument.

The OKR web app now persists through `@ilovecode33/persistence` (IndexedDB).
The `loadState`/`saveState` helpers remain available for simple localStorage
use cases and for the one-time migration path.

## Usage

```ts
import {
  createSampleState,
  keyResultProgress,
  loadState,
  objectiveProgress,
  saveState,
} from '@ilovecode33/okr-shared';

const state = loadState(); // falls back to createSampleState()
const progress = objectiveProgress(state.objectives[0]); // 0..1
saveState(state);
```

## API

| Export | Description |
| --- | --- |
| `KRUnit`, `KeyResult`, `Objective`, `OKRState`, `ObjectiveSort`, `UserProfile` | Domain types. `Objective` carries `startDate`/`endDate`. `UserProfile` is the display name shared through a room. |
| `StoredObjective`, `StoredOKRState` | Legacy shapes accepted during migration. |
| `STORAGE_KEY` | `okr-web.state.v1`, the persistence key. |
| `newId()` | Unique id via `crypto.randomUUID`, with a fallback. |
| `clamp(value, min, max)` | Clamps a number to an inclusive range. |
| `keyResultProgress(kr)` | Completion from 0 to 1; handles zero-length spans. |
| `objectiveProgress(objective)` | Weight-weighted mean of key result progress. |
| `overallProgress(objectives)` | Unweighted mean of objective progress. |
| `formatValue(unit, value, locale?)` | Locale-aware currency/number formatting; percentages stay compact. |
| `sortObjectives(objectives, sort)` | New array sorted by recency, progress, or title. |
| `collectPeriods(objectives)` | Unique period labels, newest start date first. |
| `addMonths(isoDate, months)` | Calendar month arithmetic, clamped at month end. |
| `formatPeriodLabel(start, end, locale?)` | Locale-aware display label such as `Oct 1 – Dec 31, 2026`. |
| `periodProgress(start, end, now?)` | `{ status, daysLeft, percent }` countdown for a date window. |
| `quarterRange(period)` | Expands a `2026 Q4` label into dates. |
| `normalizeObjective(objective)` | Fills legacy dates and recomputes the period label. |
| `normalizeState(state)` | Normalizes every objective in a persisted state. |
| `createSampleState()` | Three sample objectives across two periods. |
| `loadState(storage?)` | Validated, normalized load with sample-data fallback; never throws. |
| `saveState(state, storage?)` | Best-effort persistence; never throws. |

## Periods

Objectives store `startDate` and `endDate` as `YYYY-MM-DD`. `periodProgress` returns the status (`upcoming` / `active` / `ended`), whole days left, and elapsed percentage for a given `now`. The end date is inclusive: the last day reports `0 days left` and `100% elapsed`.

`normalizeState` migrates older data: a quarter label such as `2026 Q4` expands to its quarter, otherwise the creation date plus two months is used.

## Scripts

- `bunx turbo run build --filter=@ilovecode33/okr-shared` — build ESM output and declarations.
- `bunx turbo run typecheck --filter=@ilovecode33/okr-shared` — typecheck sources.
- `bunx turbo run test --filter=@ilovecode33/okr-shared` — run period/normalization specs.
- `bunx turbo run dev --filter=@ilovecode33/okr-shared` — watch build.
