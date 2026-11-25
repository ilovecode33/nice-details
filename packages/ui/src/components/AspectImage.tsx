import styles from './AspectImage.module.css';

import { type CSSProperties, type ReactNode } from 'react';

/**
 * Renders a lazily loaded image inside a box with a fixed aspect ratio.
 * Without `src` it shows `children` as a labelled `role="img"` placeholder (for example
 * an emoji); native images fall back to an empty `alt`. `ratio` defaults to "4 / 3"
 * and `style` is merged after it, so callers can override the layout.
 */

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
