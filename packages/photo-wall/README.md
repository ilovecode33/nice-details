# @ilovecode33/photo-wall

A seedable, procedural "endless photo wall" library extracted from the image-gallery project: framed prints that glide across the screen and loop without a seam.

## Install

```bash
bun add @ilovecode33/photo-wall
```

React 19 is a peer dependency. Import the components; their CSS Modules travel with the component imports:

```tsx
import {
  PhotoWall,
  createWallTiles,
  DEFAULT_LIGHT,
  DEFAULT_WALL_PARAMS,
} from '@ilovecode33/photo-wall';
```

## Usage

The host supplies a sized container with `container-type: size`; container-query units in the styles resolve against it.

```tsx
<PhotoWall
  images={photos}       // { src, width?, height?, id? }[]
  seed={state.seed}     // same seed = same wall
  params={wallParams}   // optional; DEFAULT_WALL_PARAMS otherwise
  speed={state.speed}   // optional pan multiplier
  playing={state.playing}
  light={{ ...DEFAULT_LIGHT, x: 25, y: -20, z: 500, intensity: 0.8 }}
/>
```

Pass `tiles` plus the matching ordered `images` to restore a saved wall; otherwise `seed` and `params` generate it. Every frame carries a stable `data-wall-frame` attribute for querying without depending on generated CSS Module class names.

## What it provides

- `PhotoWall` and its `WallImageSlot` child — the React renderer of the mirrored tile strip, with colocated CSS Modules, specs and structural snapshots in `src/components/`.
- Pure solvers usable without React or a DOM: `createWallTiles` / `createWallStyle` (`tiles.ts`), `solveFrameGeometry` (`geometry.ts`), `computeFrameLighting`, `computeFrameLightingMulti`, `computeWallGlow` / `computeWallGlows` and the shadow/glow formatters (`light.ts`), plus `frameVars` and `DEFAULT_WALL_PARAMS`.
- `WallParams` mirrors the gallery's proto-generated message, so a control-panel params object can be passed straight through.
- Multiple lights solve independently and accumulate: each contributes its own shadow layer and wall-glow gradient. Legacy `shadow*` tuning fields remain as normalized gains.
- Component CSS Modules are preserved in the bundleless output and load with the component imports; there is no separate stylesheet entry to import.

## Development

| Command | Description |
| --- | --- |
| `bun run build` | Bundleless ESM, declarations and per-module CSS into `dist/` |
| `bun run dev` | Watch build |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run test` | Rstest specs (happy-dom for component tests) |

From the repository root, `bunx turbo run typecheck build` checks all workspaces. Rstest uses `@rstest/adapter-rslib` for React and CSS Modules; `rstest.setup.ts` registers jest-dom matchers.

## Links

- [CHANGELOG.md](CHANGELOG.md) — release history
- [Repository README](../../README.md) and [RELEASING.md](../../RELEASING.md)
- [Photo wall rules](../ai-rules/photo-wall.md) and [AI rule index](../ai-rules/README.md)
