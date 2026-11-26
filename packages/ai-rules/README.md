# @ilovecode33/ai-rules

Workspace that manages the repository's AI-agent rules. It is an **index and
validator**, not a second rule source: the rules themselves live only in the
root [`AGENTS.md`](../../AGENTS.md) and [`QUALITY.md`](../../QUALITY.md).

## Rule sources

| File | Scope |
|---|---|
| [`AGENTS.md`](../../AGENTS.md) | Agent workflow, language, design principles, engineering commands, definition of done |
| [`QUALITY.md`](../../QUALITY.md) | Project-wide quality criteria, component entry/exit checks, release checks, PR checklist |

Do not duplicate principle text here or in product UI; update the two root
documents instead and keep this index pointing at them.

## Consistency check

```bash
bun run check          # from this package
bunx turbo run check   # from the repository root
```

The check verifies that:

- both root rule documents exist and no markdown still references the old
  package-local quality document path;
- every UI component has a colocated `.spec.tsx`, that spec contains a
  `matches its structural snapshot` case, and the matching `.snap` file exists;
- every UI hook has a colocated `.spec.tsx`.

Run it after adding or moving components, hooks, or rule documents.
