import classes from './styles.module.css';

const table = classes as Record<string, string>;

/**
 * Map space-separated class names through the CSS Module. Unknown names are
 * kept as-is, so app-level global classes can still be passed by consumers.
 */
export function cn(names: string): string {
  return names
    .split(/\s+/)
    .filter(Boolean)
    .map((name) => table[name] ?? name)
    .join(' ');
}
