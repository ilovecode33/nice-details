# Git workflow — never push directly to `main`

Scope: every developer and AI agent in this repository, for every change.

## Rule

- **Never commit or push directly to `main`.** `main` is the integrated,
  released branch; it is not a working branch.
- Create a topic branch from an up-to-date `main` (for example
  `feat/short-name`, `fix/short-name`, `docs/short-name`) and commit there.
- Open a pull request targeting `main`. The PR must:
  - keep the required checks green (`preview` for the blog, `preview-ui` for
    ui-landing, and `preview-okr-web` for the OKR app);
  - include a changeset for any change that affects a workspace, or an empty
    changeset when the change genuinely needs no release (see
    [`RELEASING.md`](../../RELEASING.md));
  - be merged with squash so each PR becomes one clean commit on `main`.
- Never force-push to `main`, rewrite its history, or delete it.
- Release commits produced by `bun run version:packages` also land through a
  PR — do not push them directly.
- An emergency direct push is only acceptable with repository-admin approval
  and must be followed by a retroactive PR describing the change.

## Local guard

Run once per clone:

```bash
bun run hooks:install
```

This sets `core.hooksPath` to `.githooks`. The `pre-push` hook rejects any push
whose remote ref is `refs/heads/main`, regardless of the local branch. It is a
safety net for accidents, not a substitute for server-side protection.

## Server-side protection

GitHub branch protection on `main` is enabled (the repository is public):
pull requests are required before merging, the `preview`, `preview-ui` and
`preview-okr-web` status checks must pass, and branches must be up to date with
`main`, and force pushes and deletion of `main` are blocked. Squash merges are
used to keep one commit per PR.

The local `pre-push` hook remains as an early warning; server-side protection
is the authoritative enforcement.
