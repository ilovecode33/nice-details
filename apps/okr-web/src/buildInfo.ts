/** Formats the injected build timestamp for the About card. */
export function formatBuildTime(
  value: string | undefined,
  locale: string,
): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
