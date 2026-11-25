import styles from './SearchBar.module.css';

/** Search input with a leading icon. */

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
