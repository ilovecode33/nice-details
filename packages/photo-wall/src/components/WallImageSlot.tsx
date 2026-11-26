import { useEffect, useRef, useState } from 'react';
import styles from './WallImageSlot.module.css';

export interface WallImageSlotProps {
  /** Source of the photo to paint. An empty string renders a blank slot. */
  src: string;
  /** Class from the host frame (e.g. `.photo`) applied to the slot element. */
  className?: string;
}

/**
 * Crossfading image slot for one framed print. The previous bitmap stays
 * painted until the new one decodes, so a photo rotation never flashes empty.
 */
export function WallImageSlot({ src, className = '' }: WallImageSlotProps) {
  const [displayed, setDisplayed] = useState(src);
  const [pending, setPending] = useState<string | null>(null);
  const fadeTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (src === displayed) return;
    const preload = new Image();
    let cancelled = false;
    preload.onload = () => {
      if (cancelled) return;
      setPending(src);
      fadeTimer.current = window.setTimeout(() => {
        if (cancelled) return;
        setDisplayed(src);
        setPending(null);
      }, 360);
    };
    preload.onerror = () => {
      if (!cancelled) setDisplayed(src);
    };
    preload.src = src;
    return () => {
      cancelled = true;
      if (fadeTimer.current !== undefined) window.clearTimeout(fadeTimer.current);
    };
  }, [src, displayed]);

  return (
    <span className={`${styles.imgSlot} ${className}`.trim()}>
      <img
        className={styles.imgLayer}
        src={displayed || undefined}
        alt=""
        draggable="false"
        decoding="async"
      />
      {pending && pending !== displayed ? (
        <img
          className={`${styles.imgLayer} ${styles.incoming}`}
          src={pending}
          alt=""
          draggable="false"
          decoding="async"
        />
      ) : null}
    </span>
  );
}
