import { describe, expect, test } from '@rstest/core';
import { toggleReducer } from './toggle';

describe('toggleReducer', () => {
  test('flips checked', () => {
    expect(toggleReducer({ checked: false }, { type: 'toggle' })).toEqual({ checked: true });
    expect(toggleReducer({ checked: true }, { type: 'toggle' })).toEqual({ checked: false });
  });
});
