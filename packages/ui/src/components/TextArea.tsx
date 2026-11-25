import classes from './TextArea.module.css';
import {
  checkboxSemantics,
  fieldSemantics,
  radioSemantics,
} from '@ilovecode33/ui-core';
import { Deformable } from './Deformable';
import {
  cloneElement,
  isValidElement,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import { createCn } from '../css';

const cn = createCn(classes);

/**
 * Data-entry components. Validation state follows the `FormFieldState`
 * contract in `@ilovecode33/ui-core`, so a native renderer can use the same
 * touched / error model.
 */


export function TextArea({
  className = '',
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(`ui-textarea ${className}`)} {...rest} />;
}
