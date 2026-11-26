# Git workflow — never push directly to `main`

Scope: every developer and AI agent in this repository, for every change.

## Rule

- **Never commit or push directly to `main`.** `main` is the integrated,
  released branch; it is not a working branch.
- Create a topic branch from an up-to-date `main` (for example
  `feat/short-name`, `fix/short-name`, `docs/short-name`) and commit there.
- Open a pull request targeting `main`. The PR must:
  - keep the required checks green (`preview` runs the blog build/deploy check);
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

GitHub branch protection on `main` should be enabled with: require a pull
request before merging, require status checks to pass (`preview`) with branches
up to date before merging, and block force pushes and deletions.

At the time of writing this repository is private on a GitHub plan where the
branch-protection API returns HTTP 403 ("Upgrade to GitHub Pro or make this
repository public"). Until protection is enabled by a repository admin, the PR
rule above plus the local hook are the enforced process. Update this section
when server-side protection becomes available.
