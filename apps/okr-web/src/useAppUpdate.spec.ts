import { describe, expect, rs, test } from '@rstest/core';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useAppUpdate } from './useAppUpdate';

describe('useAppUpdate', () => {
  test('refreshes the cached HTML via __refresh before reloading on update()', async () => {
    const fetchMock = rs.fn(async (input: RequestInfo | URL) => {
      void input;
      return new Response('<html></html>', { status: 200 });
    });
    const reloadMock = rs.fn();
    const originalFetch = globalThis.fetch;
    const originalLocation = window.location;

    globalThis.fetch = fetchMock as unknown as typeof fetch;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, href: 'https://okr.test/', reload: reloadMock },
    });

    try {
      const { result } = renderHook(() => useAppUpdate('0.8.1'));

      act(() => {
        result.current.update();
      });

      await waitFor(() => {
        expect(reloadMock).toHaveBeenCalledTimes(1);
      });

      const requestedUrls = fetchMock.mock.calls.map(([input]) => String(input));
      expect(requestedUrls.some((url) => url.includes('__refresh='))).toBe(true);
    } finally {
      globalThis.fetch = originalFetch;
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: originalLocation,
      });
    }
  });
});
