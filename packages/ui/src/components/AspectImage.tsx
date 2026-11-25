import classes from './AspectImage.module.css';
import { mediaReducer } from '@ilovecode33/ui-core';
import { useRef, type CSSProperties, type ReactNode } from 'react';
import { createCn } from '../css';
import type { PhotoItem } from './Carousel';

const cn = createCn(classes);

/**
 * Image primitives, the shared PhotoItem type, and the carousel backed by the
 * `MediaState` contract from `@ilovecode33/ui-core`.
 */

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
