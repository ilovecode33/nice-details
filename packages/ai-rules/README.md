# @ilovecode33/ai-rules

Private, unpublished workspace that indexes the project's AI rules as topic-based Markdown
documents.

Project-level AI rules for this repository. This workspace holds the rules as plain Markdown
documents, split by topic so an agent can open only what it needs. [`AGENTS.md`](../../AGENTS.md)
remains the agent entry point; it points here instead of duplicating rule content.

Do not copy these principles into landing pages, demos, product UI, or component stories — they are
rules for developers and agents, not user-facing copy.

## Rule index

| Rule                                                           | Scope                                                                                             |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| [Design principles](design-principles.md)                      | HIG principle mapping; applies to all UI work                                                     |
| [Mobile-first](mobile-first.md)                                | Phone base, 375px, touch sizes, safe areas                                                        |
| [User-first / touch-first](user-first.md)                      | Feedback, keyboard parity, contrast, reduced motion                                               |
| [Frontend project conventions](frontend-project.md)            | CSS Modules only, same-name component/style/test files — every frontend app and UI package        |
| [Markdown documentation](markdown-documentation.md)            | Bun commands for formatting and linting every Markdown document                                   |
| [Floating surfaces and gesture feedback](floating-surfaces.md) | Glass material, halos/portals, drag deformation, button and segmented recipes — `@ilovecode33/ui` |
| [Component entry criteria](component-entry.md)                 | What must be true before a new component is merged — `@ilovecode33/ui`                            |
| [Release exit criteria](release-exit.md)                       | What must be checked before a release — `@ilovecode33/ui`                                         |
| [Deprecation and removal](deprecation.md)                      | When to deprecate or remove a component — `@ilovecode33/ui`                                       |
| [PR checklist](pr-checklist.md)                                | Copyable checklist for component PRs                                                              |
| [Photo wall](photo-wall.md)                                    | File layout, tests, and public API rules — `@ilovecode33/photo-wall`                              |
| [Editor core](editor-core.md)                                  | Framework-agnostic Lexical SDK rules — `@ilovecode33/editor-core`                                 |
| [Git workflow](git-workflow.md)                                | Never push directly to `main`; branch, PR, checks, changesets                                     |
| [Deployment workflows](deployment.md)                          | Gate production deploys on pending changesets, dispatch them after the version commit             |
| [Persisted data and migrations](data-migrations.md)            | Version every stored shape; keep old records readable, back up unreadable ones, refuse newer ones |

## Updating rules

Edit the relevant file in this workspace, then update any reference in
[`AGENTS.md`](../../AGENTS.md), [`README.md`](../../README.md) or
[`packages/ui/ROADMAP.md`](../ui/ROADMAP.md). Keep the files in English.

## Links

- [CHANGELOG.md](CHANGELOG.md) — release history
- [Repository README](../../README.md) and [RELEASING.md](../../RELEASING.md)
