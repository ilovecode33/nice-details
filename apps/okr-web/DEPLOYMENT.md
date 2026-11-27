# Deployment — @ilovecode33/okr-web

The OKR tracker is a static site deployed to Cloudflare Pages. **PR previews are enabled; production deployment is not enabled yet.** See the [app README](README.md) for an overview.

## PR previews

[`.github/workflows/preview-okr-web.yml`](../../.github/workflows/preview-okr-web.yml) runs on pull requests targeting `main`. It creates the `ilovecode33-okr-web` Pages project if it is absent, builds `@ilovecode33/okr-web`, and deploys `apps/okr-web/dist` under the branch `pr-<PR number>`. The workflow comments the preview URL on the PR.

Each PR gets a stable alias at `https://pr-<PR number>.ilovecode33-okr-web.pages.dev`, plus a unique deployment URL. The alias follows the latest successful preview for that PR.

The workflow has a fork guard: pull requests from forks do not get previews, because they cannot access the Cloudflare secrets.

Because previews are served over HTTPS, the camera QR scanner and WebRTC pairing work on phones without a local certificate. The app still stores its data in each browser's IndexedDB, so a preview URL has its own local data.

## Production (not enabled)

The Pages project is `ilovecode33-okr-web` with `main` as its production branch. Production deployment is intentionally disabled for now:

- There is no push-to-main deploy workflow.
- There is no `workflow_dispatch` for triggering a production deploy manually.

A production hostname can be attached to the project later without changing the preview workflow.

## Required GitHub secrets

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

These are the same secrets used by the blog and UI landing workflows; no new secret is needed.

## Cloudflare project

The Pages project already exists in the Cloudflare account:

- Project: `ilovecode33-okr-web`
- Preview branch pattern: `pr-<PR number>`
- Production branch: `main` (no production deployment yet)

No GitHub-to-Cloudflare Git integration is required: the workflow deploys with Direct Upload through `wrangler pages deploy` and the existing API token. The "Ensure Pages project exists" step is idempotent, so it can recreate the project if it is ever deleted.

## Signaling relay

The app uses a separate Cloudflare Worker for one-scan pairing:

- Worker: `ilovecode33-okr-sync`
- URL: `https://ilovecode33-okr-sync.2y6ddt55g7.workers.dev`
- Source: `apps/sync-relay`
- Deploy: [`.github/workflows/deploy-sync-relay.yml`](../../.github/workflows/deploy-sync-relay.yml) on pushes to `main`

The Worker has a `PairRoom` Durable Object that relays WebRTC offer/answer messages. OKR data stays peer-to-peer after signaling. The Worker's origin allowlist accepts the Pages preview/production domains and `localhost`.

Preview deployments use the same relay; they do not deploy their own copy. If a PR changes the relay protocol, merge/deploy the relay before testing that PR's preview.

## Local commands

From the repository root:

```bash
bun install
bunx turbo run dev --filter=@ilovecode33/okr-web... # dev server on port 3201
bunx turbo run build --filter=@ilovecode33/okr-web  # static output in apps/okr-web/dist
bunx turbo run typecheck build test                 # full repo check
```

To inspect the production bundle locally:

```bash
bunx turbo run build --filter=@ilovecode33/okr-web
python3 -m http.server 3211 --directory apps/okr-web/dist
# open http://localhost:3211
```
