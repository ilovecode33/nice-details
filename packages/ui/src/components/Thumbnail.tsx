import styles from './Thumbnail.module.css';

import { type ReactNode } from 'react';

/** Small square image or emoji thumbnail. */

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
