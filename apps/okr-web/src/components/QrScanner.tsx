import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import styles from './QrScanner.module.css';

export interface QrScannerLabels {
  scanning: string;
  camera: string;
  unavailable: string;
  insecure: string;
  permission: string;
  error: string;
  success: string;
}

export interface QrScannerProps {
  onScan: (value: string) => void;
  onError?: (error: Error) => void;
  labels: QrScannerLabels;
  className?: string;
}

/**
 * Camera QR scanner for the room link. Stops the camera after the first
 * successful decode and releases all tracks on unmount.
 */
export function QrScanner({
  onScan,
  onError,
  labels,
  className = '',
}: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<'starting' | 'scanning' | 'scanned' | 'error'>('starting');
  const [error, setError] = useState('');
  const onScanRef = useRef(onScan);
  const onErrorRef = useRef(onError);
  onScanRef.current = onScan;
  onErrorRef.current = onError;

  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | null = null;
    let frame = 0;
    let lastScan = 0;
    const video = videoRef.current;
    if (!video) return;

    const fail = (message: string) => {
      if (cancelled) return;
      setStatus('error');
      setError(message);
      onErrorRef.current?.(new Error(message));
    };

    setStatus('starting');
    setError('');

    if (typeof window === 'undefined') return;
    if (!window.isSecureContext) {
      fail(labels.insecure);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      fail(labels.unavailable);
      return;
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
      fail(labels.error);
      return;
    }

    const scan = () => {
      if (cancelled) return;
      if (video.readyState >= 2) {
        const now = performance.now();
        if (now - lastScan >= 180) {
          lastScan = now;
          const max = 640;
          const scale = Math.min(
            1,
            max / Math.max(video.videoWidth, video.videoHeight),
          );
          const width = Math.max(1, Math.round(video.videoWidth * scale));
          const height = Math.max(1, Math.round(video.videoHeight * scale));
          if (width > 1 && height > 1) {
            canvas.width = width;
            canvas.height = height;
            context.drawImage(video, 0, 0, width, height);
            const image = context.getImageData(0, 0, width, height);
            const result = jsQR(image.data, width, height, {
              inversionAttempts: 'dontInvert',
            });
            if (result?.data) {
              setStatus('scanned');
              onScanRef.current(result.data);
              if (stream) {
                for (const track of stream.getTracks()) track.stop();
              }
              return;
            }
          }
        }
      }
      frame = requestAnimationFrame(scan);
    };

    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
      .then(async (next) => {
        if (cancelled) {
          for (const track of next.getTracks()) track.stop();
          return;
        }
        stream = next;
        video.srcObject = next;
        try {
          await video.play();
        } catch {
          /* Autoplay can be blocked; frames still arrive once playing. */
        }
        if (cancelled) return;
        setStatus('scanning');
        frame = requestAnimationFrame(scan);
      })
      .catch((reason: unknown) => {
        const name =
          reason instanceof DOMException
            ? reason.name
            : (reason as { name?: string } | null)?.name ?? '';
        fail(
          name === 'NotAllowedError' || name === 'SecurityError'
            ? labels.permission
            : labels.error,
        );
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      if (stream) {
        for (const track of stream.getTracks()) track.stop();
      }
      if (video) video.srcObject = null;
    };
  }, [
    labels.camera,
    labels.error,
    labels.insecure,
    labels.permission,
    labels.unavailable,
  ]);

  return (
    <div className={[styles.scanner, className].filter(Boolean).join(' ')}>
      <video
        ref={videoRef}
        className={styles.video}
        muted
        playsInline
        autoPlay
        aria-label={labels.camera}
      />
      {error ? (
        <p className={styles.status} role="alert">
          {error}
        </p>
      ) : (
        <p className={styles.status} role="status">
          {status === 'scanned' ? labels.success : labels.scanning}
        </p>
      )}
    </div>
  );
}
