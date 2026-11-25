import styles from './Divider.module.css';

import { type HTMLAttributes } from 'react';

/**
 * Renders a thin horizontal rule separating content sections.
 * Extra `HTMLAttributes` are forwarded to the `<hr>`; `className` is appended after
 * the component's own class. It carries no text or built-in labels.
 */

export function Divider({ className = '', ...rest }: HTMLAttributes<HTMLHRElement>) {
  return <hr className={[styles['ui-divider'], className].filter(Boolean).join(' ')} {...rest} />;
}
