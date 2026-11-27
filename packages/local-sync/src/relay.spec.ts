import { describe, expect, test } from '@rstest/core';
import { LocalSyncError } from './errors';
import {
  buildPairUrl,
  parsePairingCode,
  relaySocketUrl,
  startRelayPairing,
} from './relay';
import type {
  LocalSyncPeer,
  LocalSyncSession,
  LocalSyncState,
  PeerSignal,
} from './types';

const offer: PeerSignal = {
  v: 1,
  kind: 'offer',
  role: 'host',
  session: 'session-1',
  pairingId: 'host-1',
  label: 'Desktop',
  password: 'secret',
  sdp: 'v=0',
  createdAt: 1,
};

const answer: PeerSignal = {
  ...offer,
  kind: 'answer',
  role: 'guest',
  guestId: 'guest-1',
  label: 'Phone',
};

class FakeSocket extends EventTarget {
  readyState = 0;
  sent: string[] = [];

  constructor(readonly url: string) {
    super();
    queueMicrotask(() => {
      this.readyState = 1;
      this.dispatchEvent(new Event('open'));
      this.receive({ type: 'ready', role: 'host' });
    });
  }

  send(value: string): void {
    this.sent.push(value);
  }

  close(): void {
    if (this.readyState === 3) return;
    this.readyState = 3;
    this.dispatchEvent(new Event('close'));
  }

  receive(message: unknown): void {
    this.dispatchEvent(
      new MessageEvent('message', { data: JSON.stringify(message) }),
    );
  }

  get messages(): Array<Record<string, unknown>> {
    return this.sent.map((value) => JSON.parse(value));
  }
}

function createFakeSession(role: 'host' | 'guest'): {
  session: LocalSyncSession;
  acceptedAnswer: PeerSignal[];
  acceptedOffer: PeerSignal[];
  connect: () => void;
} {
  const stateListeners = new Set<(state: LocalSyncState) => void>();
  const acceptedAnswer: PeerSignal[] = [];
  const acceptedOffer: PeerSignal[] = [];
  let currentState: LocalSyncState = 'idle';

  const move = (next: LocalSyncState) => {
    currentState = next;
    for (const listener of stateListeners) listener(next);
  };

  const session: LocalSyncSession = {
    role,
    get state() {
      return currentState;
    },
    knownPeer: false,
    async createOffer() {
      return offer;
    },
    async acceptOffer(signal) {
      acceptedOffer.push(signal);
      move('connecting');
      return answer;
    },
    async acceptAnswer(signal) {
      acceptedAnswer.push(signal);
      move('connecting');
    },
    send() {},
    onMessage() {
      return () => {};
    },
    onStateChange(listener) {
      stateListeners.add(listener);
      listener(currentState);
      return () => stateListeners.delete(listener);
    },
    async listPeers(): Promise<LocalSyncPeer[]> {
      return [];
    },
    async isKnownPeer() {
      return false;
    },
    async forgetPeer() {},
    close() {},
  };

  return {
    session,
    acceptedAnswer,
    acceptedOffer,
    connect: () => move('connected'),
  };
}

function fakeFactory(sockets: FakeSocket[]) {
  return (url: string) => {
    const socket = new FakeSocket(url);
    sockets.push(socket);
    return socket as unknown as WebSocket;
  };
}

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('relay pairing', () => {
  test('builds and parses pairing links', () => {
    expect(buildPairUrl('https://app.example/okr', 'abcdefghijklmnop')).toBe(
      'https://app.example/okr#sync=abcdefghijklmnop',
    );
    expect(
      parsePairingCode('https://app.example/okr#sync=abcdefghijklmnop'),
    ).toBe('abcdefghijklmnop');
    expect(
      parsePairingCode('https://app.example/okr?sync=abcdefghijklmnop'),
    ).toBe('abcdefghijklmnop');
    expect(parsePairingCode('abcdefghijklmnop')).toBe('abcdefghijklmnop');
    expect(parsePairingCode('https://app.example/okr')).toBeNull();
  });

  test('uses secure WebSocket URLs', () => {
    expect(relaySocketUrl('https://relay.example', 'room', 'host')).toBe(
      'wss://relay.example/ws?room=room&role=host',
    );
    expect(relaySocketUrl('http://localhost:8787', 'room', 'guest')).toBe(
      'ws://localhost:8787/ws?room=room&role=guest',
    );
  });

  test('hosts a room and accepts the relayed answer', async () => {
    const sockets: FakeSocket[] = [];
    const { session, acceptedAnswer, connect } = createFakeSession('host');
    const pairing = await startRelayPairing({
      relayUrl: 'https://relay.example',
      role: 'host',
      session,
      appUrl: 'https://app.example/',
      room: 'abcdefghijklmnopqrstuvwx',
      socketFactory: fakeFactory(sockets),
    });

    expect(pairing.pairUrl).toBe(
      'https://app.example/#sync=abcdefghijklmnopqrstuvwx',
    );
    expect(sockets[0].messages).toEqual([{ type: 'offer', payload: offer }]);

    sockets[0].receive({ type: 'answer', payload: answer });
    await tick();
    expect(acceptedAnswer).toEqual([answer]);

    connect();
    expect(pairing.status).toBe('connected');
    pairing.close();
  });

  test('joins a room and sends the answer', async () => {
    const sockets: FakeSocket[] = [];
    const { session, acceptedOffer, connect } = createFakeSession('guest');
    const pending = startRelayPairing({
      relayUrl: 'https://relay.example',
      role: 'guest',
      session,
      room: 'abcdefghijklmnopqrstuvwx',
      socketFactory: fakeFactory(sockets),
    });

    await tick();
    sockets[0].receive({ type: 'offer', payload: offer });
    const pairing = await pending;

    expect(acceptedOffer).toEqual([offer]);
    expect(sockets[0].messages).toEqual([{ type: 'answer', payload: answer }]);

    connect();
    expect(pairing.status).toBe('connected');
    pairing.close();
  });

  test('fails when the relay cannot be reached', async () => {
    const { session } = createFakeSession('guest');
    await expect(
      startRelayPairing({
        relayUrl: 'https://relay.example',
        role: 'guest',
        session,
        room: 'abcdefghijklmnopqrstuvwx',
        socketFactory: () => {
          const socket = new FakeSocket('ws://relay');
          queueMicrotask(() => socket.dispatchEvent(new Event('error')));
          return socket as unknown as WebSocket;
        },
        onError: () => {},
      }),
    ).rejects.toBeInstanceOf(LocalSyncError);
  });
});
