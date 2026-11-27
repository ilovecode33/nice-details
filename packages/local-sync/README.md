# @ilovecode33/local-sync

Pure-web local pairing over WebRTC with QR codes. It provides:

- a WebRTC data-channel session for devices on the same network;
- one-scan pairing through an optional signaling relay (`startRelayPairing`);
- manual QR/paste signaling for fully serverless pairing;
- a camera QR scanner component for mobile devices;
- remembered pairings in IndexedDB, backed by `@ilovecode33/persistence`.

## What “local” means

- The intended case is two devices on the same LAN using WebRTC host
  candidates. No STUN or TURN server is configured by default; pass
  `iceServers` (for example a STUN server) when needed. The OKR web app adds
  Cloudflare's public STUN server as a fallback.
- Browsers **cannot** read the Wi-Fi SSID or password. The QR contains either a
  room id (relay mode) or the WebRTC SDP/ICE data (manual mode), never Wi-Fi
  credentials.
- Modern browsers may hide local IPs behind mDNS candidates. Some networks may
  still require STUN; pass `iceServers` when needed.
- WebRTC connections are ephemeral. Relay mode needs one QR scan per session;
  manual mode needs the answer to travel back by a second scan or a pasted code.
  Remembered pairings skip the password/trust setup, not the signaling itself.
- The relay only exchanges offer/answer messages. OKR state always travels over
  the encrypted peer-to-peer data channel.

## Install

```bash
bun add @ilovecode33/local-sync
```

React 19 is a peer dependency. The camera scanner needs HTTPS or localhost and
the user's camera permission.

## One-scan pairing (relay)

`startRelayPairing` connects both peers to a signaling room, sends the offer and
answer automatically, then closes the relay socket once WebRTC connects. The
room id is random and embedded in the host QR; the relay never sees OKR data.

```tsx
// Host, once the panel opens:
const host = createLocalSync({ role: 'host', label: 'Desktop' });
const hostPairing = await startRelayPairing({
  relayUrl: 'https://sync.ilovecode33.fyi',
  role: 'host',
  session: host,
});

// Render <QrCode value={hostPairing.pairUrl} label="Scan once to pair" />.
```

```tsx
// Guest, after scanning the link or reading #sync=<room> from the URL:
const guest = createLocalSync({ role: 'guest', label: 'Phone' });
const room = parsePairingCode(window.location.href);
if (room) {
  await startRelayPairing({
    relayUrl: 'https://sync.ilovecode33.fyi',
    role: 'guest',
    session: guest,
    room,
  });
}
```

The guest can also join by pasting the link. The host does not scan anything and
does not need a camera.

The pairing link looks like `https://app.example/#sync=<room>&relay=<origin>`.
Opening it with the system camera loads the app and lets it join automatically;
pasting it into the in-app join field also works. The relay origin lets the
guest use the same relay that the host reached.

## Manual pairing (no relay)

The original two-way QR flow remains available. It is useful when no relay is
deployed and both devices can scan or paste a code.

```tsx
// Host
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

```tsx
// Guest
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
| `startRelayPairing(options)` | One-scan pairing through a signaling relay. |
| `RelayPairing.send(message)` / `onMessage(listener)` | App-data fallback over the relay when WebRTC is unavailable. |
| `buildPairUrl(appUrl, room)` / `parsePairingCode(value)` | Pairing link helpers. |
| `parsePairingLink(value)` | Returns `{ room, relayUrl? }` from a pairing link. |
| `relaySocketUrl(relayUrl, room, role)` | WebSocket endpoint helper. |
| `encodeSignal(signal)` / `decodeSignal(code)` | Manual QR/paste signal codec. |
| `isPeerSignal(value)` | Validates a decoded signal. |
| `QrCode` | Inline SVG QR generator. |
| `QrScanner` | Camera QR scanner component. |
| `openLocalSyncStorage(name?)` | IndexedDB trust store. |
| `LocalSyncError` | Error with codes such as `camera`, `signal`, `channel`, `storage`. |

`createOffer()`, `acceptOffer()`, and `acceptAnswer()` all wait for non-trickle
ICE gathering (with a 4-second fallback) before returning the signal.

## Security

- The pairing password is generated with `crypto.getRandomValues` and included
  in the offer. In relay mode the offer, including the password and ICE
  candidates, passes through the signaling Worker; the relay does not receive
  OKR state during normal peer-to-peer operation.
- If WebRTC cannot connect, the app can send app data through the relay. In that
  fallback mode the Worker forwards (but does not store) encrypted-in-transit
  OKR state.
- WebRTC data channels are encrypted with DTLS.
- Anyone who can scan the QR or read the pairing link can attempt to pair. Treat
  both as a credential and do not share them publicly.
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
