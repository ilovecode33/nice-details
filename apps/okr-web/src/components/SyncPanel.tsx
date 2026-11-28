import { useEffect, useId, useRef, useState } from 'react';
import { Badge, Button, Sheet, TextArea, TextInput } from '@ilovecode33/ui';
import {
  canonicalJson,
  createSampleState,
  mergeStates,
  parseState,
  type OKRState,
} from '@ilovecode33/okr-shared';
import { randomDeviceName } from '../deviceName';
import { createRoomKey } from '../crypto';
import { useOkrI18n } from '../i18n';
import {
  buildSyncUrl,
  createRealtimeSession,
  createRoomId,
  parseSyncLink,
  type RealtimePeer,
  type RealtimeSession,
  type RealtimeStateMeta,
  type RealtimeStatus,
  type SyncTarget,
} from '../realtime';
import { SYNC_URL } from '../syncConfig';
import type { StoredSyncRoom } from '../storage';
import { QrCode } from './QrCode';
import { QrScanner } from './QrScanner';
import styles from './SyncPanel.module.css';

type SyncMode = 'host' | 'join';
type PanelStatus = RealtimeStatus | 'idle';

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Sample objectives are placeholders. A shared name does not make them real data. */
function withoutProfile(state: OKRState): OKRState {
  if (state.profile === undefined) return state;
  const { profile: _profile, ...rest } = state;
  return rest;
}

export interface SyncPanelProps {
  open: boolean;
  onClose: () => void;
  onDisconnect?: () => void;
  onStatusChange?: (status: RealtimeStatus | 'idle') => void;
  state: OKRState;
  onRemoteState: (state: OKRState) => void;
  initialRoom?: string;
  /** Injected in tests; defaults to the realtime WebSocket client. */
  createRealtime?: typeof createRealtimeSession;
  syncUrl?: string;
  loadStoredRoom?: () => Promise<StoredSyncRoom | null>;
  saveStoredRoom?: (room: StoredSyncRoom) => Promise<void>;
  clearStoredRoom?: () => Promise<void>;
  loadStoredDeviceName?: () => Promise<string | null>;
  saveStoredDeviceName?: (name: string) => Promise<void>;
}

export function SyncPanel({
  open,
  onClose,
  onDisconnect,
  onStatusChange,
  state,
  onRemoteState,
  initialRoom = '',
  createRealtime = createRealtimeSession,
  syncUrl = SYNC_URL,
  loadStoredRoom,
  saveStoredRoom,
  clearStoredRoom,
  loadStoredDeviceName,
  saveStoredDeviceName,
}: SyncPanelProps) {
  const { t, intlLocale } = useOkrI18n();
  const deviceNameId = useId();
  const [mode, setMode] = useState<SyncMode>('host');
  const [started, setStarted] = useState(false);
  const [booted, setBooted] = useState(false);
  const [pendingRoom, setPendingRoom] = useState<SyncTarget | null>(null);
  const [deviceName, setDeviceName] = useState(() => randomDeviceName());
  const [nameDraft, setNameDraft] = useState(deviceName);
  const [status, setStatus] = useState<PanelStatus>('idle');
  const [room, setRoom] = useState('');
  const [roomUrl, setRoomUrl] = useState('');
  const [revision, setRevision] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [joinInput, setJoinInput] = useState('');
  const [error, setError] = useState('');
  const [peers, setPeers] = useState<RealtimePeer[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [copied, setCopied] = useState(false);
  const sessionRef = useRef<RealtimeSession | null>(null);
  const stateRef = useRef(state);
  const onRemoteStateRef = useRef(onRemoteState);
  const skipSendRef = useRef(false);
  const readyToSendRef = useRef(false);
  /** Adopt only the first state of a session, and only on a fresh install. */
  const firstStateRef = useRef(true);
  const copiedTimer = useRef<number | null>(null);

  stateRef.current = state;
  onRemoteStateRef.current = onRemoteState;

  useEffect(() => {
    return () => {
      if (copiedTimer.current !== null) {
        window.clearTimeout(copiedTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [savedRoom, savedDevice] = await Promise.all([
        loadStoredRoom?.(),
        loadStoredDeviceName?.(),
      ]);
      if (cancelled) return;
      if (savedDevice) {
        setDeviceName(savedDevice);
        setNameDraft(savedDevice);
      } else {
        // First launch: keep the friendly generated name on this device.
        void saveStoredDeviceName?.(deviceName);
      }
      const linkRoom = parseSyncLink(initialRoom);
      if (linkRoom) {
        setMode('join');
        setPendingRoom(linkRoom);
        setStarted(true);
      } else if (savedRoom) {
        setMode(savedRoom.role);
        setPendingRoom({ room: savedRoom.room, key: savedRoom.key });
        setStarted(true);
      }
      setBooted(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [initialRoom, loadStoredRoom, loadStoredDeviceName]);

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  function applyRemoteState(value: unknown, meta: RealtimeStateMeta) {
    setRevision(meta.revision);
    setUpdatedAt(meta.updatedAt);
    const parsed = parseState(value);
    if (parsed.status === 'newer') {
      setError(t('sync.newerVersion'));
      return;
    }
    if (parsed.status === 'invalid') {
      setError(t('sync.invalidState'));
      return;
    }
    const remoteState = parsed.state;
    // A fresh install only holds the sample placeholders, so it adopts the
    // room instead of pushing samples into it. Any device with real data
    // merges: joining must never wipe local objectives, even when the room is
    // empty.
    const localState = stateRef.current;
    const pristineSample =
      canonicalJson(withoutProfile(localState)) ===
      canonicalJson(createSampleState());
    const adopt = firstStateRef.current && pristineSample;
    firstStateRef.current = false;
    // Adopting takes the room's objectives, then merges the display name so a
    // name set on this device still reaches the room.
    const next = adopt
      ? mergeStates(
          localState.profile
            ? { ...remoteState, profile: localState.profile }
            : remoteState,
          remoteState,
        )
      : mergeStates(localState, remoteState);
    // Keep the ref current for messages that arrive before React re-renders.
    stateRef.current = next;
    // Only talk back when merging produced something the sender lacks; a
    // deterministic merge stops after both sides agree.
    skipSendRef.current =
      canonicalJson(next) === canonicalJson(remoteState);
    readyToSendRef.current = true;
    onRemoteStateRef.current(next);
  }

  function handleStatus(next: RealtimeStatus) {
    setStatus(next);
    if (next === 'connected') readyToSendRef.current = true;
  }

  function connectRoom(
    nextRoom: string,
    role: SyncMode,
    nextKey: string,
  ) {
    sessionRef.current?.close();
    firstStateRef.current = true;
    setRevision(0);
    setUpdatedAt(null);
    const session = createRealtime({
      url: syncUrl,
      room: nextRoom,
      key: nextKey,
      device: deviceName,
      ...(role === 'host' ? { initialState: stateRef.current } : {}),
      onState: applyRemoteState,
      onVersion: (meta) => {
        setRevision(meta.revision);
        setUpdatedAt(meta.updatedAt);
      },
      onPeers: setPeers,
      onStatus: handleStatus,
      onError: (reason) => setError(messageOf(reason)),
    });
    sessionRef.current = session;
    void saveStoredRoom?.({ room: nextRoom, role, key: nextKey });
    setRoom(nextRoom);
    setRoomUrl(
      buildSyncUrl(
        `${window.location.origin}${window.location.pathname}`,
        nextRoom,
        nextKey,
      ),
    );
    setStatus(session.status);
    setError('');
  }

  useEffect(() => {
    if (!started) return;
    readyToSendRef.current = false;
    skipSendRef.current = false;
    setPeers([]);
    setError('');
    setCopied(false);
    setShowScanner(false);
    setRevision(0);
    setUpdatedAt(null);

    if (mode === 'host' && pendingRoom) {
      connectRoom(pendingRoom.room, 'host', pendingRoom.key);
    } else if (mode === 'join' && pendingRoom) {
      connectRoom(pendingRoom.room, 'join', pendingRoom.key);
    } else {
      setStatus('idle');
      setRoom('');
      setRoomUrl('');
    }

    return () => {
      sessionRef.current?.close();
      sessionRef.current = null;
    };
    // connectRoom is intentionally not a dependency: it would recreate the
    // session on every render.
  }, [started, mode, deviceName, pendingRoom, createRealtime, syncUrl]);

  useEffect(() => {
    if (!started || !readyToSendRef.current) return;
    if (skipSendRef.current) {
      skipSendRef.current = false;
      return;
    }
    sessionRef.current?.sendState(state);
  }, [state, started]);

  function applyDeviceName() {
    const next = nameDraft.trim();
    if (!next || next === deviceName) return;
    void saveStoredDeviceName?.(next);
    setDeviceName(next);
    setNameDraft(next);
  }

  function selectHost() {
    setMode('host');
    setPendingRoom({ room: createRoomId(), key: createRoomKey() });
    setStarted(true);
  }

  function selectJoin() {
    setMode('join');
    setPendingRoom(null);
    setStarted(true);
  }

  function backToChoice() {
    setStarted(false);
    setMode('host');
    setPendingRoom(null);
    setStatus('idle');
    setRoom('');
    setRoomUrl('');
    setPeers([]);
    setError('');
    setShowScanner(false);
  }

  function joinWith(value: string) {
    if (mode !== 'join' || !value.trim()) return;
    const target = parseSyncLink(value);
    if (!target) {
      setError(t('sync.invalidLink'));
      return;
    }
    connectRoom(target.room, 'join', target.key);
    setJoinInput('');
    setShowScanner(false);
  }

  async function copyLink() {
    if (!roomUrl) return;
    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      if (copiedTimer.current !== null) {
        window.clearTimeout(copiedTimer.current);
      }
      copiedTimer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch (reason) {
      setError(messageOf(reason));
    }
  }

  function disconnect() {
    void clearStoredRoom?.();
    setStarted(false);
    setMode('host');
    setPendingRoom(null);
    setStatus('idle');
    setRoom('');
    setRoomUrl('');
    setPeers([]);
    setError('');
    setShowScanner(false);
    setRevision(0);
    setUpdatedAt(null);
    if (onDisconnect) onDisconnect();
    else onClose();
  }

  const statusText =
    status === 'connecting'
      ? t('sync.connecting')
      : status === 'connected'
        ? t('sync.realtimeConnected')
        : status === 'reconnecting'
          ? t('sync.reconnecting')
          : status === 'failed'
            ? t('sync.failed')
            : '';
  const isConnected = status === 'connected';

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={t('sync.title')}
      closeLabel={t('common.close')}
    >
      <div className={styles.panel}>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor={deviceNameId}>
            {t('sync.deviceName')}
          </label>
          <div className={styles.row}>
            <TextInput
              id={deviceNameId}
              className={styles.nameInput}
              aria-label={t('sync.deviceName')}
              value={nameDraft}
              maxLength={40}
              disabled={isConnected}
              onChange={(event) => setNameDraft(event.target.value)}
            />
            <Button
              size="compact"
              variant="secondary"
              onClick={applyDeviceName}
              disabled={
                isConnected ||
                nameDraft.trim() === '' ||
                nameDraft.trim() === deviceName
              }
            >
              {t('sync.saveName')}
            </Button>
          </div>
        </div>

        {!booted ? (
          <p className={styles.status} role="status">
            {t('sync.loadingRoom')}
          </p>
        ) : !started ? (
          <div className={styles.choice}>
            <p className={styles.hint}>{t('sync.chooseHint')}</p>
            <div className={styles.actions}>
              <Button variant="primary" onClick={selectHost}>
                {t('sync.host')}
              </Button>
              <Button variant="secondary" onClick={selectJoin}>
                {t('sync.join')}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {statusText && (
              <p className={styles.status} role="status">
                {statusText}
              </p>
            )}
            {error && (
              <p className={styles.error} role="alert">
                {t('sync.error', { error })}
              </p>
            )}

            {room && (
              <div className={styles.roomMeta}>
                <p className={styles.status}>
                  {t('sync.roomId')}:{' '}
                  <code className={styles.roomId}>{room}</code>
                </p>
                <p className={styles.status}>
                  {t('sync.dataVersion', { version: revision })}
                </p>
                {updatedAt && (
                  <p className={styles.status}>
                    {t('sync.lastUpdated', {
                      time: new Date(updatedAt).toLocaleTimeString(intlLocale),
                    })}
                  </p>
                )}
              </div>
            )}

            {roomUrl && (
              <div className={styles.qr}>
                <QrCode
                  value={roomUrl}
                  size={280}
                  label={t('sync.offerQr')}
                />
                <p className={styles.hint}>{t('sync.hostHint')}</p>
                <div className={styles.row}>
                  <Button size="compact" onClick={() => void copyLink()}>
                    {t('sync.copy')}
                  </Button>
                  {copied && (
                    <span className={styles.status} role="status">
                      {t('sync.copied')}
                    </span>
                  )}
                </div>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>
                    {t('sync.roomLink')}
                  </span>
                  <TextArea
                    className={styles.code}
                    readOnly
                    rows={2}
                    value={roomUrl}
                    aria-label={t('sync.roomLink')}
                  />
                </label>
                <p className={styles.hint}>{t('sync.roomLinkHint')}</p>
              </div>
            )}

            {mode === 'join' && !roomUrl && status === 'idle' && (
              <>
                {showScanner ? (
                  <div className={styles.scanner}>
                    <QrScanner
                      onScan={(value) => {
                        setShowScanner(false);
                        joinWith(value);
                      }}
                      labels={{
                        scanning: t('sync.scanHint'),
                        camera: t('sync.camera'),
                        unavailable: t('sync.cameraUnavailable'),
                        insecure: t('sync.cameraInsecure'),
                        permission: t('sync.cameraPermission'),
                        error: t('sync.cameraError'),
                        success: t('sync.scanSuccess'),
                      }}
                    />
                    <Button
                      size="compact"
                      variant="secondary"
                      onClick={() => setShowScanner(false)}
                    >
                      {t('sync.stopScan')}
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => setShowScanner(true)}
                  >
                    {t('sync.scan')}
                  </Button>
                )}

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>
                    {t('sync.roomLink')}
                  </span>
                  <TextArea
                    className={styles.code}
                    rows={2}
                    value={joinInput}
                    onChange={(event) => setJoinInput(event.target.value)}
                    placeholder={t('sync.joinPlaceholder')}
                  />
                </label>
                <Button
                  variant="primary"
                  onClick={() => joinWith(joinInput)}
                  disabled={joinInput.trim() === ''}
                >
                  {t('sync.connect')}
                </Button>
                <Button
                  variant="plain"
                  size="compact"
                  onClick={backToChoice}
                >
                  {t('sync.back')}
                </Button>
              </>
            )}

            {roomUrl && (
              <div className={styles.row}>
                {isConnected && (
                  <Badge tone="success">{t('sync.realtimeBadge')}</Badge>
                )}
                <Button variant="plain" size="compact" onClick={disconnect}>
                  {t('sync.disconnect')}
                </Button>
              </div>
            )}

            {peers.length > 0 && (
              <div>
                <p className={styles.section}>{t('sync.connectedDevices')}</p>
                <ul className={styles.peers}>
                  {peers.map((peer) => (
                    <li className={styles.peer} key={peer.id}>
                      <span className={styles.peerLabel}>{peer.device}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </Sheet>
  );
}
