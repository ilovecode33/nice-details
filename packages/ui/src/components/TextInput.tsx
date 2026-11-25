import classes from './TextInput.module.css';
import { toggleReducer, toggleSemantics } from '@ilovecode33/ui-core';
import { type InputHTMLAttributes, type ReactNode } from 'react';
import { Deformable } from './Deformable';
import { createCn } from '../css';

const cn = createCn(classes);

/** Lightweight form controls: SliderRow, Switch, Field, TextInput. */

export function TextInput({
  className = '',
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(`ui-input ${className}`)} {...rest} />;
}
