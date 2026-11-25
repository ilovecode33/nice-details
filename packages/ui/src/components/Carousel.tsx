import type { PhotoItem } from '@ilovecode33/ui-types';
import styles from './Carousel.module.css';
import { mediaReducer } from '@ilovecode33/ui-core';
import { useRef } from 'react';
import { AspectImage } from './AspectImage';

/** Snap-aligned horizontal carousel backed by the MediaState contract. */

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
    <section className={'ui-carousel'} aria-roledescription="carousel" aria-label={label}>
      <div
        ref={trackRef}
        className={styles['ui-carousel__track']}
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
          <div className={styles['ui-carousel__slide']} key={item.id}>
            <AspectImage src={item.src} alt={item.alt} style={item.style}>
              {item.emoji}
            </AspectImage>
          </div>
        ))}
      </div>
      <div className={styles['ui-carousel__footer']}>
        <button
          type="button"
          className={styles['ui-carousel__nav']}
          aria-label={labels.previous}
          disabled={index === 0}
          onClick={() => go('previous')}
        >
          ‹
        </button>
        <div className={styles['ui-carousel__dots']} aria-hidden="true">
          {items.map((item, i) => (
            <span
              key={item.id}
              className={[styles['ui-carousel__dot'], styles[i === state.index ? 'is-active' : ''] || ''].filter(Boolean).join(' ')}
            />
          ))}
        </div>
        <button
          type="button"
          className={styles['ui-carousel__nav']}
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
