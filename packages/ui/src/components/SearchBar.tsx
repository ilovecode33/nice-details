import styles from './SearchBar.module.css';

/**
 * Controlled search input with a leading icon and a clear button that appears
 * only when `value` is non-empty. Clearing calls `onChange('')` then `onClear`.
 * `placeholder`, `label` and `clearLabel` are props with English defaults.
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
    <div className={styles['ui-searchbar']}>
      <span className={styles['ui-searchbar__icon']} aria-hidden="true">
        ⌕
      </span>
      <input
        type="search"
        className={styles['ui-searchbar__input']}
        value={value}
        placeholder={placeholder}
        aria-label={label}
        onChange={(event) => onChange(event.target.value)}
      />
      {value && (
        <button
          type="button"
          className={styles['ui-searchbar__clear']}
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
