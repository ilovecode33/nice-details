import classes from './SearchBar.module.css';
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

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  label = 'Search',
  clearLabel = 'Clear search',
  onClear,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  clearLabel?: string;
  onClear?: () => void;
}) {
  return (
    <div className={cn('ui-searchbar')}>
      <span className={cn('ui-searchbar__icon')} aria-hidden="true">
        ⌕
      </span>
      <input
        type="search"
        className={cn('ui-searchbar__input')}
        value={value}
        placeholder={placeholder}
        aria-label={label}
        onChange={(event) => onChange(event.target.value)}
      />
      {value && (
        <button
          type="button"
          className={cn('ui-searchbar__clear')}
          aria-label={clearLabel}
          onClick={() => {
            onChange('');
            onClear?.();
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
