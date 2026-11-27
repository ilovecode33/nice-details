import { describe, expect, rs, test } from '@rstest/core';
import { act, render, screen } from '@testing-library/react';
import {
  createSampleState,
  type OKRState,
} from '@ilovecode33/okr-shared';
import { UIFoundation } from '@ilovecode33/ui';
import type {
  LocalSyncOptions,
  LocalSyncPeer,
  LocalSyncSession,
  LocalSyncState,
  PeerSignal,
} from '@ilovecode33/local-sync';
import { DICTIONARIES } from '../i18n';
import { SyncPanel } from './SyncPanel';

type FakeSession = LocalSyncSession & {
  emitMessage: (message: string) => void;
};

function createFakeSession(
  options: LocalSyncOptions,
  peers: LocalSyncPeer[] = [],
  knownPeer = false,
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
    knownPeer,
    async createOffer(): Promise<PeerSignal> {
      move('awaiting-answer');
      return {
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
    },
    async acceptOffer(): Promise<PeerSignal> {
      move('connected');
      return {
        v: 1,
        kind: 'answer',
        role: 'guest',
        session: 'session-1',
        pairingId: 'host-1',
        guestId: 'guest-1',
        label: 'OKR web',
        password: 'secret',
        sdp: 'v=0',
        createdAt: 1,
      };
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

function renderPanel(
  state: OKRState,
  onRemoteState: (next: OKRState) => void = () => {},
  peers: LocalSyncPeer[] = [],
) {
  let session: FakeSession | null = null;
  const view = render(
    <UIFoundation dictionaries={DICTIONARIES}>
      <SyncPanel
        open
        state={state}
        onClose={() => {}}
        onRemoteState={onRemoteState}
        createSession={(options) => {
          session = createFakeSession(options, peers);
          return session;
        }}
      />
    </UIFoundation>,
  );
  return { ...view, getSession: () => session };
}

describe('SyncPanel', () => {
  test('hosts a session and renders the offer QR code', async () => {
    renderPanel(createSampleState());

    expect(
      await screen.findByText('Waiting for the answer code.'),
    ).toBeTruthy();
    expect(
      screen.getByRole('img', { name: 'Host pairing QR code' }),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Connect' })).toBeTruthy();
  });

  test('applies a remote state message', async () => {
    const onRemoteState = rs.fn();
    const { getSession } = renderPanel(createSampleState(), onRemoteState);
    await screen.findByText('Waiting for the answer code.');

    const remote: OKRState = { version: 1, objectives: [] };
    act(() => {
      getSession()?.emitMessage(JSON.stringify({ type: 'state', state: remote }));
    });

    expect(onRemoteState).toHaveBeenCalledWith(remote);
  });

  test('lists remembered peers with a forget action', async () => {
    renderPanel(createSampleState(), () => {}, [
      {
        id: 'peer-1',
        role: 'guest',
        label: 'iPhone',
        password: 'secret',
        lastSeen: '2026-11-27T00:00:00.000Z',
      },
    ]);

    expect(await screen.findByText('Known devices')).toBeTruthy();
    expect(screen.getByText('iPhone')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Forget' })).toBeTruthy();
  });
});
