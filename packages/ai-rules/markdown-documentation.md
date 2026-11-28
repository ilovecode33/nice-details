# Markdown documentation

Scope: every Markdown document tracked in this repository.

- Keep project documentation in English, as required by [`AGENTS.md`](../../AGENTS.md).
- Format all Markdown documents with `bun run format:md`.
- Check formatting and Markdown rules with `bun run check:md`; this runs Prettier in check mode and
  markdownlint-cli2.
- Run `bun run check:md` before opening or updating a pull request. The Markdown workflow runs the
  same check in CI.
- Configuration and ignores live in `.prettierrc.json`, `.prettierignore`, and
  `.markdownlint-cli2.jsonc` at the repository root. Generated output and installed dependencies are
  excluded.
