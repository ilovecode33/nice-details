import styles from './AspectImage.module.css';

import { type CSSProperties, type ReactNode } from 'react';

/** Responsive image with a fixed aspect ratio and an emoji fallback. */

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
    <div className={styles['ui-aspect']} style={{ aspectRatio: ratio, ...style }}>
      {src ? (
        <img className={styles['ui-aspect__img']} src={src} alt={alt ?? ''} loading="lazy" />
      ) : (
        <div className={styles['ui-aspect__placeholder']} role="img" aria-label={alt}>
          {children}
        </div>
      )}
    </div>
  );
}
