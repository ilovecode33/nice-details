import styles from './FormField.module.css';
import { fieldSemantics } from '@ilovecode33/ui-core';

import { cloneElement, isValidElement, useId, type ReactNode } from 'react';

/** Accessible label and error wrapper for form controls. */

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
        hint && <p className={styles['ui-formfield__hint']}>{hint}</p>
      )}
    </div>
  );
}
