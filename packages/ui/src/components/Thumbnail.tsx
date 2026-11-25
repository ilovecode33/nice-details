import styles from './Thumbnail.module.css';
import { mediaReducer } from '@ilovecode33/ui-core';
import { useRef, type CSSProperties, type ReactNode } from 'react';
import type { PhotoItem } from '@ilovecode33/ui-types';


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
    <span className={styles['ui-thumbnail']}>
      {src ? <img src={src} alt={alt} loading="lazy" /> : <span aria-hidden="true">{emoji}</span>}
    </span>
  );
}
