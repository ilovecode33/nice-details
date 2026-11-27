import { useEffect, useRef, useState } from 'react';
import { Badge, Button, Select, Sheet, TextArea } from '@ilovecode33/ui';
import {
  QrCode,
  QrScanner,
  createLocalSync,
  parsePairingCode,
  startRelayPairing,
  type LocalSyncError,
  type LocalSyncOptions,
  type LocalSyncPeer,
  type LocalSyncSession,
  type RelayPairing,
  type RelayPairingOptions,
  type RelayPairingStatus,
} from '@ilovecode33/local-sync';
import type { OKRState } from '@ilovecode33/okr-shared';
import { useOkrI18n } from '../i18n';
import { SYNC_ICE_SERVERS, SYNC_RELAY_URL } from '../syncConfig';
import styles from './SyncPanel.module.css';

type SyncMode = 'host' | 'join';
type PanelStatus = RelayPairingStatus | 'idle';

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isStateMessage(
  value: unknown,
): value is { type: 'state'; state: OKRState } {
  if (typeof value !== 'object' || value === null) return false;
  const message = value as { type?: unknown; state?: unknown };
  if (message.type !== 'state') return false;
  const state = message.state as Partial<OKRState> | null;
  return (
    typeof state === 'object' &&
    state !== null &&
    state.version === 1 &&
    Array.isArray(state.objectives)
  );
}

export interface SyncPanelProps {
  open: boolean;
  onClose: () => void;
  state: OKRState;
  onRemoteState: (state: OKRState) => void;
  initialMode?: SyncMode;
  initialRoom?: string;
  /** Injected in tests; defaults to the real WebRTC factory. */
  createSession?: (options: LocalSyncOptions) => LocalSyncSession;
  /** Injected in tests; defaults to the Cloudflare signaling relay. */
  startPairing?: (options: RelayPairingOptions) => Promise<RelayPairing>;
  relayUrl?: string;
}

export function SyncPanel({
  open,
  onClose,
  state,
  onRemoteState,
  initialMode = 'host',
  initialRoom = '',
  createSession = createLocalSync,
  startPairing = startRelayPairing,
  relayUrl = SYNC_RELAY_URL,
}: SyncPanelProps) {
  const { t } = useOkrI18n();
  const [mode, setMode] = useState<SyncMode>(initialMode);
  const [relayStatus, setRelayStatus] = useState<PanelStatus>('idle');
  const [pairUrl, setPairUrl] = useState('');
  const [joinInput, setJoinInput] = useState('');
  const [error, setError] = useState('');
  const [known, setKnown] = useState(false);
  const [peers, setPeers] = useState<LocalSyncPeer[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [copied, setCopied] = useState(false);
  const sessionRef = useRef<LocalSyncSession | null>(null);
  const pairingRef = useRef<RelayPairing | null>(null);
  const stateRef = useRef(state);
  const onRemoteStateRef = useRef(onRemoteState);
  const labelRef = useRef(t('sync.deviceLabel'));
  const skipSendRef = useRef(false);
  const connectedRef = useRef(false);
  const copiedTimer = useRef<number | null>(null);

  stateRef.current = state;
  onRemoteStateRef.current = onRemoteState;
  labelRef.current = t('sync.deviceLabel');

  useEffect(() => {
    return () => {
      if (copiedTimer.current !== null) {
        window.clearTimeout(copiedTimer.current);
      }
    };
  }, []);

  function refreshPeers(session: LocalSyncSession) {
    void session.listPeers().then(setPeers).catch(() => {});
  }

  function handleStatus(next: RelayPairingStatus) {
    setRelayStatus(next);
    const session = sessionRef.current;
    if (next === 'connected' && session) {
      setKnown(session.knownPeer);
      refreshPeers(session);
    }
  }

  function handleError(reason: LocalSyncError) {
    setRelayStatus('failed');
    setError(messageOf(reason));
  }

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setRelayStatus('idle');
    setPairUrl('');
    setJoinInput(initialRoom);
    setError('');
    setKnown(false);
    setPeers([]);
    setShowScanner(false);
    setCopied(false);
    connectedRef.current = false;
    skipSendRef.current = false;

    const session = createSession({
      role: mode === 'host' ? 'host' : 'guest',
      label: labelRef.current,
      iceServers: SYNC_ICE_SERVERS,
    });
    sessionRef.current = session;

    refreshPeers(session);

    const sendState = () => {
      const current = sessionRef.current;
      if (!current) return;
      try {
        current.send(
          JSON.stringify({ type: 'state', state: stateRef.current }),
        );
      } catch (reason) {
        setError(messageOf(reason));
      }
    };

    const offMessage = session.onMessage((message) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(message);
      } catch {
        return;
      }
      if (!isStateMessage(parsed)) return;
      skipSendRef.current = true;
      onRemoteStateRef.current(parsed.state);
      setKnown(session.knownPeer);
    });

    const offState = session.onStateChange((next) => {
      connectedRef.current = next === 'connected';
      if (next === 'connected') {
        setKnown(session.knownPeer);
        refreshPeers(session);
        if (session.role === 'host') sendState();
      }
    });

    const start = async (room?: string) => {
      if (cancelled) return;
      setRelayStatus('connecting');
      try {
        const pairing = await startPairing({
          relayUrl,
          role: mode === 'host' ? 'host' : 'guest',
          session,
          ...(room ? { room } : {}),
          onStatus: handleStatus,
          onError: handleError,
        });
        if (cancelled) {
          pairing.close();
          return;
        }
        pairingRef.current = pairing;
        setPairUrl(pairing.pairUrl);
        setRelayStatus(pairing.status);
        if (mode === 'join') setJoinInput('');
      } catch (reason) {
        if (!cancelled) {
          setRelayStatus('failed');
          setError(messageOf(reason));
        }
      }
    };

    if (mode === 'host') {
      void start();
    } else if (initialRoom) {
      const room = parsePairingCode(initialRoom);
      if (room) {
        void start(room);
      } else {
        setRelayStatus('failed');
        setError(t('sync.invalidLink'));
      }
    }

    return () => {
      cancelled = true;
      offMessage();
      offState();
      pairingRef.current?.close();
      pairingRef.current = null;
      session.close();
      if (sessionRef.current === session) sessionRef.current = null;
      connectedRef.current = false;
    };
  }, [open, mode, createSession, startPairing, relayUrl]);

  useEffect(() => {
    if (!connectedRef.current) return;
    const session = sessionRef.current;
    if (!session) return;
    if (skipSendRef.current) {
      skipSendRef.current = false;
      return;
    }
    try {
      session.send(JSON.stringify({ type: 'state', state }));
    } catch (reason) {
      setError(messageOf(reason));
    }
  }, [state]);

  async function joinWith(value: string) {
    const session = sessionRef.current;
    if (!session || session.role !== 'guest' || !value.trim()) return;
    const room = parsePairingCode(value);
    if (!room) {
      setError(t('sync.invalidLink'));
      return;
    }
    setError('');
    setShowScanner(false);
    setRelayStatus('connecting');
    try {
      pairingRef.current?.close();
      const pairing = await startPairing({
        relayUrl,
        role: 'guest',
        session,
        room,
        onStatus: handleStatus,
        onError: handleError,
      });
      pairingRef.current = pairing;
      setPairUrl(pairing.pairUrl);
      setRelayStatus(pairing.status);
      setJoinInput('');
    } catch (reason) {
      setRelayStatus('failed');
      setError(messageOf(reason));
    }
  }

  async function copyLink() {
    if (!pairUrl) return;
    try {
      await navigator.clipboard.writeText(pairUrl);
      setCopied(true);
      if (copiedTimer.current !== null) {
        window.clearTimeout(copiedTimer.current);
      }
      copiedTimer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch (reason) {
      setError(messageOf(reason));
    }
  }

  async function forgetPeer(id: string) {
    const session = sessionRef.current;
    if (!session) return;
    await session.forgetPeer(id);
    setPeers(await session.listPeers());
    setKnown(false);
  }

  const statusText =
    relayStatus === 'connecting'
      ? t('sync.creating')
      : relayStatus === 'waiting'
        ? mode === 'host'
          ? t('sync.waitingForGuest')
          : t('sync.waitingForHost')
        : relayStatus === 'signaling'
          ? t('sync.connecting')
          : relayStatus === 'connected'
            ? t('sync.connected')
            : relayStatus === 'failed'
              ? t('sync.failed')
              : '';
  const isConnected = relayStatus === 'connected';
  const canJoin =
    mode === 'join' &&
    !isConnected &&
    (relayStatus === 'idle' || relayStatus === 'failed');

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={t('sync.title')}
      closeLabel={t('common.close')}
    >
      <div className={styles.panel}>
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

        {mode === 'host' && !isConnected && pairUrl && (
          <div className={styles.qr}>
            <QrCode
              value={pairUrl}
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
              <span className={styles.fieldLabel}>{t('sync.pairLink')}</span>
              <TextArea
                className={styles.code}
                readOnly
                rows={2}
                value={pairUrl}
                aria-label={t('sync.pairLink')}
              />
            </label>
          </div>
        )}

        {mode === 'join' && canJoin && (
          <>
            {showScanner ? (
              <div className={styles.scanner}>
                <QrScanner
                  onScan={(value) => void joinWith(value)}
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
              <span className={styles.fieldLabel}>{t('sync.pairLink')}</span>
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
              onClick={() => void joinWith(joinInput)}
              disabled={joinInput.trim() === ''}
            >
              {t('sync.connect')}
            </Button>
          </>
        )}

        {mode === 'join' &&
          !isConnected &&
          relayStatus !== 'idle' &&
          relayStatus !== 'failed' && (
            <p className={styles.hint}>{t('sync.joinHint')}</p>
          )}

        {isConnected && (
          <div className={styles.row}>
            <Badge tone={known ? 'success' : 'neutral'}>
              {known ? t('sync.known') : t('sync.newPairing')}
            </Badge>
          </div>
        )}

        {peers.length > 0 && (
          <div>
            <p className={styles.section}>{t('sync.peers')}</p>
            <ul className={styles.peers}>
              {peers.map((peer) => (
                <li className={styles.peer} key={peer.id}>
                  <span className={styles.peerLabel}>{peer.label}</span>
                  <Button
                    size="compact"
                    variant="plain"
                    onClick={() => void forgetPeer(peer.id)}
                  >
                    {t('sync.forget')}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Sheet>
  );
}
