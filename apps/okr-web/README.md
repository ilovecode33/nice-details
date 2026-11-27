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
- Device pairing and two-way sync over WebRTC with a QR code, using
  `@ilovecode33/local-sync`.

## Device sync

Open **Sync** in the toolbar to pair two devices on the same network.

1. On the host, choose **Host** and scan the offer QR with the other device.
2. On the guest, choose **Join**, scan the offer, then show the answer QR.
3. On the host, scan the answer QR or paste the answer code and press
   **Connect**.

Both codes can also be copied and pasted when a camera is unavailable.

The host state is sent when the connection opens; afterwards, local edits on
either device are sent to the peer. Pairing identities and passwords are stored
in the `local-sync` IndexedDB database, so the next session is recognized as a
known device. A fresh QR exchange is still required each session because WebRTC
ICE/SDP values change. Camera scanning needs HTTPS or localhost. WebRTC data is
encrypted with DTLS, and anyone who can scan the QR can attempt to pair, so
treat it as a credential.

## Data

The first visit loads a small sample set. Changes are written to the `okr-web`
IndexedDB database (`state` key-value store) immediately, so the tool works
offline and keeps one user's data on that device only.

Existing data from the pre-IndexedDB `localStorage` key `okr-web.state.v1` is
migrated on first load and the old key is removed. The language choice is saved
under `okr-web.locale`. Clearing site data restores the sample set.

## Deployment

Pull requests targeting `main` get a Cloudflare Pages preview at
`https://pr-<PR number>.ilovecode33-okr-web.pages.dev`, deployed by
[`.github/workflows/preview-okr-web.yml`](../../.github/workflows/preview-okr-web.yml).
The preview is HTTPS, so the camera QR scanner works on phones. Production
deployment is not enabled yet; see [`DEPLOYMENT.md`](DEPLOYMENT.md).
