import { describe, expect, rs, test } from '@rstest/core';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  createSampleState,
  type Objective,
  type OKRState,
} from '@ilovecode33/okr-shared';
import { UIFoundation } from '@ilovecode33/ui';
import {
  type RealtimeOptions,
  type RealtimePeer,
  type RealtimeSession,
  type RealtimeStateMeta,
  type RealtimeStatus,
} from '../realtime';
import type { StoredSyncRoom } from '../storage';
import { DICTIONARIES } from '../i18n';
import { SyncPanel } from './SyncPanel';

type FakeSession = RealtimeSession & {
  emitState: (state: unknown, meta?: RealtimeStateMeta) => void;
  emitPeers: (peers: RealtimePeer[]) => void;
  emitStatus: (status: RealtimeStatus) => void;
  sent: OKRState[];
};

const room = 'abcdefghijklmnopqrstuvwx';
const key = 'A'.repeat(43);

/** A state from the other device with one extra, newer objective. */
function remoteState(): OKRState {
  const [first] = createSampleState().objectives;
  if (!first) throw new Error('sample state is empty');
  const objective: Objective = {
    ...first,
    id: 'remote-objective',
    title: 'Remote goal',
    updatedAt: '2030-01-01T00:00:00.000Z',
  };
  return { version: 1, objectives: [objective] };
}

function createFakeSession(
  options: RealtimeOptions,
  initialStatus: RealtimeStatus,
): FakeSession {
  const sent: OKRState[] = [];
  let currentStatus = initialStatus;

  const session: FakeSession = {
    room: options.room,
    get status() {
      return currentStatus;
    },
    sendState(state) {
      sent.push(state);
    },
    close() {
      currentStatus = 'closed';
      options.onStatus?.('closed');
    },
    sent,
    emitState(state, meta = { revision: 1, updatedAt: '2026-11-28T00:00:00.000Z' }) {
      options.onState?.(state, meta);
      options.onVersion?.(meta);
    },
    emitPeers(peers) {
      options.onPeers?.(peers);
    },
    emitStatus(status) {
      currentStatus = status;
      options.onStatus?.(status);
    },
  };

  return session;
}

function renderPanel({
  state = createSampleState(),
  onRemoteState = () => {},
  initialRoom,
  storedRoom = null,
  storedDeviceName = null,
  initialStatus = 'connected',
  onStart,
}: {
  state?: OKRState;
  onRemoteState?: (next: OKRState) => void;
  initialRoom?: string;
  storedRoom?: StoredSyncRoom | null;
  storedDeviceName?: string | null;
  initialStatus?: RealtimeStatus;
  onStart?: (options: RealtimeOptions) => void;
} = {}) {
  let session: FakeSession | null = null;
  let sessionOptions: RealtimeOptions | null = null;
  let saved: StoredSyncRoom | null = storedRoom;
  let savedDevice: string | null = storedDeviceName;
  const createRealtime = (options: RealtimeOptions) => {
    sessionOptions = options;
    onStart?.(options);
    session = createFakeSession(options, initialStatus);
    return session;
  };

  const view = render(
    <UIFoundation dictionaries={DICTIONARIES}>
      <SyncPanel
        open
        state={state}
        onClose={() => {}}
        onRemoteState={onRemoteState}
        initialRoom={initialRoom}
        createRealtime={createRealtime}
        syncUrl="https://sync.test"
        loadStoredRoom={async () => saved}
        saveStoredRoom={async (next) => {
          saved = next;
        }}
        clearStoredRoom={async () => {
          saved = null;
        }}
        loadStoredDeviceName={async () => savedDevice}
        saveStoredDeviceName={async (name) => {
          savedDevice = name;
        }}
      />
    </UIFoundation>,
  );

  return {
    ...view,
    getSession: () => session,
    getSessionOptions: () => sessionOptions,
    getSavedDeviceName: () => savedDevice,
  };
}

async function startHost() {
  fireEvent.click(await screen.findByRole('button', { name: 'Host' }));
  await screen.findByText('Connected. Changes sync in realtime.');
}

describe('SyncPanel', () => {
  test('offers host or join when there is no saved room', async () => {
    renderPanel();

    expect(await screen.findByRole('button', { name: 'Host' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Join' })).toBeTruthy();
  });

  test('hosts a realtime room and renders the QR code', async () => {
    const { getSessionOptions } = renderPanel();
    await startHost();

    expect(screen.getByRole('img', { name: 'Sync QR code' })).toBeTruthy();
    expect(
      (screen.getByLabelText('Room link') as HTMLTextAreaElement).value,
    ).toContain('#sync=');
    expect(getSessionOptions()).toMatchObject({
      initialState: createSampleState(),
      device: expect.any(String),
    });
  });

  test('reconnects to the last room from persistence', async () => {
    const starts: RealtimeOptions[] = [];
    renderPanel({
      storedRoom: { room, role: 'host', key },
      onStart: (options) => starts.push(options),
    });

    expect(
      await screen.findByText('Connected. Changes sync in realtime.'),
    ).toBeTruthy();
    expect(starts[0]).toMatchObject({ room, initialState: createSampleState() });
  });

  test('joins a room from a link', async () => {
    const starts: RealtimeOptions[] = [];
    renderPanel({
      initialRoom: `https://app.test/#sync=${room}&key=${key}`,
      onStart: (options) => starts.push(options),
    });

    expect(
      await screen.findByText('Connected. Changes sync in realtime.'),
    ).toBeTruthy();
    expect(starts[0]).toMatchObject({ room });
  });

  test('offers camera scanning when joining manually', async () => {
    renderPanel({ storedRoom: null });
    fireEvent.click(await screen.findByRole('button', { name: 'Join' }));

    expect(
      await screen.findByRole('button', { name: 'Scan with camera' }),
    ).toBeTruthy();
    expect(screen.getByLabelText('Room link')).toBeTruthy();
  });

  test('merges a remote update into the local document', async () => {
    const onRemoteState = rs.fn();
    const { getSession } = renderPanel({ onRemoteState });
    await startHost();

    act(() => {
      getSession()?.emitState(remoteState());
    });

    const merged = onRemoteState.mock.calls[0]?.[0] as OKRState;
    const ids = merged.objectives.map((item) => item.id);
    expect(ids).toContain('remote-objective');
    expect(ids).toContain('sample-running');
  });

  test('adopts the room document when joining from a link', async () => {
    const onRemoteState = rs.fn();
    const { getSession } = renderPanel({
      initialRoom: `https://app.test/#sync=${room}&key=${key}`,
      onRemoteState,
    });
    await screen.findByText('Connected. Changes sync in realtime.');

    const remote = remoteState();
    act(() => {
      getSession()?.emitState(remote);
    });

    expect(onRemoteState).toHaveBeenCalledWith(remote);
  });

  test('shows the room id and data version', async () => {
    const { getSession, getSessionOptions } = renderPanel();
    await startHost();

    const roomId = getSessionOptions()?.room ?? '';
    expect(screen.getByText(roomId, { selector: 'code' })).toBeTruthy();
    act(() => {
      getSession()?.emitState(
        { version: 1, objectives: [] },
        { revision: 3, updatedAt: '2026-11-28T00:00:00.000Z' },
      );
    });
    expect(screen.getByText('Data version 3')).toBeTruthy();
  });

  test('lists connected devices', async () => {
    const { getSession } = renderPanel();
    await startHost();

    act(() => {
      getSession()?.emitPeers([
        { id: '1', device: 'iPhone · Safari' },
        { id: '2', device: 'Mac · Chrome' },
      ]);
    });

    expect(screen.getByText('Connected devices')).toBeTruthy();
    expect(screen.getByText('iPhone · Safari')).toBeTruthy();
    expect(screen.getByText('Mac · Chrome')).toBeTruthy();
  });

  test('generates and keeps a friendly device name on first launch', async () => {
    const { getSavedDeviceName } = renderPanel({ storedDeviceName: null });

    const input = (await screen.findByLabelText('Device name')) as HTMLInputElement;
    expect(input.value).toMatch(/^[A-Z][a-z]+ [A-Z][a-z]+$/);

    await waitFor(() => {
      expect(getSavedDeviceName()).toBe(input.value);
    });
  });

  test('saves a distinct device name and uses it for the session', async () => {
    const { getSavedDeviceName, getSessionOptions } = renderPanel({
      initialStatus: 'connecting',
      storedDeviceName: 'Test Phone',
    });
    fireEvent.click(await screen.findByRole('button', { name: 'Host' }));
    await screen.findByText('Connecting…');

    const input = await screen.findByLabelText('Device name');
    expect((input as HTMLInputElement).value).toBe('Test Phone');
    expect(getSessionOptions()).toMatchObject({ device: 'Test Phone' });

    fireEvent.change(input, { target: { value: 'Alan MacBook' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save name' }));

    await waitFor(() => {
      expect(getSessionOptions()).toMatchObject({ device: 'Alan MacBook' });
    });
    expect(getSavedDeviceName()).toBe('Alan MacBook');
  });
});
