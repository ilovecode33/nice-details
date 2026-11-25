import { describe, expect, test } from '@rstest/core';
import { renderHook } from '@testing-library/react';
import { useEscape } from './useEscape';

describe('useEscape', () => {
  test('calls onClose only while active', () => {
    let closed = 0;
    const { rerender, unmount } = renderHook(({ active }) =>
      useEscape(active, () => (closed += 1)), { initialProps: { active: false } });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(closed).toBe(0);
    rerender({ active: true });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(closed).toBe(1);
    unmount();
  });
});
