# @ilovecode33/okr-web

A small, personal OKR tracker that runs entirely in the browser. There is no
backend or account: objectives and key results are stored in IndexedDB through
`@ilovecode33/persistence` and loaded again on the next visit. Two devices on the
same network can pair with a QR code and sync changes directly over WebRTC.

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
- Device pairing with **one QR scan** and two-way sync over WebRTC, using
  `@ilovecode33/local-sync` and the Cloudflare signaling relay.

## Device sync

Open **Sync** in the toolbar to pair two devices on the same network.

1. On the host, choose **Host**. A QR code and pairing link appear.
2. On the guest, scan the QR **once** (or open the copied link).
3. The guest connects automatically; the host does not scan anything.
4. Both panels show **Connected. Changes sync both ways.**

The QR link is `https://<app>/#sync=<room>&relay=<relay-origin>`. Opening it
with the system camera loads the app and joins automatically; the in-app
**Join → Scan** flow and the paste field are fallbacks. The signaling relay only
exchanges WebRTC offer/answer data. OKR state always travels over the
peer-to-peer data channel. The host tries its configured relay first and falls
back to `https://sync.ilovecode33.fyi`; the successful origin is written into
the pairing link so both devices use the same relay. The default relay can be
overridden with `PUBLIC_SYNC_RELAY_URL`.

Each device sends a readable name such as `Mac · Chrome` or `iPhone · Safari`.
You can edit it in **Sync → Device name**; the name is stored under
`okr-web.device-name` and shown in the other device's known-device list.

The host state is sent when the connection opens; afterwards, local edits on
either device are sent to the peer. Pairing identities and passwords are stored
in the `local-sync` IndexedDB database, so the next session is recognized as a
known device. A fresh pairing link is still required each session because
WebRTC ICE/SDP values change. The app adds Cloudflare's public STUN server as a
fallback for server-reflexive candidates.

If WebRTC cannot connect after 8 seconds, the app keeps the relay socket and
syncs state through the Worker; the panel shows **Connected through the relay**.
In that mode OKR state passes through Cloudflare but is not stored there.
Camera scanning needs HTTPS or localhost. WebRTC data is encrypted with DTLS,
and anyone who can scan the QR or read the link can attempt to pair, so treat
both as credentials.

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
Each PR also gets its own signaling Worker at
`https://ilovecode33-okr-sync-pr-<PR number>.2y6ddt55g7.workers.dev`, which is
removed when the PR closes. The preview is HTTPS, so the camera QR scanner works
on phones.

Production deploys from `main` with
[`.github/workflows/deploy-okr-web.yml`](../../.github/workflows/deploy-okr-web.yml)
to `https://okr.ilovecode33.fyi`. The app uses the production relay at
`https://sync.ilovecode33.fyi`. See [`DEPLOYMENT.md`](DEPLOYMENT.md).
