# Deployment workflows

Scope: every production deploy workflow in `.github/workflows/` (currently `deploy-okr-web`,
`deploy-blog` and `deploy-okr-realtime`) and the release workflow that dispatches them.

## Why

A push to `main` that still carries a releasable changeset contains new content but the previous
version number. Deploying it publishes new content under a stale version; the version commit then
deploys again. In between, users see a wrong version and false update prompts. Content and its final
version must go live together.

## Rules

- **Every production deploy workflow must gate on a pending version bump.** Run the shared
  [`pending-release`](../../.github/actions/pending-release/action.yml) action right after checkout
  and put `if: steps.gate.outputs.skip != 'true'` on every following step (setup, install, build and
  deploy). Do not copy the detection script into a workflow.
- A `push` to `main` with a releasable changeset (a non-`README.md` file in `.changeset/` that lists
  a package with `major`, `minor` or `patch`) is skipped. Empty changesets do not skip, because they
  produce no version commit. `workflow_dispatch` never skips.
- `.github/workflows/release.yml` must dispatch **every** production deploy workflow for the version
  commit, because a push made with `GITHUB_TOKEN` does not trigger other workflows. When you add a
  deploy workflow, add it to the dispatch loop in the `Deploy the version commit` step.
- Every deploy workflow declares its own `concurrency` group (`deploy-<name>`) with
  `cancel-in-progress: false`, so an older run can never finish after a newer one and overwrite it.
- Pull request preview workflows are not production deploys and are not gated.
- New deploy workflows keep `workflow_dispatch` so an operator can deploy by hand when the version
  PR cannot merge.

## Checklist for a new deploy workflow

```md
- [ ] Calls `./.github/actions/pending-release` after checkout and gates every later step on it
- [ ] Has `workflow_dispatch` and its own non-cancelling `concurrency` group
- [ ] Added to the dispatch loop in `release.yml`
- [ ] Documented in the app's `DEPLOYMENT.md` and in `RELEASING.md` if the rule changes
```
