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
| `KRUnit`, `KeyResult`, `Objective`, `OKRState`, `ObjectiveSort` | Domain types. |
| `STORAGE_KEY` | `okr-web.state.v1`, the persistence key. |
| `newId()` | Unique id via `crypto.randomUUID`, with a fallback. |
| `clamp(value, min, max)` | Clamps a number to an inclusive range. |
| `keyResultProgress(kr)` | Completion from 0 to 1; handles zero-length spans. |
| `objectiveProgress(objective)` | Weight-weighted mean of key result progress. |
| `overallProgress(objectives)` | Unweighted mean of objective progress. |
| `formatValue(unit, value)` | Locale-formatted percentage, currency, or number. |
| `sortObjectives(objectives, sort)` | New array sorted by recency, progress, or title. |
| `collectPeriods(objectives)` | Unique periods, newest first. |
| `createSampleState()` | Three sample objectives across two periods. |
| `loadState(storage?)` | Validated load with a sample-data fallback; never throws. |
| `saveState(state, storage?)` | Best-effort persistence; never throws. |

## Scripts

- `bunx turbo run build --filter=@ilovecode33/okr-shared` — build ESM output and declarations.
- `bunx turbo run typecheck --filter=@ilovecode33/okr-shared` — typecheck sources.
- `bunx turbo run dev --filter=@ilovecode33/okr-shared` — watch build.
