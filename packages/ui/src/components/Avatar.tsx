import styles from './Avatar.module.css';

/** Circular user avatar with an initials fallback. */

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
