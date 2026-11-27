# @ilovecode33/sync-relay

A tiny Cloudflare Worker that relays WebRTC offers and answers so two devices can pair with a single QR scan. The relay never sees OKR data: after signaling, the app talks over a peer-to-peer WebRTC data channel.

## Why

WebRTC needs both an offer and an answer. Without a signaling service, the answer has to travel back by a second QR scan or a pasted code. This Worker keeps the answer exchange automatic, so the host only displays one QR and the guest only scans it once.

## Protocol

- `GET /health` returns `{ "ok": true }`.
- `GET /ws?room=<id>&role=host|guest` upgrades to a WebSocket.
- Rooms use Durable Objects. A host must connect before a guest; the latest offer is stored so a guest that scans later still receives it.
- The host sends `{ "type": "offer", "payload": ... }`; the guest sends `{ "type": "answer", "payload": ... }`. The relay forwards each message to the other role.
- The relay rejects the wrong role, oversized messages, and origins outside the OKR Pages project.

## Local development

```sh
bunx turbo run dev --filter=@ilovecode33/sync-relay
```

Wrangler serves the Worker on its own port and prints the URL. The client's `relayUrl` can point at it, but the browser origin allowlist currently permits the Pages preview/production domains and localhost.

## Deploy

```sh
bunx turbo run build --filter=@ilovecode33/sync-relay  # dry-run bundle in dist/
cd apps/sync-relay && bunx wrangler deploy
```

The GitHub Actions workflow [`.github/workflows/deploy-sync-relay.yml`](../../.github/workflows/deploy-sync-relay.yml) deploys on pushes to `main` using the shared `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` secrets.

Production Worker: `https://ilovecode33-okr-sync.2y6ddt55g7.workers.dev`

## Configuration

- `wrangler.jsonc` defines the `PAIR_ROOM` Durable Object binding and the SQLite-backed `PairRoom` export.
- `src/protocol.ts` contains the room/origin/message validation and its unit tests.
- `src/room.ts` implements the Durable Object.

## Commands

```sh
bunx turbo run typecheck --filter=@ilovecode33/sync-relay
bunx turbo run test --filter=@ilovecode33/sync-relay
bunx turbo run build --filter=@ilovecode33/sync-relay
```
