# @ilovecode33/ui-tokens

Single source of truth for the UI family's design token values, with dev-time generators for CSS
custom properties, JSON and SwiftUI constants.

## Usage

```ts
import { ACCENTS, ACCENT_PALETTES, SPACING, buildCssVariables } from "@ilovecode33/ui-tokens";
import "@ilovecode33/ui-tokens/styles.css";

console.log(ACCENTS, ACCENT_PALETTES.warmth.light.accent, SPACING.s4);
const css = buildCssVariables(); // same variable block as the generated sheet
```

Within this repository the package is a workspace dependency
(`bun add @ilovecode33/ui-tokens@workspace:*`). `./styles.css` points at the generated
`generated/styles.css`; the JavaScript entry point has no runtime dependencies or DOM access.

## Exports

Token data includes `ACCENTS`, `Accent`, `DEFAULT_ACCENT`, `ACCENT_PALETTES`, `SURFACES`, `GLASS`,
`GLASS_METRICS`, `SPACING`, `RADII`, `TYPOGRAPHY`, `MOTION`, `TOUCH`, `SAFE_AREA`, `DERIVED` and
`DERIVED_LIGHT`, plus their CSS variable name maps (`SURFACE_VARS`, `PALETTE_VARS`, `GLASS_VARS`,
`DERIVED_VARS`, `DERIVED_LIGHT_VARS`).

The generators `buildCssVariables`, `buildTokensJson` and `buildSwiftTokens` are exported for reuse.
Running `bun run generate` from this directory rewrites the checked-in outputs:

- `generated/styles.css` — light, dark and system themes plus the scales and derived recipes.
- `generated/tokens.json` — all groups serialized for non-web clients.
- `generated/Tokens.swift` — SwiftUI `UITokens` constants; CSS `var()`/`color-mix()` recipes stay as
  strings.

## Relationship to the other ui-* packages

- `@ilovecode33/ui` imports this package's stylesheet and inlines it into its published
  `dist/styles.css`.
- `@ilovecode33/ui-types` uses the exported `Accent` union for its theme/accent contracts.
- `@ilovecode33/ui-core` implements behavior over those types; it does not read token values
  directly.
- All four packages share one version through the Changesets fixed group, so a token change bumps
  the whole UI family.

## Tests

There is no test script or spec suite in this workspace; correctness is checked by typecheck, build
and reviewing generated output.

## Development

```sh
bunx turbo run typecheck build test --filter=@ilovecode33/ui-tokens
bun run generate
```

The `test` task is currently a no-op here because the package has no `test` script; use
`bunx turbo run typecheck build --filter=@ilovecode33/ui-tokens` to run only defined tasks.

## Docs

- [Changelog](./CHANGELOG.md)
- [Repository README](../../README.md)
- [Releasing](../../RELEASING.md)
- [AI rules and component criteria](../../packages/ai-rules/README.md)
