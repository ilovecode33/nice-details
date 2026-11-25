import classes from './Avatar.module.css';
import { mediaReducer } from '@ilovecode33/ui-core';
import { useRef, type CSSProperties, type ReactNode } from 'react';
import { createCn } from '../css';
import type { PhotoItem } from './Carousel';

const cn = createCn(classes);

/**
 * Image primitives, the shared PhotoItem type, and the carousel backed by the
 * `MediaState` contract from `@ilovecode33/ui-core`.
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
    <span className={cn(`ui-avatar ui-avatar--${size}`)} role="img" aria-label={name}>
      {src ? <img src={src} alt="" /> : initials}
    </span>
  );
}
