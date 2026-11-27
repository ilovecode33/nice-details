# @ilovecode33/local-sync

Pure-web local pairing over WebRTC with QR codes. It provides:

- a WebRTC data-channel session for devices on the same network;
- QR generation for the offer/answer signal plus a generated pairing password;
- a camera QR scanner component for mobile devices;
- remembered pairings in IndexedDB, backed by `@ilovecode33/persistence`.

## What “local” means

- The intended case is two devices on the same LAN using WebRTC host
  candidates. No STUN or TURN server is configured by default.
- Browsers **cannot** read the Wi-Fi SSID or password. The QR contains the
  WebRTC SDP/ICE information and a pairing password, not Wi-Fi credentials.
- Modern browsers may hide local IPs behind mDNS candidates. Some networks may
  still require STUN; pass `iceServers` when needed.
- WebRTC connections are ephemeral. A fresh session still needs one signaling
  exchange (QR or pasted code). Remembered pairings skip the password/trust
  setup, not the signaling itself.

## Install

```bash
bun add @ilovecode33/local-sync
```

React 19 is a peer dependency. The camera scanner needs HTTPS or localhost and
the user's camera permission.

## Pairing flow

### Host

```tsx
import {
  QrCode,
  createLocalSync,
  decodeSignal,
  encodeSignal,
} from '@ilovecode33/local-sync';

const host = createLocalSync({ role: 'host', label: 'Desktop' });
const offer = await host.createOffer();
const offerCode = await encodeSignal(offer);

// Render <QrCode value={offerCode} label="Scan to pair" />.

// After the guest shows an answer QR or pastes the code:
const answer = await decodeSignal(answerCode);
await host.acceptAnswer(answer);

host.onStateChange((state) => console.log(state));
host.send('hello from the host');
```

### Guest

```tsx
import {
  QrCode,
  QrScanner,
  createLocalSync,
  decodeSignal,
  encodeSignal,
} from '@ilovecode33/local-sync';

const guest = createLocalSync({ role: 'guest', label: 'Phone' });

<QrScanner
  onScan={async (code) => {
    const answer = await guest.acceptOffer(await decodeSignal(code));
    const answerCode = await encodeSignal(answer);
    // Show <QrCode value={answerCode} /> for the host to scan,
    // or display answerCode for copy/paste.
  }}
/>;

guest.onMessage((message) => console.log(message));
```

The host can scan the answer with the same `QrScanner`, or paste `answerCode`
into a textarea. That fallback is useful when the host has no camera.

## Remembered pairings

The host identity, password, and peer list are stored in the `local-sync`
IndexedDB database. The host reuses its password on later sessions; the guest
stores the host's pairing ID and password. Both sides can see the peer again:

```ts
const peers = await host.listPeers();
const alreadyPaired = await host.isKnownPeer(peerId);
await host.forgetPeer(peerId);
```

After `acceptOffer` / `acceptAnswer`, `session.knownPeer` is `true` when the
password matched a stored pairing. The QR still needs to be scanned once per
session because WebRTC ICE/SDP values change.

## QR components

### `<QrCode />`

Renders a scannable SVG QR code.

```tsx
<QrCode value={code} size={280} label="Pairing QR code" />
```

### `<QrScanner />`

Opens the rear camera with `getUserMedia`, decodes frames with `jsqr`, and stops
the camera after the first successful scan.

```tsx
<QrScanner
  onScan={(value) => console.log(value)}
  onError={(error) => console.error(error.code, error.message)}
  labels={{
    scanning: 'Point the camera at the pairing QR code.',
    permission: 'Allow camera access to scan the pairing code.',
  }}
/>
```

English labels are defaults; pass localized strings from the app.

## API

| Export | Description |
| --- | --- |
| `createLocalSync(options)` / `LocalSync` | Host or guest WebRTC session. |
| `encodeSignal(signal)` / `decodeSignal(code)` | Compressed (when supported) QR/paste codec. |
| `isPeerSignal(value)` | Validates a decoded signal. |
| `QrCode` | Inline SVG QR generator. |
| `QrScanner` | Camera QR scanner component. |
| `openLocalSyncStorage(name?)` | IndexedDB trust store. |
| `LocalSyncError` | Error with codes such as `camera`, `signal`, `channel`, `storage`. |

`createOffer()`, `acceptOffer()`, and `acceptAnswer()` all wait for non-trickle
ICE gathering (with a 4-second fallback) before returning the signal.

## Security

- The pairing password is generated with `crypto.getRandomValues` and included
  in the offer QR.
- WebRTC data channels are already encrypted with DTLS.
- Anyone who can scan the QR can attempt to pair. Treat the QR as a pairing
  credential and do not share it publicly.
- The password is reused for remembered pairings; use `forgetPeer` to remove a
  trusted device.

## Commands

```bash
bunx turbo run build --filter=@ilovecode33/local-sync
bunx turbo run typecheck --filter=@ilovecode33/local-sync
bunx turbo run test --filter=@ilovecode33/local-sync
```

## Dependencies

- `qrcode` — QR module generation; avoids a hand-written Reed-Solomon encoder.
- `jsqr` — camera-frame QR decoding.
- `@ilovecode33/persistence` — IndexedDB identity and peer storage.

## Links

- [CHANGELOG.md](CHANGELOG.md)
- [Repository README](../../README.md) and [RELEASING.md](../../RELEASING.md)
- [AI rules index](../ai-rules/README.md)
