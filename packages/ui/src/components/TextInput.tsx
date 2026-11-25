import styles from './TextInput.module.css';
import { toggleReducer, toggleSemantics } from '@ilovecode33/ui-core';
import { type InputHTMLAttributes, type ReactNode } from 'react';
import { Deformable } from './Deformable';


/** Lightweight form controls: SliderRow, Switch, Field, TextInput. */

export function TextInput({
  className = '',
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={[styles['ui-input'], className].filter(Boolean).join(' ')} {...rest} />;
}
