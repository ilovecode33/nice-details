import classes from './FormField.module.css';
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

/* ── FormField ─────────────────────────────────────────────────────────────── */

type FieldControlProps = {
  id: string;
  'aria-describedby': string | undefined;
  'aria-invalid': boolean | undefined;
};

export function FormField({
  label,
  hint,
  error,
  id,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  id?: string;
  children: ReactNode | ((props: FieldControlProps) => ReactNode);
}) {
  const generated = useId();
  const controlId = id ?? generated;
  const errorId = `${controlId}-error`;
  const semantics = fieldSemantics(
    { value: '', touched: Boolean(error), error },
    label,
    errorId,
  );
  const controlProps: FieldControlProps = {
    id: controlId,
    'aria-describedby': semantics.describedBy,
    'aria-invalid': semantics.invalid || undefined,
  };

  let control: ReactNode;
  if (typeof children === 'function') {
    control = children(controlProps);
  } else if (isValidElement(children)) {
    control = cloneElement(children as React.ReactElement<FieldControlProps>, {
      id: controlId,
      'aria-describedby': semantics.describedBy,
      'aria-invalid': semantics.invalid || undefined,
    });
  } else {
    control = children;
  }

  return (
    <div className={cn('ui-formfield')}>
      <label className={cn('ui-formfield__label')} htmlFor={controlId}>
        {label}
      </label>
      {control}
      {error ? (
        <p id={errorId} className={cn('ui-formfield__error')} role="alert">
          <span aria-hidden="true">✕</span> {error}
        </p>
      ) : (
        hint && <p className={cn('ui-formfield__hint')}>{hint}</p>
      )}
    </div>
  );
}
