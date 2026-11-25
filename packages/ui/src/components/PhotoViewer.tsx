import styles from './PhotoViewer.module.css';
import { mediaReducer, mediaSemantics } from '@ilovecode33/ui-core';
import { useEffect, useRef } from 'react';
import { AspectImage } from './AspectImage';
import type { PhotoItem } from '@ilovecode33/ui-types';


/** Fullscreen photo viewer backed by `MediaState` from `@ilovecode33/ui-core`. */

/* ── PhotoViewer ──────────────────────────────────────────────────────────── */

export function PhotoViewer({
  items,
  index,
  onIndexChange,
  onClose,
  title = 'Photo viewer',
  labels = { close: 'Close', previous: 'Previous photo', next: 'Next photo' },
}: {
  items: PhotoItem[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  title?: string;
  labels?: { close?: string; previous?: string; next?: string };
}) {
  const state = { index, count: items.length };
  const semantics = mediaSemantics(state, title);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const current = items[index];

  const go = (event: { type: 'next' } | { type: 'previous' }) =>
    onIndexChange(mediaReducer(state, event).index);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') {
        onIndexChange(mediaReducer(state, { type: 'next' }).index);
      }
      if (event.key === 'ArrowLeft') {
        onIndexChange(mediaReducer(state, { type: 'previous' }).index);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [index, items.length, onClose, onIndexChange]);

  return (
    <div className={styles['ui-viewer']} role="dialog" aria-modal="true" aria-label={semantics.label}>
      <div className={styles['ui-viewer__scrim']} onClick={onClose} />
      <header className={styles['ui-viewer__bar']}>
        <span className={styles['ui-viewer__count']}>
          {index + 1} / {items.length}
        </span>
        <button type="button" className={styles['ui-viewer__close']} aria-label={labels.close} onClick={onClose}>
          ✕
        </button>
      </header>
      <div
        className={styles['ui-viewer__stage']}
        onTouchStart={(event) => {
          const touch = event.touches[0];
          if (touch) touchStart.current = { x: touch.clientX, y: touch.clientY };
        }}
        onTouchEnd={(event) => {
          const start = touchStart.current;
          const touch = event.changedTouches[0];
          touchStart.current = null;
          if (!start || !touch) return;
          const dx = touch.clientX - start.x;
          const dy = touch.clientY - start.y;
          if (Math.abs(dy) > 80 && Math.abs(dy) > Math.abs(dx)) onClose();
          else if (dx < -48) go({ type: 'next' });
          else if (dx > 48) go({ type: 'previous' });
        }}
      >
        {current && (
          <AspectImage
            src={current.src}
            alt={current.alt}
            ratio="3 / 4"
            style={current.style}
          >
            {current.emoji}
          </AspectImage>
        )}
      </div>
      <div className={styles['ui-viewer__controls']}>
        <button
          type="button"
          className={styles['ui-viewer__nav']}
          aria-label={labels.previous}
          disabled={index === 0}
          onClick={() => go({ type: 'previous' })}
        >
          ‹
        </button>
        <button
          type="button"
          className={styles['ui-viewer__nav']}
          aria-label={labels.next}
          disabled={index === items.length - 1}
          onClick={() => go({ type: 'next' })}
        >
          ›
        </button>
      </div>
    </div>
  );
}
