import classes from './Thumbnail.module.css';
import { mediaReducer } from '@ilovecode33/ui-core';
import { useRef, type CSSProperties, type ReactNode } from 'react';
import { createCn } from '../css';
import type { PhotoItem } from './Carousel';

const cn = createCn(classes);

/**
 * Image primitives, the shared PhotoItem type, and the carousel backed by the
 * `MediaState` contract from `@ilovecode33/ui-core`.
 */

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
