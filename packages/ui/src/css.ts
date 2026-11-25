export { cn } from './styles';

/**
 * Create a class-name mapper bound to the CSS Module(s) a component owns.
 * Unknown names are left untouched, so global classes from styles.css and
 * consumer-provided class names keep working.
 */
export function createCn(...tables: Array<Record<string, string>>) {
  const table: Record<string, string> = Object.assign({}, ...tables);
  return (names: string): string =>
    names
      .split(/\s+/)
      .filter(Boolean)
      .map((name) => table[name] ?? name)
      .join(' ');
}
