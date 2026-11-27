# Deployment — @ilovecode33/okr-web

The OKR tracker is a static site on Cloudflare Pages, with a separate Cloudflare Worker for one-scan pairing. See the [app README](README.md) for an overview.

## URLs

| Purpose | URL |
| --- | --- |
| Production app | `https://okr.ilovecode33.fyi` |
| Production relay | `https://sync.ilovecode33.fyi` |
| PR app preview | `https://pr-<PR number>.ilovecode33-okr-web.pages.dev` |
| PR relay preview | `https://ilovecode33-okr-sync-pr-<PR number>.2y6ddt55g7.workers.dev` |

## PR previews

[`.github/workflows/preview-okr-web.yml`](../../.github/workflows/preview-okr-web.yml) runs on pull requests targeting `main`.

1. Deploys a PR-specific signaling Worker named `ilovecode33-okr-sync-pr-<PR number>`.
2. Builds `@ilovecode33/okr-web` with `PUBLIC_SYNC_RELAY_URL` pointing at that Worker.
3. Deploys `apps/okr-web/dist` to the `ilovecode33-okr-web` Pages project under `pr-<PR number>`.
4. Comments the Pages preview URL on the PR.

Each PR gets a stable Pages alias and its own relay, so a preview never uses the production relay. [`.github/workflows/cleanup-okr-sync-relay.yml`](../../.github/workflows/cleanup-okr-sync-relay.yml) deletes the PR Worker when the PR closes.

The workflow has a fork guard: pull requests from forks do not get previews, because they cannot access the Cloudflare secrets.

Because previews are served over HTTPS, the camera QR scanner and WebRTC pairing work on phones without a local certificate. The app still stores its data in each browser's IndexedDB, so a preview URL has its own local data.

## Production

[`.github/workflows/deploy-okr-web.yml`](../../.github/workflows/deploy-okr-web.yml) deploys `main` to the Pages project with `--branch=main`. The `okr.ilovecode33.fyi` custom domain is attached to the project. The production build uses the default relay URL `https://sync.ilovecode33.fyi`.

## Signaling relay

- Worker: `ilovecode33-okr-sync`
- Source: `apps/sync-relay`
- Production domain: `sync.ilovecode33.fyi` (attached as a Workers custom domain)
- Production deploy: [`.github/workflows/deploy-sync-relay.yml`](../../.github/workflows/deploy-sync-relay.yml) on pushes to `main`
- PR deploy: the preview workflow deploys a per-PR Worker

The Worker has a `PairRoom` Durable Object that relays WebRTC offer/answer messages. OKR data stays peer-to-peer after signaling. The origin allowlist accepts `https://okr.ilovecode33.fyi`, Pages preview/production domains, and `localhost`.

## Required GitHub secrets

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

These are the same secrets used by the blog and UI landing workflows. The token needs:

- Pages:Edit (Pages deployments)
- Workers Scripts:Edit (Worker + PR preview deploys)
- Durable Objects:Edit (the `PairRoom` binding)
- DNS:Edit only if the workflows are extended to manage DNS; the current records are already attached.

## Cloudflare resources

- Pages project: `ilovecode33-okr-web`
- DNS: `okr.ilovecode33.fyi` CNAME → `ilovecode33-okr-web.pages.dev` (proxied)
- Worker: `ilovecode33-okr-sync`
- Worker custom domain: `sync.ilovecode33.fyi`

No GitHub-to-Cloudflare Git integration is required. Deployments are Direct Upload through `wrangler` and the API token. The "Ensure Pages project exists" step is idempotent.

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
