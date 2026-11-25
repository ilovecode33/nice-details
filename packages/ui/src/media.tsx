/**
 * Image primitives, the shared PhotoItem type, and the carousel backed by the
 * `MediaState` contract from `@ilovecode33/ui-core`.
 */
import { mediaReducer } from '@ilovecode33/ui-core';
import { useRef, type CSSProperties, type ReactNode } from 'react';
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

/* ── PhotoItem ───────────────────────────────────────────────────────────── */

export interface PhotoItem {
  id: string;
  src?: string;
  alt: string;
  emoji?: ReactNode;
  style?: CSSProperties;
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
