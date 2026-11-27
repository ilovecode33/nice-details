import { afterEach, describe, expect, rs, test } from '@rstest/core';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
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
  emitApp: (message: string) => void;
  sent: string[];
};

const room = 'abcdefghijklmnopqrstuvwx';

afterEach(() => {
  localStorage.removeItem('okr-web.device-name');
});

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
  if (options.onStatus) listeners.add(options.onStatus);
  const messageListeners = new Set<(message: string) => void>();
  const sent: string[] = [];
  const pairingRoom = options.room ?? room;
  let currentStatus: RelayPairingStatus =
    options.role === 'host' ? 'waiting' : 'waiting';

  const pairing: FakePairing = {
    room: pairingRoom,
    role: options.role,
    pairUrl: buildPairUrl('https://app.test/', pairingRoom, options.relayUrl),
    sent,
    get status() {
      return currentStatus;
    },
    send(message) {
      sent.push(message);
    },
    onMessage(listener) {
      messageListeners.add(listener);
      return () => messageListeners.delete(listener);
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
    emitApp(message) {
      for (const listener of messageListeners) listener(message);
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
  relayUrl,
  fallbackRelayUrl,
  failRelays = [],
  onStart,
}: {
  state?: OKRState;
  onRemoteState?: (next: OKRState) => void;
  peers?: LocalSyncPeer[];
  initialMode?: 'host' | 'join';
  initialRoom?: string;
  relayUrl?: string;
  fallbackRelayUrl?: string;
  failRelays?: string[];
  onStart?: (options: RelayPairingOptions) => void;
} = {}) {
  let session: FakeSession | null = null;
  let sessionOptions: LocalSyncOptions | null = null;
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
        relayUrl={relayUrl}
        fallbackRelayUrl={fallbackRelayUrl}
        createSession={(options) => {
          sessionOptions = options;
          session = createFakeSession(options, peers);
          return session;
        }}
        startPairing={async (options) => {
          onStart?.(options);
          if (options.relayUrl && failRelays.includes(options.relayUrl)) {
            throw new Error('relay unavailable');
          }
          pairing = createFakePairing(options);
          return pairing;
        }}
      />
    </UIFoundation>,
  );
  return {
    ...view,
    getSession: () => session,
    getSessionOptions: () => sessionOptions,
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
      initialRoom: `https://app.test/#sync=${room}&relay=${encodeURIComponent(
        'https://link-relay.test',
      )}`,
      relayUrl: 'https://primary.test',
      onStart: (options) => starts.push(options),
    });

    expect(await screen.findByText('Connecting to the host…')).toBeTruthy();
    expect(starts[0]).toMatchObject({
      role: 'guest',
      room,
      relayUrl: 'https://link-relay.test',
    });
  });

  test('falls back to the stable relay when the primary is unreachable', async () => {
    const starts: RelayPairingOptions[] = [];
    renderPanel({
      relayUrl: 'https://primary.test',
      fallbackRelayUrl: 'https://fallback.test',
      failRelays: ['https://primary.test'],
      onStart: (options) => starts.push(options),
    });

    expect(
      await screen.findByText(
        'Waiting for the other device. Scan the QR once.',
      ),
    ).toBeTruthy();
    expect(starts.map((options) => options.relayUrl)).toEqual([
      'https://primary.test',
      'https://fallback.test',
    ]);
    const link = screen.getByLabelText('Pairing link') as HTMLTextAreaElement;
    expect(link.value).toContain('relay=https%3A%2F%2Ffallback.test');
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

  test('saves a distinct device name and uses it for the session', async () => {
    localStorage.setItem('okr-web.device-name', 'Test Phone');
    const { getSessionOptions } = renderPanel();

    const input = await screen.findByLabelText('Device name');
    expect((input as HTMLInputElement).value).toBe('Test Phone');
    expect(getSessionOptions()).toMatchObject({ label: 'Test Phone' });

    fireEvent.change(input, { target: { value: 'Alan MacBook' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save name' }));

    await waitFor(() => {
      expect(getSessionOptions()).toMatchObject({ label: 'Alan MacBook' });
    });
    expect(localStorage.getItem('okr-web.device-name')).toBe('Alan MacBook');
  });

  test('syncs state through the relay when WebRTC is not connected', async () => {
    const onRemoteState = rs.fn();
    const { getPairing } = renderPanel({ onRemoteState });
    await screen.findByText(
      'Waiting for the other device. Scan the QR once.',
    );

    const pairing = getPairing();
    act(() => pairing?.emitStatus('signaling'));
    await waitFor(() => {
      expect(
        pairing?.sent.some((message) => message.includes('"type":"state"')),
      ).toBe(true);
    });

    const remote: OKRState = { version: 1, objectives: [] };
    act(() => {
      pairing?.emitApp(JSON.stringify({ type: 'state', state: remote }));
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
