# @ilovecode33/photo-wall

The endless **Photo Wall** from the image-gallery project, extracted into a
standalone library: framed prints on a wall that glide left to right forever.

It ships two things:

1. **A pure generator** — seedable procedural layout, per-frame wood/mat/shadow
   styling, and a geometry solver that fits real image ratios into a safe band
   on any viewport aspect. No DOM, no React required.
2. **A React renderer** — `PhotoWall` plus its CSS, using a mirrored tile strip
   so the pan loops without a seam or a photo swap.

## Install

```ts
import { PhotoWall, createWallTiles } from '@ilovecode33/photo-wall';
import '@ilovecode33/photo-wall/styles.css';
```

The host must provide a sized container. Container-query units (`cqw`, `cqh`)
in the styles resolve against the nearest size container; give the parent
`container-type: size` (as the gallery's presentation root does).

## Render the wall

```tsx
<PhotoWall
  images={photos}            // { src, width?, height?, id? }[]
  params={wallParams}        // optional; DEFAULT_WALL_PARAMS otherwise
  seed={state.seed}          // optional; same seed = same wall
  speed={state.speed}        // optional pan multiplier
  playing={state.playing}    // optional pause
  viewportAspect={aspect}    // optional; measured from the element otherwise
  imageRatios={ratios}       // optional; for photos without stored dimensions
  tiles={restoredTiles}      // optional; generated from seed otherwise
/>
```

`images` is the photo pool for the strip — four photos per tile. The component
wraps the pool when it is smaller than the strip needs. Pass `tiles` (and the
matching ordered `images`) to restore a wall saved in storage; otherwise the
seed and params generate it.

Every frame carries `data-wall-frame`, a stable hook for counting or querying
frames without depending on generated CSS Module class names.

## Generate tiles without React

```ts
import { createWallTiles, DEFAULT_WALL_PARAMS } from '@ilovecode33/photo-wall';

const [tileA, tileB] = createWallTiles(seed, DEFAULT_WALL_PARAMS);
// tileA.frames  -> { x, y, w, ratio, frame, z, tilt }[]
// tileA.styles  -> { wood, matTop, matBottom, railScale, shadowX, … }[]
```

`WallParams` mirrors the proto-generated `WallParams` message, so a live
control-panel params object can be passed directly.

## Geometry

`solveFrameGeometry` derives a frame's width and vertical anchor from its real
image ratio and the viewport aspect:

```
heightVh = widthPct * 1.64 * viewportAspect / ratio
stageY%  = (screenVh + 32) / 1.64
```

Portrait images are narrowed so they never leave the safe band and never grow
wider than their column. High frames pin their top; low frames pin their
bottom, preserving the alternating arrangement that fills the screen.

## Scripts

| Command | Description |
| --- | --- |
| `bun run build` | ESM bundle + declarations + CSS into `dist/` |
| `bun run dev` | Watch build |
| `bun run typecheck` | TypeScript check |
| `bun run test` | Algorithm unit tests (Rstest) |
