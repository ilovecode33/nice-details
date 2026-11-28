# @ilovecode33/okr-web

A small, personal OKR tracker that runs in the browser. There is no account:
objectives and key results are stored in IndexedDB through
`@ilovecode33/persistence` and loaded again on the next visit. Two devices can
join the same room link and sync changes in realtime through a Cloudflare
Durable Object WebSocket.

## Run locally

```sh
bunx turbo run dev --filter=@ilovecode33/okr-web...
```

The trailing `...` includes the workspace libraries: Turbo builds them once
(`dependsOn: ["^build"]`) and then keeps their `build --watch` tasks running
alongside the app. Then open http://localhost:3201.

Run the component specs with:

```sh
bunx turbo run test --filter=@ilovecode33/okr-web
```

## Structure

Every component keeps its implementation, CSS Module, and spec together with the
same base name, per
[`frontend-project.md`](../../packages/ai-rules/frontend-project.md):

- `src/App.tsx`, `src/App.module.css`, `src/App.spec.tsx`
- `src/components/ObjectiveCard.tsx`, `.module.css`, `.spec.tsx`
- `src/components/ObjectiveEditor.tsx`, `.module.css`, `.spec.tsx`
- `src/components/KeyResultRow.tsx`, `.module.css`, `.spec.tsx`
- `src/components/SyncPanel.tsx`, `.module.css`, `.spec.tsx`
- `src/components/QrCode.tsx`, `.module.css`, `.spec.tsx`
- `src/realtime.ts` — the WebSocket room client
- `src/storage.ts` / `src/storage.spec.ts` — the IndexedDB adapter

There is no app-level global stylesheet and no manual UI stylesheet import:
`UIFoundation` loads the shared `styles.css` (tokens + base) internally, and
component styles load with the component imports because `@ilovecode33/ui`
builds in bundleless mode.

## Features

- Objectives with weighted key results in percent, number, or currency units.
- Date-based periods with a quick 2-month preset, plus a day/percent countdown.
- Creation and update dates on every objective.
- English, Traditional Chinese, and German UI with a persisted language selector.
- Progress at key-result, objective, and overall level.
- Period and sort filters, with an editable objective sheet and inline updates.
- Confirmed deletion of objectives and key results; the sample-data reset is
  available only in development.
- Light, dark, and system appearance with selectable accent color.
- IndexedDB persistence through `@ilovecode33/persistence`.
- Realtime two-device sync over a Cloudflare Durable Object WebSocket room, with
  automatic reconnect and readable device names.

## Device sync

Open **Sync** in the toolbar to start a room or join one.

1. On the first device, choose **Host**. A QR code and room link appear.
2. On the other device, scan the QR or open the copied link; it joins the room
   automatically.
3. Both panels show **Connected. Changes sync in realtime.**
4. Closing the Sync sheet keeps the room connected. Use **Disconnect** to stop.

The link is `https://<app>/#sync=<room>`. The room's latest state is stored in
the Cloudflare Durable Object and sent to every new connection, so a late join
or reconnect picks up the current data. Local edits broadcast immediately to the
other connected devices; there is no WebRTC/ICE negotiation. The realtime Worker
URL defaults to `https://sync.ilovecode33.fyi` and can be overridden with
`PUBLIC_SYNC_URL`.

Each device sends a readable name such as `Mac · Chrome` or `iPhone · Safari`.
You can edit it in **Sync → Device name**; the name is stored under
`okr-web.device-name` and shown in **Connected devices**.

Room data passes through the Cloudflare Worker while connected. It is scoped to
the random room id and retained for up to 24 hours after the last device leaves.
Anyone who can open the room link can join, so treat it as a credential.

## Data

The first visit loads a small sample set. Changes are written to the `okr-web`
IndexedDB database (`state` key-value store) immediately, so the tool works
offline and keeps one user's data on that device only.

Existing data from the pre-IndexedDB `localStorage` key `okr-web.state.v1` is
migrated on first load and the old key is removed. The language choice is saved
under `okr-web.locale` and the device name under `okr-web.device-name`. Clearing
site data restores the sample set.

## Deployment

Pull requests targeting `main` get a Cloudflare Pages preview at
`https://pr-<PR number>.ilovecode33-okr-web.pages.dev`, deployed by
[`.github/workflows/preview-okr-web.yml`](../../.github/workflows/preview-okr-web.yml).
The preview uses the production realtime Worker at
`https://sync.ilovecode33.fyi`.

Production deploys from `main` with
[`.github/workflows/deploy-okr-web.yml`](../../.github/workflows/deploy-okr-web.yml)
to `https://okr.ilovecode33.fyi`. The realtime Worker deploys separately from
[`apps/okr-realtime`](../okr-realtime/README.md). See
[`DEPLOYMENT.md`](DEPLOYMENT.md).
