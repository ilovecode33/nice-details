import styles from './Avatar.module.css';

/**
 * Renders a circular avatar with an image or an initials fallback.
 * Initials take the first letter of up to two space-separated parts of `name`,
 * uppercased. The wrapper is labelled `role="img"` and images use an empty `alt`
 * because `name` already provides the accessible label. `size` defaults to "default".
 */

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
    <span className={[styles['ui-avatar'], styles[`ui-avatar--${size}`]].filter(Boolean).join(' ')} role="img" aria-label={name}>
      {src ? <img src={src} alt="" /> : initials}
    </span>
  );
}
