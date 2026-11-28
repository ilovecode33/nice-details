import styles from './FormField.module.css';
import { fieldSemantics } from '@ilovecode33/ui-core';

import { cloneElement, isValidElement, useId, type ReactNode } from 'react';

/** ARIA props injected into the wrapped control by `FormField`. */

export type FieldControlProps = {
  id: string;
  'aria-describedby': string | undefined;
  'aria-invalid': boolean | undefined;
};

/**
 * Wraps a control with a label, hint and error message, injecting `id`,
 * `aria-describedby` and `aria-invalid` into a cloned element or a render
 * callback. An error replaces the hint and is announced via `role="alert"`.
 * All text is passed in through props; no labels are built in.
 */
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
  const hintId = `${controlId}-hint`;
  const errorId = `${controlId}-error`;
  const semantics = fieldSemantics(
    { value: '', touched: Boolean(error), error },
    label,
    errorId,
  );
  const describedBy = semantics.describedBy ?? (hint ? hintId : undefined);
  const controlProps: FieldControlProps = {
    id: controlId,
    'aria-describedby': describedBy,
    'aria-invalid': semantics.invalid || undefined,
  };

  let control: ReactNode;
  if (typeof children === 'function') {
    control = children(controlProps);
  } else if (isValidElement(children)) {
    control = cloneElement(children as React.ReactElement<FieldControlProps>, {
      id: controlId,
      'aria-describedby': describedBy,
      'aria-invalid': semantics.invalid || undefined,
    });
  } else {
    control = children;
  }

  return (
    <div className={styles['ui-formfield']}>
      <label className={styles['ui-formfield__label']} htmlFor={controlId}>
        {label}
      </label>
      {control}
      {error ? (
        <p id={errorId} className={styles['ui-formfield__error']} role="alert">
          <span aria-hidden="true">✕</span> {error}
        </p>
      ) : (
        hint && <p id={hintId} className={styles['ui-formfield__hint']}>{hint}</p>
      )}
    </div>
  );
}
