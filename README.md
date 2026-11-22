# @ilovecode33/nice-details

A monorepo where frontend apps and shared libraries coexist. English is the default language for documentation.

- **Workspace manager**: Bun workspaces (no Node/pnpm in this environment; Turborepo 2.11 supports Bun as a stable package manager)
- **Task runner**: Turborepo (caching + affected runs)
- **App builds**: Rsbuild (the official layer on top of Rspack, with dev server and HMR)
- **Library builds**: Rslib (based on Rspack, emits ESM + `.d.ts`)
- **Editor core**: Lexical (Meta's document model, with undo/redo, serialization, rich-text shortcuts)
- **React component library**: `@ilovecode33/ui`, built with Rslib; showcased in the landing page's **Component details** section
- **Landing page i18n**: app-level, with `en` (default), `zh-TW`, and `de`

## Structure

```
apps/
  editor/          # WYSIWYG editor demo (port 3000)
  blog/            # Blog using the SDK in readonly mode (port 3100)
  ui-landing/      # Component library landing page (port 3200)
packages/
  editor-core/     # @ilovecode33/editor-core, framework-agnostic editor SDK
  ui-tokens/       # @ilovecode33/ui-tokens, design tokens as data + generators
  ui-core/         # @ilovecode33/ui-core, platform-neutral state contracts
  ui/              # @ilovecode33/ui, React component library
    QUALITY.md     # Entry / exit criteria (HIG, mobile-first, touch-first)
    ROADMAP.md     # Component expansion plan and platform-neutral architecture
  ui-swift/        # SwiftUI skeleton (Swift package, not an npm workspace)
AGENTS.md          # Agent rules for this repository
```

Every package name uses the `@ilovecode33/` scope.

## Common commands

```bash
bun install
bun run dev                                            # start all apps
bunx turbo run dev --filter=@ilovecode33/editor-app     # editor (3000)
bunx turbo run dev --filter=@ilovecode33/blog           # blog (3100)
bunx turbo run dev --filter=@ilovecode33/ui-landing     # component landing page (3200)
bun run build                                          # topological build, cached in .turbo
bun run typecheck
```

App `tsconfig.json` files map paths directly to `editor-core/src` and `ui/src`, so editing a library shows hot updates without a separate build. Each library can still be built on its own to produce a publishable `dist/`.

## Editor SDK

```ts
import { createEditor } from '@ilovecode33/editor-core';

// Editable
const editor = createEditor({
  element,
  onChange: ({ html, text }) => console.log(html, text),
  onStateChange: ({ bold, italic, heading }) =>
    console.log(bold, italic, heading),
});

editor.bold();
editor.italic();
editor.setHeading(1); // 1 | 2 | 3; pressing the same level again returns to <p>

// Readonly (blog)
const readonly = createEditor({
  element,
  readonly: true,
  initialHTML: '<h1>Hallo world!</h1>',
});

readonly.isReadonly(); // true
```

In readonly mode no input listeners are attached and `bold()` / `italic()` / `setHeading()` are no-ops. `setHTML()` remains available so the host can load article content.

## Component library

```tsx
import {
  AccentProvider, Button, ThemeProvider, ThemeSwitcher, AccentSwitcher,
} from '@ilovecode33/ui';
import '@ilovecode33/ui/styles.css';

<ThemeProvider>
  <AccentProvider>
    <ThemeSwitcher />
    <AccentSwitcher />
    <Button variant="primary">Get started</Button>
  </AccentProvider>
</ThemeProvider>
```

The library includes Button, Card, Stack/Row, Segmented, SliderRow, Switch, Field, Select, TextInput, Stat, StatusStat, EmptyState, Sheet, NavBar, TabBar, List/ListRow, Disclosure, Divider, Badge, Chip, FormField, Checkbox, RadioGroup, TextArea, Stepper, NumberField, SearchBar, DatePicker, Toast, Banner, ActivityIndicator, Skeleton, ProgressBar, ActionSheet, AlertDialog, Popover, AspectImage, PhotoGrid, PhotoViewer, Avatar, Thumbnail, Carousel, plus Theme/Accent providers and switchers. All text is passed via props with English defaults; the library does not depend on any i18n package.

The landing page **Component details** section now shows these in real scenarios: upload overview, settings, album library, create-album form, upload progress, photo gallery, empty search, and delete confirmation.

Design values live in `@ilovecode33/ui-tokens` (CSS, JSON, and Swift generators); state models and reducers live in `@ilovecode33/ui-core`. The React package is a thin renderer over both. `packages/ui-swift` is a SwiftUI skeleton that mirrors the same contracts — build it with `swift build --package-path packages/ui-swift`. Regenerate tokens with `bun run generate` in `packages/ui-tokens`.

The design language uses translucent glass tokens (`--glass-*`) for chrome that floats above content: `GlassSurface` and `FloatingBar` reserve space in the host instead of occupying layout, while `DockNavigation` builds a collapsible, scrollable navigation dock on top of `FloatingBar`. `Deformable` and `useDeform` add directional drag deformation with a spring back, built into `Button` and floating surfaces. All motion and material values are tokens, and deformation is disabled under `prefers-reduced-motion`. `UIFoundation` is the single provider for theme, accent and locale. The host supplies plain dictionaries (the library has no i18n dependency); `useLocale()` exposes `locale`, `setLocale` and `t()`. Wrapped content disables text selection by default so it does not fight the elastic drag feedback — inputs, textareas and editable regions keep normal selection.

All component styles are CSS Modules. `cn()` maps class names to the generated local names, and the package build merges the global design tokens with the module output into a single `dist/styles.css`. Consumers can keep importing `@ilovecode33/ui/styles.css`.

The landing page uses a single floating footer dock as its only navigation; the component index and section links all live there instead of a separate header or sidebar.

`Select` is a custom dropdown (not a native `<select>`). Options accept `leading` / `trailing` React nodes — for example a color swatch next to each option — and it supports keyboard navigation, ARIA, and click-outside. Its `onChange` receives `{ target: { value } }` rather than a native `ChangeEvent<HTMLSelectElement>`.

```tsx
<Select
  value={tone}
  onChange={(event) => setTone(event.target.value)}
  options={TONES.map((item) => ({
    value: item.value,
    label: item.label,
    leading: <span className="ui-color-swatch" style={{ background: item.color }} />,
  }))}
/>
```

`<option>` children still work for backward compatibility, but `options` is preferred.

Before adding or changing a component, read [`packages/ui/QUALITY.md`](packages/ui/QUALITY.md). For the planned component expansion and the platform-neutral architecture that can back a future SwiftUI renderer, see [`packages/ui/ROADMAP.md`](packages/ui/ROADMAP.md). Agent-specific rules live in [`AGENTS.md`](AGENTS.md).

## Current scope

- ✅ Headings H1–H3, bold, italic
- ✅ Toolbar active state sync
- ✅ HTML / plain-text output
- ✅ Readonly display mode
- ✅ Undo / redo and JSON / HTML serialization (provided by Lexical)
- ❌ Multi-user collaboration (would require Lexical + Yjs)

## Blog deployment

The blog is deployed to Cloudflare Pages by `.github/workflows/deploy-blog.yml`
on pushes to `main`; pull requests get a preview deployment from
`.github/workflows/preview-blog.yml`. The client-side router uses
`apps/blog/public/_redirects` for direct visits to `/about`.

Caching is declared with Cloudflare Pages' native `apps/blog/public/_headers`
file: only hashed `/static/*` assets get a one-year immutable cache. HTML is
intentionally not matched, so it keeps Pages' `max-age=0, must-revalidate` and
every deployment refreshes immediately. No extra API token or zone-level
configuration is required.
