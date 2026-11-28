import { afterEach, describe, expect, rs, test } from '@rstest/core';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createSampleState, type OKRState } from '@ilovecode33/okr-shared';
import { UIFoundation } from '@ilovecode33/ui';
import {
  type RealtimeOptions,
  type RealtimePeer,
  type RealtimeSession,
  type RealtimeStateMeta,
  type RealtimeStatus,
} from '../realtime';
import { DICTIONARIES } from '../i18n';
import { SyncPanel } from './SyncPanel';

type FakeSession = RealtimeSession & {
  emitState: (state: unknown, meta?: RealtimeStateMeta) => void;
  emitPeers: (peers: RealtimePeer[]) => void;
  emitStatus: (status: RealtimeStatus) => void;
  sent: OKRState[];
};

const room = 'abcdefghijklmnopqrstuvwx';

afterEach(() => {
  localStorage.removeItem('okr-web.device-name');
});

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
  initialMode,
  initialRoom,
  initialStatus = 'connected',
  onStart,
}: {
  state?: OKRState;
  onRemoteState?: (next: OKRState) => void;
  initialMode?: 'host' | 'join';
  initialRoom?: string;
  initialStatus?: RealtimeStatus;
  onStart?: (options: RealtimeOptions) => void;
} = {}) {
  let session: FakeSession | null = null;
  let sessionOptions: RealtimeOptions | null = null;
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
        initialMode={initialMode}
        initialRoom={initialRoom}
        createRealtime={createRealtime}
        syncUrl="https://sync.test"
      />
    </UIFoundation>,
  );

  return {
    ...view,
    getSession: () => session,
    getSessionOptions: () => sessionOptions,
  };
}

describe('SyncPanel', () => {
  test('hosts a realtime room and renders the QR code', async () => {
    const { getSessionOptions } = renderPanel();

    expect(
      await screen.findByText('Connected. Changes sync in realtime.'),
    ).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Sync QR code' })).toBeTruthy();
    expect(
      (screen.getByLabelText('Room link') as HTMLTextAreaElement).value,
    ).toContain('#sync=');
    expect(getSessionOptions()).toMatchObject({
      initialState: createSampleState(),
      device: expect.any(String),
    });
  });

  test('joins a room from a link', async () => {
    const starts: RealtimeOptions[] = [];
    renderPanel({
      initialMode: 'join',
      initialRoom: `https://app.test/#sync=${room}`,
      onStart: (options) => starts.push(options),
    });

    expect(
      await screen.findByText('Connected. Changes sync in realtime.'),
    ).toBeTruthy();
    expect(starts[0]).toMatchObject({ room });
  });

  test('offers camera scanning when joining manually', async () => {
    renderPanel({ initialMode: 'join' });
    expect(
      await screen.findByRole('button', { name: 'Scan with camera' }),
    ).toBeTruthy();
    expect(screen.getByLabelText('Room link')).toBeTruthy();
  });

  test('applies a remote state message', async () => {
    const onRemoteState = rs.fn();
    const { getSession } = renderPanel({ onRemoteState });
    await screen.findByText('Connected. Changes sync in realtime.');

    const remote: OKRState = { version: 1, objectives: [] };
    act(() => {
      getSession()?.emitState(remote);
    });

    expect(onRemoteState).toHaveBeenCalledWith(remote);
  });

  test('shows the room id and data version', async () => {
    const { getSession, getSessionOptions } = renderPanel();
    await screen.findByText('Connected. Changes sync in realtime.');

    const room = getSessionOptions()?.room ?? '';
    expect(screen.getByText(room, { selector: 'code' })).toBeTruthy();
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
    await screen.findByText('Connected. Changes sync in realtime.');

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

  test('saves a distinct device name and uses it for the session', async () => {
    localStorage.setItem('okr-web.device-name', 'Test Phone');
    const { getSessionOptions } = renderPanel({ initialStatus: 'connecting' });

    const input = await screen.findByLabelText('Device name');
    expect((input as HTMLInputElement).value).toBe('Test Phone');
    expect(getSessionOptions()).toMatchObject({ device: 'Test Phone' });

    fireEvent.change(input, { target: { value: 'Alan MacBook' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save name' }));

    await waitFor(() => {
      expect(getSessionOptions()).toMatchObject({ device: 'Alan MacBook' });
    });
    expect(localStorage.getItem('okr-web.device-name')).toBe('Alan MacBook');
  });
});
