# @ilovecode33/editor-core

A framework-agnostic Lexical SDK that mounts a rich-text editor on an element and exposes a small typed controller for formatting, state and serialization.

## Install

```bash
bun add @ilovecode33/editor-core
```

Lexical 0.53 packages (`lexical`, `@lexical/html`, `@lexical/history`, `@lexical/rich-text`, `@lexical/selection`) are regular dependencies. Import `createEditor` and, if needed, the exported types:

```ts
import { createEditor, type EditorController } from '@ilovecode33/editor-core';
```

## Usage

```ts
const editor: EditorController = createEditor({
  element,
  onChange: ({ html, text }) => console.log(html, text),
  onStateChange: ({ bold, italic, heading }) => console.log(bold, italic, heading),
});

editor.bold();
editor.italic();
editor.setHeading(1); // 1 | 2 | 3; the same level again returns to a paragraph

editor.getHTML();
editor.getText();
editor.getState();
editor.focus();
editor.destroy(); // unregisters listeners and detaches the root
```

Readonly mode (used by the blog app) attaches no input listeners and ignores formatting commands; `setHTML` still lets the host load content:

```ts
const readonly = createEditor({
  element,
  readonly: true,
  initialHTML: '<h1>Hello world</h1>',
});
readonly.isReadonly(); // true
```

## What it provides

- `createEditor(options): EditorController` — mounts a Lexical editor on the supplied `HTMLElement`, registers rich text, history (undo/redo) and update listeners, and returns a controller.
- Formatting: `bold()`, `italic()` and `setHeading(1 | 2 | 3)` with toolbar-ready active state.
- Synchronous snapshots: `setHTML()` commits discretely, so `getHTML()` / `getText()` / `getState()` see the new state immediately, including `initialHTML` during creation.
- `onChange({ html, text })` and `onStateChange({ bold, italic, heading })` callbacks, plus `focus()`, `isReadonly()` and `destroy()` lifecycle methods.
- Local exported types in `src/types.ts` (`EditorOptions`, `EditorController`, `EditorSnapshot`, `EditorState`, `HeadingLevel`); no i18n or UI framework dependency.
- Colocated `editor.spec.ts` contract tests running in happy-dom.

## Development

| Command | Description |
| --- | --- |
| `bun run build` | ESM bundle and declarations into `dist/` |
| `bun run dev` | Watch build |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run test` | Rstest contract tests (happy-dom); repo-wide: `bunx turbo run typecheck build` |

## Links

- [CHANGELOG.md](CHANGELOG.md) — release history
- [Repository README](../../README.md) and [RELEASING.md](../../RELEASING.md)
- [Editor core rules](../ai-rules/editor-core.md) and [AI rule index](../ai-rules/README.md)
