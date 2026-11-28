# @ilovecode33/okr-web

A small, personal OKR tracker that runs in the browser. There is no account: objectives and key
results are stored in IndexedDB through `@ilovecode33/persistence` and loaded again on the next
visit. Two devices can join the same room link and sync changes in realtime through a Cloudflare
Durable Object WebSocket.

## Run locally

```sh
bunx turbo run dev --filter=@ilovecode33/okr-web...
```

The trailing `...` includes the workspace libraries: Turbo builds them once
(`dependsOn: ["^build"]`) and then keeps their `build --watch` tasks running alongside the app. Then
open [http://localhost:3201](http://localhost:3201).

Run the component specs with:

```sh
bunx turbo run test --filter=@ilovecode33/okr-web
```

## Structure

Every component keeps its implementation, CSS Module, and spec together with the same base name, per
[`frontend-project.md`](../../packages/ai-rules/frontend-project.md):

- `src/App.tsx`, `src/App.module.css`, `src/App.spec.tsx`
- `src/components/ObjectiveCard.tsx`, `.module.css`, `.spec.tsx`
- `src/components/ObjectiveEditor.tsx`, `.module.css`, `.spec.tsx`
- `src/components/KeyResultRow.tsx`, `.module.css`, `.spec.tsx`
- `src/components/SyncPanel.tsx`, `.module.css`, `.spec.tsx`
- `src/components/QrCode.tsx`, `.module.css`, `.spec.tsx`
- `src/realtime.ts` — the WebSocket room client
- `src/storage.ts` / `src/storage.spec.ts` — the IndexedDB adapter

There is no app-level global stylesheet and no manual UI stylesheet import: `UIFoundation` loads the
shared `styles.css` (tokens + base) internally, and component styles load with the component imports
because `@ilovecode33/ui` builds in bundleless mode.

## Features

- Objectives with weighted key results in percent, number, or currency units.
- Quarter buckets (`2026 Q4`) derived from the date window; an objective that crosses quarters
  appears under each one. Includes a quick 2-month preset and a day/percent countdown.
- Creation and update dates on every objective.
- English, Traditional Chinese, and German UI with a persisted language selector.
- Progress at key-result, objective, and overall level.
- Quarter and sort filters that are remembered across visits, plus an editable objective sheet and
  inline updates.
- Confirmed deletion of objectives and key results; the sample-data reset is available only in
  development.
- Light, dark, and system appearance with selectable accent color.
- The About settings automatically show the deployed latest version when one is available; **Update
  now** applies it only when chosen.
- IndexedDB persistence through `@ilovecode33/persistence`.
- Realtime two-device sync over a Cloudflare Durable Object WebSocket room, with automatic reconnect
  and readable device names.

## Device sync

Open **Sync** in the toolbar to start a room or join one.

1. On the first device, choose **Host**. A QR code and room link appear.
2. On the other device, scan the QR or open the copied link; it joins the room automatically.
3. Both panels show **Connected. Changes sync in realtime.**
4. Closing the Sync sheet keeps the room connected. Use **Disconnect** to stop.

The link is `https://<app>/#sync=<room>&key=<room-key>`. The room's latest encrypted state is stored
in the Cloudflare Durable Object and sent to every new connection. The AES-GCM key lives only in the
URL fragment, so it is never sent to Cloudflare; the Worker stores and relays ciphertext. Local
edits broadcast immediately to the other connected devices; there is no WebRTC/ICE negotiation. The
realtime Worker URL defaults to `https://sync.ilovecode33.fyi` and can be overridden with
`PUBLIC_SYNC_URL`.

### How updates merge

The first state received when joining a room replaces the local document; from then on every update
is merged, so two devices never overwrite each other's whole document:

- Objectives merge by `id`. A copy edited on both devices keeps the title, note, and dates from the
  newer `updatedAt`.
- Key results merge by `id` with their own `updatedAt`, so a progress update on one device and a
  title edit on another both survive.
- Deleting an objective or key result records a tombstone (`state.deleted`), so a device that was
  offline cannot bring it back.
- The merge is deterministic and commutative. When the merged result contains something the sender
  did not have, the receiving device sends it back once; a second merge then matches and the
  exchange stops.

Timestamps come from each device's clock, so a badly skewed clock can win or lose merges
unexpectedly. Tombstones are kept so offline devices cannot revive deleted items; the document stays
small for personal use.

Each device sends a readable name such as `Mac · Chrome` or `iPhone · Safari`. You can edit it in
**Sync → Device name**; the name and the last room are stored in the `okr-web` IndexedDB database
through `@ilovecode33/persistence` and shown in **Connected devices**.

The name in **Settings → Your name** is the document `profile`. Saving it updates the dashboard
title on every device in the room. Concurrent edits keep the copy with the newer `updatedAt`; an
empty name clears it. A name saved by the previous release under `state` → `user-name` is copied
into `profile` on the next load, and that key is removed only after the copy is written.

Room data is encrypted in the browser with AES-GCM. The key travels only in the URL fragment and
never reaches Cloudflare. The Worker stores ciphertext and revision metadata for up to 24 hours
after the last device leaves. Anyone who can open the full room link can join and decrypt, so treat
the link as a credential. No account password is required; the link itself is the bearer secret.

## Data

The first visit loads a small sample set. Changes are written to the `okr-web` IndexedDB database
immediately, so the tool works offline and keeps one user's data on that device only.

| Item                             | Where                                        | Shape                                                               |
| -------------------------------- | -------------------------------------------- | ------------------------------------------------------------------- |
| OKR document                     | IndexedDB `okr-web` v1 → `state` → `current` | `{ version: 1, objectives, deleted?, profile? }`                    |
| Backup of an unreadable document | `state` → `current.corrupt`                  | raw stored value                                                    |
| Saved sync room                  | `state` → `sync-room`                        | `{ version: 1, room, role, key }` (version-less records read as v1) |
| Device name                      | `state` → `device-name`                      | non-empty string                                                    |
| Filter view                      | `state` → `view`                             | `{ version: 1, period, sort }`                                      |
| Realtime room                    | Durable Object storage → `room`              | `{ recordVersion: 1, payload: { iv, data }, revision, updatedAt }`  |

The document is versioned (`CURRENT_STATE_VERSION`) and read through `parseState()`. It validates
every objective, runs registered migrations, and normalizes derived dates. A newer document is
refused and left untouched; a corrupt one is copied to `current.corrupt` before sample data replaces
it.

Existing data from the pre-IndexedDB `localStorage` key `okr-web.state.v1` is migrated on first load
and the old key is removed only after a successful read. The language choice is saved under
`okr-web.locale`. Clearing site data restores the sample set.

Every stored-shape change must follow
[`data-migrations.md`](../../packages/ai-rules/data-migrations.md).

## Deployment

Pull requests targeting `main` get a Cloudflare Pages preview at
`https://pr-<PR number>.ilovecode33-okr-web.pages.dev`, deployed by
[`.github/workflows/preview-okr-web.yml`](../../.github/workflows/preview-okr-web.yml). The preview
build points at the realtime Worker's workers.dev hostname so custom-domain DNS cannot block a
preview. Production uses `https://sync.ilovecode33.fyi`.

Production deploys from `main` with
[`.github/workflows/deploy-okr-web.yml`](../../.github/workflows/deploy-okr-web.yml) to
`https://okr.ilovecode33.fyi`. The realtime Worker deploys separately from
[`apps/okr-realtime`](../okr-realtime/README.md). See [`DEPLOYMENT.md`](DEPLOYMENT.md).
