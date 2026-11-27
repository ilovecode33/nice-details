# Changelog

All notable changes to `@ilovecode33/local-sync` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-11-27

### Added

- WebRTC host/guest session with non-trickle ICE gathering and a data channel.
- QR/paste signal codec with optional gzip compression and a generated pairing
  password.
- `QrCode` inline SVG renderer and `QrScanner` camera scanner using `getUserMedia`
  and `jsqr`.
- IndexedDB-backed host identity, password, and remembered peer storage through
  `@ilovecode33/persistence`.
- `knownPeer`, peer listing, and peer removal for remembered pairings.
