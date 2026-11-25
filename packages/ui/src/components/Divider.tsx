import styles from './Divider.module.css';
import { navigationSemantics, tabSemantics } from '@ilovecode33/ui-core';
import { type HTMLAttributes, type ReactNode } from 'react';


/**
 * Navigation components. State and semantics come from
 * `@ilovecode33/ui-core`; this file only maps them to markup and tokens.
 */

export function Divider({ className = '', ...rest }: HTMLAttributes<HTMLHRElement>) {
  return <hr className={[styles['ui-divider'], className].filter(Boolean).join(' ')} {...rest} />;
}