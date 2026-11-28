import { describe, expect, test } from '@rstest/core';
import {
  DICTIONARIES,
  INTL_LOCALES,
  LOCALES,
  LOCALE_NAMES,
  interpolate,
} from './i18n';

describe('i18n', () => {
  test('every locale defines the same keys', () => {
    const [first, ...rest] = LOCALES;
    const expected = Object.keys(DICTIONARIES[first]).sort();
    for (const locale of rest) {
      expect(Object.keys(DICTIONARIES[locale]).sort()).toEqual(expected);
    }
  });

  test('every locale has a display name and Intl locale', () => {
    for (const locale of LOCALES) {
      expect(LOCALE_NAMES[locale]).toBeTruthy();
      expect(INTL_LOCALES[locale]).toBeTruthy();
    }
  });

  test('interpolates known params and leaves unknown placeholders', () => {
    expect(interpolate('{days} days left', { days: 3 })).toBe('3 days left');
    expect(interpolate('Hello {name}', { name: 'Ada' })).toBe('Hello Ada');
    expect(interpolate('{missing}')).toBe('{missing}');
  });
});
