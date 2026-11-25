/**
 * Content and media components. Index and selection state come from the
 * `MediaState` / `SelectionModeState` contracts in `@ilovecode33/ui-core`.
 */

import {
  mediaReducer,
  mediaSemantics,
  selectionModeReducer,
} from '@ilovecode33/ui-core';
import { useEffect, useReducer, useRef, type CSSProperties, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from './css';

/* ── AspectImage / Thumbnail / Avatar ─────────────────────────────────────── */

export function AspectImage({
  src,
  alt,
  ratio = '4 / 3',
  style,
  children,
}: {
  src?: string;
  alt?: string;
  ratio?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <div className={cn('ui-aspect')} style={{ aspectRatio: ratio, ...style }}>
      {src ? (
        <img className={cn('ui-aspect__img')} src={src} alt={alt ?? ''} loading="lazy" />
      ) : (
        <div className={cn('ui-aspect__placeholder')} role="img" aria-label={alt}>
          {children}
        </div>
      )}
    </div>
  );
}

export function Thumbnail({
  src,
  alt = '',
  emoji,
}: {
  src?: string;
  alt?: string;
  emoji?: ReactNode;
}) {
  return (
    <span className={cn('ui-thumbnail')}>
      {src ? <img src={src} alt={alt} loading="lazy" /> : <span aria-hidden="true">{emoji}</span>}
    </span>
  );
}

export function Avatar({
  name,
  src,
  size = 'default',
}: {
  name: string;
  src?: string;
  size?: 'small' | 'default';
}) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <span className={cn(`ui-avatar ui-avatar--${size}`)} role="img" aria-label={name}>
      {src ? <img src={src} alt="" /> : initials}
    </span>
  );
}

/* ── PhotoGrid ────────────────────────────────────────────────────────────── */

export interface PhotoItem {
  id: string;
  src?: string;
  alt: string;
  emoji?: ReactNode;
  style?: CSSProperties;
}

export function PhotoGrid({
  items,
  selectedIds = [],
  selectionMode = false,
  onToggle,
  onOpen,
  label = 'Photos',
}: {
  items: PhotoItem[];
  selectedIds?: readonly string[];
  selectionMode?: boolean;
  onToggle?: (id: string) => void;
  onOpen?: (index: number) => void;
  label?: string;
}) {
  return (
    <div className={cn('ui-photogrid')} role="list" aria-label={label}>
      {items.map((item, index) => {
        const selected = selectedIds.includes(item.id);
        return (
          <div key={item.id} role="listitem" className={cn('ui-photogrid__cell')}>
            <button
              type="button"
              className={cn(`ui-photogrid__button ${selected ? 'is-selected' : ''}`)}
              aria-pressed={selectionMode ? selected : undefined}
              aria-label={`${selectionMode ? (selected ? 'Deselect ' : 'Select ') : 'Open '}${item.alt}`}
              onClick={() => (selectionMode ? onToggle?.(item.id) : onOpen?.(index))}
            >
              <AspectImage src={item.src} alt={item.alt} style={item.style}>
                {item.emoji}
              </AspectImage>
              {selectionMode && (
                <span className={cn('ui-photogrid__check')} aria-hidden="true">
                  {selected ? <Check /> : null}
                </span>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}

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
    <div className={cn('ui-viewer')} role="dialog" aria-modal="true" aria-label={semantics.label}>
      <div className={cn('ui-viewer__scrim')} onClick={onClose} />
      <header className={cn('ui-viewer__bar')}>
        <span className={cn('ui-viewer__count')}>
          {index + 1} / {items.length}
        </span>
        <button type="button" className={cn('ui-viewer__close')} aria-label={labels.close} onClick={onClose}>
          ✕
        </button>
      </header>
      <div
        className={cn('ui-viewer__stage')}
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
      <div className={cn('ui-viewer__controls')}>
        <button
          type="button"
          className={cn('ui-viewer__nav')}
          aria-label={labels.previous}
          disabled={index === 0}
          onClick={() => go({ type: 'previous' })}
        >
          ‹
        </button>
        <button
          type="button"
          className={cn('ui-viewer__nav')}
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

/* ── Carousel ─────────────────────────────────────────────────────────────── */

export function Carousel({
  items,
  index,
  onIndexChange,
  label = 'Carousel',
  labels = { previous: 'Previous slide', next: 'Next slide' },
}: {
  items: PhotoItem[];
  index: number;
  onIndexChange: (index: number) => void;
  label?: string;
  labels?: { previous?: string; next?: string };
}) {
  const state = { index, count: items.length };
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollTo = (nextIndex: number) => {
    const track = trackRef.current;
    if (track) track.scrollTo({ left: nextIndex * track.clientWidth, behavior: 'smooth' });
  };
  const go = (type: 'next' | 'previous') => {
    const nextIndex = mediaReducer(state, { type }).index;
    onIndexChange(nextIndex);
    scrollTo(nextIndex);
  };

  return (
    <section className={cn('ui-carousel')} aria-roledescription="carousel" aria-label={label}>
      <div
        ref={trackRef}
        className={cn('ui-carousel__track')}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') { event.preventDefault(); go('next'); }
          if (event.key === 'ArrowLeft') { event.preventDefault(); go('previous'); }
        }}
        onScroll={(event) => {
          const width = event.currentTarget.clientWidth;
          if (width > 0) onIndexChange(Math.round(event.currentTarget.scrollLeft / width));
        }}
      >
        {items.map((item) => (
          <div className={cn('ui-carousel__slide')} key={item.id}>
            <AspectImage src={item.src} alt={item.alt} style={item.style}>
              {item.emoji}
            </AspectImage>
          </div>
        ))}
      </div>
      <div className={cn('ui-carousel__footer')}>
        <button
          type="button"
          className={cn('ui-carousel__nav')}
          aria-label={labels.previous}
          disabled={index === 0}
          onClick={() => go('previous')}
        >
          ‹
        </button>
        <div className={cn('ui-carousel__dots')} aria-hidden="true">
          {items.map((item, i) => (
            <span
              key={item.id}
              className={cn(`ui-carousel__dot ${i === state.index ? 'is-active' : ''}`)}
            />
          ))}
        </div>
        <button
          type="button"
          className={cn('ui-carousel__nav')}
          aria-label={labels.next}
          disabled={index === items.length - 1}
          onClick={() => go('next')}
        >
          ›
        </button>
      </div>
    </section>
  );
}

/* ── SelectionMode helper ─────────────────────────────────────────────────── */

export function useSelectionMode(initial: readonly string[] = []) {
  const [state, dispatch] = useReducer(selectionModeReducer, {
    active: false,
    selectedIds: initial,
  });
  return {
    active: state.active,
    selectedIds: state.selectedIds,
    toggle: (id: string) => dispatch({ type: 'toggle', id }),
    enter: () => dispatch({ type: 'enter' }),
    exit: () => dispatch({ type: 'exit' }),
    clear: () => dispatch({ type: 'clear' }),
  };
}
