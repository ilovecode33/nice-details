import { describe, expect, test } from '@rstest/core';
import { act, renderHook } from '@testing-library/react';
import { useSelectionMode } from './useSelectionMode';

describe('useSelectionMode', () => {
  test('enters, toggles and exits selection', () => {
    const { result } = renderHook(() => useSelectionMode());
    expect(result.current.active).toBe(false);
    act(() => result.current.enter());
    expect(result.current.active).toBe(true);
    act(() => result.current.toggle('a'));
    expect(result.current.selectedIds).toContain('a');
    act(() => result.current.exit());
    expect(result.current.active).toBe(false);
    expect(result.current.selectedIds).toEqual([]);
  });
});
