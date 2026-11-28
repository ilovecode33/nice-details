# Deployment — @ilovecode33/okr-web

The OKR tracker is a static site on Cloudflare Pages. Realtime sync uses a separate Cloudflare
Worker with a Durable Object room. See the [app README](README.md) for an overview.

## URLs

| Purpose                    | URL                                                    |
| -------------------------- | ------------------------------------------------------ |
| Production app             | `https://okr.ilovecode33.fyi`                          |
| Production realtime Worker | `https://sync.ilovecode33.fyi`                         |
| PR app preview             | `https://pr-<PR number>.ilovecode33-okr-web.pages.dev` |

## PR previews

[`.github/workflows/preview-okr-web.yml`](../../.github/workflows/preview-okr-web.yml) runs on pull
requests targeting `main`. It builds `@ilovecode33/okr-web`, deploys `apps/okr-web/dist` under
`pr-<PR number>`, and comments the Pages URL on the PR.

Preview deployments use the production realtime Worker through its workers.dev hostname
(`https://ilovecode33-okr-realtime.2y6ddt55g7.workers.dev`) so custom-domain DNS changes cannot
block a preview. Production uses `https://sync.ilovecode33.fyi`. Rooms are random and scoped to the
link, so a preview and production do not share state unless someone opens the same room link. No
per-PR Worker is deployed.

The workflow has a fork guard: pull requests from forks do not get previews, because they cannot
access the Cloudflare secrets.

## Production

[`.github/workflows/deploy-okr-web.yml`](../../.github/workflows/deploy-okr-web.yml) deploys `main`
to the Pages project with `--branch=main`. The `okr.ilovecode33.fyi` custom domain is attached to
the project.

## Realtime Worker

- Worker: `ilovecode33-okr-realtime`
- Source: `apps/okr-realtime`
- Production domain: `sync.ilovecode33.fyi` (Workers custom domain)
- Deploy:
  [`.github/workflows/deploy-okr-realtime.yml`](../../.github/workflows/deploy-okr-realtime.yml) on
  pushes to `main`

The Worker has a `SyncRoom` Durable Object. Each room stores the latest encrypted OKR payload and
broadcasts changes over WebSocket. It keeps ciphertext and revision metadata for up to 24 hours
after the last device leaves; the AES-GCM key stays in the URL fragment and never reaches the
Worker. The origin allowlist accepts `https://okr.ilovecode33.fyi`, Pages preview/production
domains, and `localhost`.

The room record is versioned independently (`ROOM_RECORD_VERSION` in
`apps/okr-realtime/src/room.ts`). Records written before versioning are read as version 1. Because
the payload is opaque ciphertext, changing the OKR document shape requires only a client migration —
the Worker never rewrites stored documents. Changes to the record envelope itself need a reader that
accepts the previous shape.

## Data migrations

Persisted shapes (IndexedDB document, saved sync room, room record) follow
[`data-migrations.md`](../../packages/ai-rules/data-migrations.md). Before releasing a change that
alters a stored shape: bump the matching version constant, register the migration, keep old records
readable, refuse newer records, and add tests for old, corrupt, and newer data.

## Required GitHub secrets

- `CLOUDFLARE_API_TOKEN` — Pages deployments
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_WORKERS_API_TOKEN` — realtime Worker deploys; requires Workers Scripts:Edit and
  Durable Objects:Edit

Without the Workers token, the realtime Worker deploy is skipped; the Pages app still deploys.

## Cloudflare resources

- Pages project: `ilovecode33-okr-web`
- DNS: `okr.ilovecode33.fyi` CNAME → `ilovecode33-okr-web.pages.dev` (proxied)
- Worker: `ilovecode33-okr-realtime`
- Worker custom domain: `sync.ilovecode33.fyi`

No GitHub-to-Cloudflare Git integration is required. Deployments are Direct Upload through
`wrangler` and the API token.

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
