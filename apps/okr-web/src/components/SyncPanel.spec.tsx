import { describe, expect, rs, test } from '@rstest/core';
import { act, render, screen } from '@testing-library/react';
import {
  createSampleState,
  type OKRState,
} from '@ilovecode33/okr-shared';
import { UIFoundation } from '@ilovecode33/ui';
import {
  buildPairUrl,
  type LocalSyncOptions,
  type LocalSyncPeer,
  type LocalSyncSession,
  type LocalSyncState,
  type PeerSignal,
  type RelayPairing,
  type RelayPairingOptions,
  type RelayPairingStatus,
} from '@ilovecode33/local-sync';
import { DICTIONARIES } from '../i18n';
import { SyncPanel } from './SyncPanel';

type FakeSession = LocalSyncSession & {
  emitMessage: (message: string) => void;
};

type FakePairing = RelayPairing & {
  emitStatus: (status: RelayPairingStatus) => void;
};

const room = 'abcdefghijklmnopqrstuvwx';

const offer: PeerSignal = {
  v: 1,
  kind: 'offer',
  role: 'host',
  session: 'session-1',
  pairingId: 'host-1',
  label: 'OKR web',
  password: 'secret',
  sdp: 'v=0',
  createdAt: 1,
};

const answer: PeerSignal = {
  ...offer,
  kind: 'answer',
  role: 'guest',
  guestId: 'guest-1',
};

function createFakeSession(
  options: LocalSyncOptions,
  peers: LocalSyncPeer[] = [],
): FakeSession {
  const messageListeners = new Set<(message: string) => void>();
  const stateListeners = new Set<(state: LocalSyncState) => void>();
  let peerList = [...peers];
  let currentState: LocalSyncState = 'idle';

  const move = (next: LocalSyncState) => {
    currentState = next;
    for (const listener of stateListeners) listener(currentState);
  };

  const session: FakeSession = {
    role: options.role ?? 'host',
    get state() {
      return currentState;
    },
    knownPeer: false,
    async createOffer(): Promise<PeerSignal> {
      move('awaiting-answer');
      return offer;
    },
    async acceptOffer(): Promise<PeerSignal> {
      move('connected');
      return answer;
    },
    async acceptAnswer(): Promise<void> {
      move('connected');
    },
    send() {},
    onMessage(listener) {
      messageListeners.add(listener);
      return () => messageListeners.delete(listener);
    },
    onStateChange(listener) {
      stateListeners.add(listener);
      listener(currentState);
      return () => stateListeners.delete(listener);
    },
    async listPeers() {
      return peerList;
    },
    async isKnownPeer(id) {
      return peerList.some((peer) => peer.id === id);
    },
    async forgetPeer(id) {
      peerList = peerList.filter((peer) => peer.id !== id);
    },
    close() {},
    emitMessage(message) {
      for (const listener of messageListeners) listener(message);
    },
  };

  return session;
}

function createFakePairing(options: RelayPairingOptions): FakePairing {
  const listeners = new Set<(status: RelayPairingStatus) => void>();
  const pairingRoom = options.room ?? room;
  let currentStatus: RelayPairingStatus =
    options.role === 'host' ? 'waiting' : 'waiting';

  const pairing: FakePairing = {
    room: pairingRoom,
    role: options.role,
    pairUrl: buildPairUrl('https://app.test/', pairingRoom),
    get status() {
      return currentStatus;
    },
    onStatus(listener) {
      listeners.add(listener);
      listener(currentStatus);
      return () => listeners.delete(listener);
    },
    close() {
      currentStatus = 'closed';
      for (const listener of listeners) listener(currentStatus);
    },
    emitStatus(next) {
      currentStatus = next;
      for (const listener of listeners) listener(currentStatus);
    },
  };

  return pairing;
}

function renderPanel({
  state = createSampleState(),
  onRemoteState = () => {},
  peers = [],
  initialMode,
  initialRoom,
  onStart,
}: {
  state?: OKRState;
  onRemoteState?: (next: OKRState) => void;
  peers?: LocalSyncPeer[];
  initialMode?: 'host' | 'join';
  initialRoom?: string;
  onStart?: (options: RelayPairingOptions) => void;
} = {}) {
  let session: FakeSession | null = null;
  let pairing: FakePairing | null = null;
  const view = render(
    <UIFoundation dictionaries={DICTIONARIES}>
      <SyncPanel
        open
        state={state}
        onClose={() => {}}
        onRemoteState={onRemoteState}
        initialMode={initialMode}
        initialRoom={initialRoom}
        createSession={(options) => {
          session = createFakeSession(options, peers);
          return session;
        }}
        startPairing={async (options) => {
          onStart?.(options);
          pairing = createFakePairing(options);
          return pairing;
        }}
      />
    </UIFoundation>,
  );
  return {
    ...view,
    getSession: () => session,
    getPairing: () => pairing,
  };
}

describe('SyncPanel', () => {
  test('hosts a one-scan room and renders the pairing QR code', async () => {
    renderPanel();

    expect(
      await screen.findByText(
        'Waiting for the other device. Scan the QR once.',
      ),
    ).toBeTruthy();
    expect(
      screen.getByRole('img', { name: 'Pairing QR code' }),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeTruthy();
    expect(
      screen.queryByRole('button', { name: 'Connect' }),
    ).toBeNull();
  });

  test('joins the room from a pairing link without a second scan', async () => {
    const starts: RelayPairingOptions[] = [];
    renderPanel({
      initialMode: 'join',
      initialRoom: `https://app.test/#sync=${room}`,
      onStart: (options) => starts.push(options),
    });

    expect(await screen.findByText('Connecting to the host…')).toBeTruthy();
    expect(starts[0]).toMatchObject({ role: 'guest', room });
  });

  test('applies a remote state message', async () => {
    const onRemoteState = rs.fn();
    const { getSession } = renderPanel({ onRemoteState });
    await screen.findByText(
      'Waiting for the other device. Scan the QR once.',
    );

    const remote: OKRState = { version: 1, objectives: [] };
    act(() => {
      getSession()?.emitMessage(JSON.stringify({ type: 'state', state: remote }));
    });

    expect(onRemoteState).toHaveBeenCalledWith(remote);
  });

  test('lists remembered peers with a forget action', async () => {
    renderPanel({
      peers: [
        {
          id: 'peer-1',
          role: 'guest',
          label: 'iPhone',
          password: 'secret',
          lastSeen: '2026-11-27T00:00:00.000Z',
        },
      ],
    });

    expect(await screen.findByText('Known devices')).toBeTruthy();
    expect(screen.getByText('iPhone')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Forget' })).toBeTruthy();
  });
});
