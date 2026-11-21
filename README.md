# @ilovecode33/nice-details

前端 apps / libs 共存的 monorepo。

- **Workspace manager**：Bun workspaces（環境沒有 Node/pnpm；Turborepo 2.11 已穩定支援 Bun）
- **Task runner**：Turborepo（快取 + affected）
- **App 構建**：Rsbuild（Rspack 的上層工具，自帶 dev server / HMR）
- **Lib 構建**：Rslib（基於 Rspack，產出 ESM + `.d.ts`）
- **編輯器核心**：Lexical（Meta 開源的文件模型，含 undo/redo、序列化、rich-text 快捷鍵）

## 結構

```
apps/
  editor/          # WYSIWYG 編輯器範例（port 3000）
  blog/            # 博客，用 SDK readonly 模式展示文章（port 3100）
packages/
  editor-core/     # @ilovecode33/editor-core，框架無關的編輯器 SDK
```

所有 package name 都用 `@ilovecode33/` scope。

## 常用指令

```bash
bun install
bun run dev                 # 啟動所有 app
bunx turbo run dev --filter=@ilovecode33/editor-app
bunx turbo run dev --filter=@ilovecode33/blog   # http://localhost:3100
bun run build               # Turbo 依依賴順序構建，輸出快取到 .turbo
bun run typecheck
```

要注意：app 的 `tsconfig.json` 用 `paths` 直接指向 `editor-core/src`，因此改 SDK 後不用先 build lib 就能看到熱更新；`editor-core` 仍可單獨 build 產出可發布的 `dist/`。

## SDK 用法

```ts
import { createEditor } from '@ilovecode33/editor-core';

// 可編輯
const editor = createEditor({
  element,
  onChange: ({ html, text }) => console.log(html, text),
  onStateChange: ({ bold, italic, heading }) => console.log(bold, italic, heading),
});

editor.bold();
editor.italic();
editor.setHeading(1); // 1 | 2 | 3，再按一次同層級會切回 <p>

// 唯讀（博客）
const readonly = createEditor({
  element,
  readonly: true,
  initialHTML: '<h1>Hallo world!</h1>',
});

readonly.isReadonly(); // true
```

唯讀模式下不會掛輸入監聽，`bold()` / `italic()` / `setHeading()` 都是 no-op；`setHTML()` 仍可由宿主用來載入文章內容。

## 目前範圍

- ✅ 標題 H1–H3、粗體、斜體
- ✅ 工具列 active 狀態同步
- ✅ 內容 HTML / 純文字輸出
- ✅ readonly 展示模式
- ✅ undo / redo、JSON / HTML 序列化（由 Lexical 提供）
- ❌ 多人協作 / 協同編輯（要做的話可接 Lexical + Yjs）
