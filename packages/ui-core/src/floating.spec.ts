import { describe, expect, test } from '@rstest/core';
import { floatingReducer } from './floating';

describe('floatingReducer', () => {
  const base = { collapsed: false, hidden: false };

  test('toggle flips only the collapsed flag', () => {
    expect(floatingReducer(base, { type: 'toggleCollapse' })).toEqual({
      collapsed: true,
      hidden: false,
    });
    expect(floatingReducer({ ...base, collapsed: true }, { type: 'toggleCollapse' })).toEqual(
      base,
    );
  });

  test('collapse and expand are idempotent', () => {
    expect(floatingReducer(base, { type: 'collapse' })).toEqual({ collapsed: true, hidden: false });
    expect(floatingReducer({ ...base, collapsed: true }, { type: 'collapse' })).toEqual({
      collapsed: true,
      hidden: false,
    });
    expect(floatingReducer(base, { type: 'expand' })).toEqual(base);
  });

  test('hide and show keep the collapsed state', () => {
    const hidden = floatingReducer({ ...base, collapsed: true }, { type: 'hide' });
    expect(hidden).toEqual({ collapsed: true, hidden: true });
    expect(floatingReducer(hidden, { type: 'show' })).toEqual({ collapsed: true, hidden: false });
  });
});
