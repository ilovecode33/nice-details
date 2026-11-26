# Deployment — @ilovecode33/ui-landing

The component gallery is a static site deployed to Cloudflare Pages. **PR previews are enabled; production deployment is deliberately not enabled yet.** See the [app README](README.md) for an overview.

## PR previews

[`.github/workflows/preview-ui-landing.yml`](../../.github/workflows/preview-ui-landing.yml) runs on pull requests targeting `main`. It creates the `ilovecode33-ui` Pages project if it is absent, builds `@ilovecode33/ui-landing`, and deploys `apps/ui-landing/dist` under the branch `pr-<PR number>`. The workflow comments the preview URL on the PR.

The workflow has a fork guard: pull requests from forks do not get previews, because they cannot access the Cloudflare secrets.

## Production (not enabled)

The intended production hostname is `ui.ilovecode33.fyi`, to be attached as a custom domain to the `ilovecode33-ui` Pages project in the Cloudflare dashboard.

Production deployment is intentionally disabled for now:

- There is no push-to-main deploy workflow.
- There is no `workflow_dispatch` for triggering a production deploy manually.

The `main` branch and the production domain will be activated later by a separate change.

## Required GitHub secrets

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

These are the same secrets used by the blog workflows; no new secret is needed.

## Caching

[`public/_headers`](public/_headers) sets a one-year immutable cache for hashed `/static/*` assets. HTML is intentionally left unmatched, so every deployment serves fresh markup immediately.

## Manual Cloudflare dashboard step

The preview workflow creates the `ilovecode33-ui` Pages project on its first run. The remaining manual step is to attach `ui.ilovecode33.fyi` to that project as a custom domain when production is activated; no production deployment has been performed.

## Local commands

From the repository root:

```bash
bun install
bunx turbo run dev --filter=@ilovecode33/ui-landing    # dev server on port 3200 (rsbuild.config.ts)
bunx turbo run build --filter=@ilovecode33/ui-landing  # static output in apps/ui-landing/dist
bunx turbo run typecheck build                         # full repo typecheck + build check
```
