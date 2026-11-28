import { useEffect, useId, useRef, useState } from 'react';
import { Badge, Button, Select, Sheet, TextArea, TextInput } from '@ilovecode33/ui';
import type { OKRState } from '@ilovecode33/okr-shared';
import { loadDeviceName, saveDeviceName } from '../deviceName';
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
} from '../realtime';
import { SYNC_URL } from '../syncConfig';
import { QrCode } from './QrCode';
import { QrScanner } from './QrScanner';
import styles from './SyncPanel.module.css';

type SyncMode = 'host' | 'join';
type PanelStatus = RealtimeStatus | 'idle';

function isOkrState(value: unknown): value is OKRState {
  if (typeof value !== 'object' || value === null) return false;
  const state = value as Partial<OKRState>;
  return state.version === 1 && Array.isArray(state.objectives);
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export interface SyncPanelProps {
  open: boolean;
  onClose: () => void;
  onDisconnect?: () => void;
  state: OKRState;
  onRemoteState: (state: OKRState) => void;
  initialMode?: SyncMode;
  initialRoom?: string;
  /** Injected in tests; defaults to the realtime WebSocket client. */
  createRealtime?: typeof createRealtimeSession;
  syncUrl?: string;
}

export function SyncPanel({
  open,
  onClose,
  onDisconnect,
  state,
  onRemoteState,
  initialMode = 'host',
  initialRoom = '',
  createRealtime = createRealtimeSession,
  syncUrl = SYNC_URL,
}: SyncPanelProps) {
  const { t, intlLocale } = useOkrI18n();
  const deviceNameId = useId();
  const [mode, setMode] = useState<SyncMode>(initialMode);
  const [started, setStarted] = useState(false);
  const [deviceName, setDeviceName] = useState(() => loadDeviceName());
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
    if (open) setStarted(true);
  }, [open]);

  function applyRemoteState(value: unknown, meta: RealtimeStateMeta) {
    setRevision(meta.revision);
    setUpdatedAt(meta.updatedAt);
    if (!isOkrState(value)) return;
    skipSendRef.current = true;
    readyToSendRef.current = true;
    onRemoteStateRef.current(value);
  }

  function handleStatus(next: RealtimeStatus) {
    setStatus(next);
    if (next === 'connected') readyToSendRef.current = true;
  }

  function connectRoom(nextRoom: string, role: SyncMode) {
    sessionRef.current?.close();
    setRevision(0);
    setUpdatedAt(null);
    const session = createRealtime({
      url: syncUrl,
      room: nextRoom,
      device: deviceName,
      ...(role === 'host' ? { initialState: stateRef.current } : {}),
      onState: applyRemoteState,
      onVersion: (meta) => {
        setRevision(meta.revision);
        setUpdatedAt(meta.updatedAt);
      },
      onPeers: setPeers,
      onStatus: handleStatus,
    });
    sessionRef.current = session;
    setRoom(nextRoom);
    setRoomUrl(
      buildSyncUrl(
        `${window.location.origin}${window.location.pathname}`,
        nextRoom,
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

    if (mode === 'host') {
      connectRoom(createRoomId(), 'host');
    } else if (initialRoom) {
      const nextRoom = parseSyncLink(initialRoom);
      if (nextRoom) {
        connectRoom(nextRoom, 'join');
      } else {
        setStatus('failed');
        setError(t('sync.invalidLink'));
      }
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
  }, [started, mode, deviceName, initialRoom, createRealtime, syncUrl]);

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
    saveDeviceName(next);
    setDeviceName(next);
    setNameDraft(next);
  }

  function joinWith(value: string) {
    if (mode !== 'join' || !value.trim()) return;
    const nextRoom = parseSyncLink(value);
    if (!nextRoom) {
      setError(t('sync.invalidLink'));
      return;
    }
    connectRoom(nextRoom, 'join');
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
    setStarted(false);
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

        <label className={styles.field}>
          <span className={styles.fieldLabel}>{t('sync.mode')}</span>
          <Select
            aria-label={t('sync.mode')}
            value={mode}
            options={[
              { value: 'host', label: t('sync.host') },
              { value: 'join', label: t('sync.join') },
            ]}
            onChange={(event) => setMode(event.target.value as SyncMode)}
          />
        </label>

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

        {mode === 'host' && roomUrl && (
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
              <span className={styles.fieldLabel}>{t('sync.roomLink')}</span>
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

        {mode === 'join' && status === 'idle' && (
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
              <span className={styles.fieldLabel}>{t('sync.roomLink')}</span>
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
          </>
        )}

        {mode === 'join' && status !== 'idle' && status !== 'failed' && (
          <p className={styles.hint}>{t('sync.joinHint')}</p>
        )}

        {(isConnected || status === 'reconnecting') && (
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

        {room && isConnected && peers.length === 0 && (
          <p className={styles.hint}>{t('sync.hostHint')}</p>
        )}
      </div>
    </Sheet>
  );
}
