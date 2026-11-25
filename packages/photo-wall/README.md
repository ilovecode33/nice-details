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

## The virtual light

A soft ceiling light is part of the scene. It is defined in the same coordinate
systems as the frames — `x` in tile-percent, `y` in stage-percent (negative is
above the screen), `z` in virtual-stage px, plus an emitter `radius` in cqw and
an `intensity`:

```ts
import { DEFAULT_LIGHT, computeFrameLighting } from '@ilovecode33/photo-wall';

<PhotoWall light={{ ...DEFAULT_LIGHT, x: 25, y: -20, z: 500, intensity: 0.8 }} />
```

Changing the prop updates every shadow immediately; tiles do not need to be
regenerated. The solver is exported as a pure function so the same maths can be
used by a control panel or a non-React renderer.

### Several lights

Pass an array to `lights` (it overrides `light`). Each light is solved
independently and contributes **its own shadow layer**, so overlapping shadows
accumulate instead of replacing one another — the linear superposition of
independent sources. Bevel highlights add together and saturate at the existing
0.4 ceiling. The wall wash gets one gradient per light, tinted by its optional
`glowColor` (an RGB triplet such as `'214, 232, 255'`).

```tsx
<PhotoWall
  lights={[
    { ...DEFAULT_LIGHT, x: 22, glowColor: '255, 244, 214' },
    { ...DEFAULT_LIGHT, x: 50, z: 480, intensity: 0.6, glowColor: '214, 232, 255' },
    { ...DEFAULT_LIGHT, x: 78, z: 420, intensity: 0.4, glowColor: '255, 224, 196' },
  ]}
/>
```

```ts
import { computeFrameLightingMulti, computeWallGlows } from '@ilovecode33/photo-wall';

const { shadows, highlight } = computeFrameLightingMulti({ frame, geometry, lights, params, aspect });
// shadows[i] belongs to lights[i]; render each as one CSS box-shadow layer.
```

No light changes the geometry of another light's shadow; it only adds a new
darkening layer or a share of the brightness. That keeps the solver O(lights)
and makes adding a light purely additive.

How each shadow is derived:

1. **Direction and throw — pinhole projection.** The ray from the light through
   the frame centre hits the wall (z = 0) at `L + t(F - L)`, with
   `t = Lz / (Lz - Fz)`. The shadow offset is `(t - 1)(F - L)`: it points away
   from the light and grows with both the frame's depth and its distance from
   the light axis.
2. **Softness — penumbra of an area light.** By similar triangles a radius-`r`
   emitter casts a penumbra of `r · Fz / (Lz - Fz)` on the wall. The same
   `t - 1` factor therefore drives the throw and the blur: prints near the
   wall keep a crisp contact shadow, prints nearer the light get a long, soft
   one.
3. **Strength — normalised falloff.** Inverse-square attenuation in raw pixels
   would erase the shadows of edge frames, because the wall is ~1.6 viewport
   widths across while the light sits much closer than that. A normalised
   scene distance dims off-axis frames gently while keeping every shadow
   visible. The light's cosine against the frame normal drives the bevel
   highlight.

All outputs are in cqw or dimensionless, so the scaled console preview and the
fullscreen TV resolve identically. `computeWallGlow` maps the light onto the
wall's wash gradient using stage percentages for the same reason.

The original `shadowX*`, `shadowY*`, `shadowBlur*` and `shadowSpread*` tuning
fields are still honoured: each acts as a gain over its geometric counterpart,
normalised so the default values are exactly 1×. Existing console sliders keep
working without any migration.

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
