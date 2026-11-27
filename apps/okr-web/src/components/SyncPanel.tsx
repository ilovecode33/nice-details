import { useEffect, useRef, useState } from 'react';
import { Badge, Button, Select, Sheet, TextArea } from '@ilovecode33/ui';
import {
  QrCode,
  QrScanner,
  createLocalSync,
  decodeSignal,
  encodeSignal,
  type LocalSyncOptions,
  type LocalSyncPeer,
  type LocalSyncSession,
  type LocalSyncState,
  type PeerSignal,
} from '@ilovecode33/local-sync';
import type { OKRState } from '@ilovecode33/okr-shared';
import { useOkrI18n } from '../i18n';
import styles from './SyncPanel.module.css';

type SyncMode = 'host' | 'join';

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
  /** Injected in tests; defaults to the real WebRTC factory. */
  createSession?: (options: LocalSyncOptions) => LocalSyncSession;
}

export function SyncPanel({
  open,
  onClose,
  state,
  onRemoteState,
  createSession = createLocalSync,
}: SyncPanelProps) {
  const { t } = useOkrI18n();
  const [mode, setMode] = useState<SyncMode>('host');
  const [status, setStatus] = useState<LocalSyncState>('idle');
  const [offerCode, setOfferCode] = useState('');
  const [answerCode, setAnswerCode] = useState('');
  const [answerInput, setAnswerInput] = useState('');
  const [offerInput, setOfferInput] = useState('');
  const [error, setError] = useState('');
  const [known, setKnown] = useState(false);
  const [peers, setPeers] = useState<LocalSyncPeer[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [copied, setCopied] = useState<'offer' | 'answer' | null>(null);
  const sessionRef = useRef<LocalSyncSession | null>(null);
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

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setStatus('idle');
    setOfferCode('');
    setAnswerCode('');
    setAnswerInput('');
    setOfferInput('');
    setError('');
    setKnown(false);
    setPeers([]);
    setShowScanner(false);
    setCopied(null);
    connectedRef.current = false;
    skipSendRef.current = false;

    const session = createSession({
      role: mode === 'host' ? 'host' : 'guest',
      label: labelRef.current,
    });
    sessionRef.current = session;

    const refreshPeers = () => {
      void session.listPeers().then(setPeers).catch(() => {});
    };
    refreshPeers();

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
      setStatus(next);
      connectedRef.current = next === 'connected';
      if (next === 'connected') {
        setKnown(session.knownPeer);
        refreshPeers();
        if (session.role === 'host') sendState();
      }
    });

    if (mode === 'host') {
      session
        .createOffer()
        .then(async (offer: PeerSignal) => {
          const code = await encodeSignal(offer);
          if (!cancelled) setOfferCode(code);
        })
        .catch((reason: unknown) => {
          if (!cancelled) setError(messageOf(reason));
        });
    }

    return () => {
      cancelled = true;
      offMessage();
      offState();
      session.close();
      if (sessionRef.current === session) sessionRef.current = null;
      connectedRef.current = false;
    };
  }, [open, mode, createSession]);

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

  async function connectWithAnswer(code: string) {
    const session = sessionRef.current;
    if (!session || session.role !== 'host' || !code.trim()) return;
    setError('');
    try {
      const answer = await decodeSignal(code.trim());
      await session.acceptAnswer(answer);
      setAnswerInput('');
      setShowScanner(false);
      setKnown(session.knownPeer);
      setPeers(await session.listPeers());
    } catch (reason) {
      setError(messageOf(reason));
    }
  }

  async function connectWithOffer(code: string) {
    const session = sessionRef.current;
    if (!session || session.role !== 'guest' || !code.trim()) return;
    setError('');
    try {
      const offer = await decodeSignal(code.trim());
      const answer = await session.acceptOffer(offer);
      setAnswerCode(await encodeSignal(answer));
      setOfferInput('');
      setShowScanner(false);
      setKnown(session.knownPeer);
      setPeers(await session.listPeers());
    } catch (reason) {
      setError(messageOf(reason));
    }
  }

  function handleScan(code: string) {
    if (mode === 'host') void connectWithAnswer(code);
    else void connectWithOffer(code);
  }

  async function copyCode(code: string, source: 'offer' | 'answer') {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(source);
      if (copiedTimer.current !== null) {
        window.clearTimeout(copiedTimer.current);
      }
      copiedTimer.current = window.setTimeout(() => setCopied(null), 2000);
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
    status === 'creating-offer'
      ? t('sync.creating')
      : status === 'awaiting-answer'
        ? t('sync.awaitingAnswer')
        : status === 'connecting'
          ? t('sync.connecting')
          : status === 'connected'
            ? t('sync.connected')
            : status === 'failed'
              ? t('sync.failed')
              : '';
  const isConnected = status === 'connected';
  const codeInput = mode === 'host' ? answerInput : offerInput;
  const setCodeInput =
    mode === 'host' ? setAnswerInput : setOfferInput;

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

        {mode === 'host' && !isConnected && offerCode && (
          <div className={styles.qr}>
            <QrCode value={offerCode} label={t('sync.offerQr')} />
            <p className={styles.hint}>{t('sync.hostHint')}</p>
            <div className={styles.row}>
              <Button
                size="compact"
                onClick={() => void copyCode(offerCode, 'offer')}
              >
                {t('sync.copy')}
              </Button>
              {copied === 'offer' && (
                <span className={styles.status} role="status">
                  {t('sync.copied')}
                </span>
              )}
            </div>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>{t('sync.offerCode')}</span>
              <TextArea
                className={styles.code}
                readOnly
                rows={3}
                value={offerCode}
                aria-label={t('sync.offerCode')}
              />
            </label>
          </div>
        )}

        {mode === 'join' && !isConnected && answerCode && (
          <div className={styles.qr}>
            <QrCode value={answerCode} label={t('sync.answerQr')} />
            <p className={styles.hint}>{t('sync.joinHint')}</p>
            <div className={styles.row}>
              <Button
                size="compact"
                onClick={() => void copyCode(answerCode, 'answer')}
              >
                {t('sync.copy')}
              </Button>
              {copied === 'answer' && (
                <span className={styles.status} role="status">
                  {t('sync.copied')}
                </span>
              )}
            </div>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>{t('sync.answerCode')}</span>
              <TextArea
                className={styles.code}
                readOnly
                rows={3}
                value={answerCode}
                aria-label={t('sync.answerCode')}
              />
            </label>
          </div>
        )}

        {!isConnected &&
          (showScanner ? (
            <div className={styles.scanner}>
              <QrScanner
                onScan={handleScan}
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
            <Button variant="secondary" onClick={() => setShowScanner(true)}>
              {t('sync.scan')}
            </Button>
          ))}

        {!isConnected && (
          <>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>
                {mode === 'host'
                  ? t('sync.pasteAnswer')
                  : t('sync.pasteOffer')}
              </span>
              <TextArea
                className={styles.code}
                rows={3}
                value={codeInput}
                onChange={(event) => setCodeInput(event.target.value)}
                placeholder={
                  mode === 'host'
                    ? t('sync.pasteAnswer')
                    : t('sync.pasteOffer')
                }
              />
            </label>
            <Button
              variant="primary"
              onClick={() =>
                mode === 'host'
                  ? void connectWithAnswer(codeInput)
                  : void connectWithOffer(codeInput)
              }
              disabled={codeInput.trim() === ''}
            >
              {t('sync.connect')}
            </Button>
          </>
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
