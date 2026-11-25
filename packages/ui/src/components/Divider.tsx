import styles from './Divider.module.css';

import { type HTMLAttributes } from 'react';

/** Thin separator between content sections. */

export function Divider({ className = '', ...rest }: HTMLAttributes<HTMLHRElement>) {
  return <hr className={[styles['ui-divider'], className].filter(Boolean).join(' ')} {...rest} />;
}
