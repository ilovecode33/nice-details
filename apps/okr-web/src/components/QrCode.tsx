import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import styles from './QrCode.module.css';

export interface QrCodeProps {
  value: string;
  size?: number;
  label: string;
  className?: string;
}

/** Renders a QR code as an inline SVG with fixed black-on-white contrast. */
export function QrCode({
  value,
  size = 280,
  label,
  className = '',
}: QrCodeProps) {
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!value) {
      setSvg('');
      setError('');
      return;
    }
    let cancelled = false;
    QRCode.toString(value, {
      type: 'svg',
      margin: 1,
      width: size,
      errorCorrectionLevel: 'L',
      color: { dark: '#000000', light: '#ffffff' },
    })
      .then((next) => {
        if (cancelled) return;
        setSvg(next);
        setError('');
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        setSvg('');
        setError(reason instanceof Error ? reason.message : String(reason));
      });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (error) {
    return (
      <p className={styles.error} role="alert">
        {error}
      </p>
    );
  }

  return (
    <div
      className={[styles.qr, className].filter(Boolean).join(' ')}
      role="img"
      aria-label={label}
      aria-busy={!svg || undefined}
      style={{ width: size, maxWidth: '100%' }}
      {...(svg
        ? { dangerouslySetInnerHTML: { __html: svg } }
        : {
            children: (
              <span className={styles.placeholder} aria-hidden="true" />
            ),
          })}
    />
  );
}
