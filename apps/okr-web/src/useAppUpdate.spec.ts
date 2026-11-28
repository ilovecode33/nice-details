import { describe, expect, rs, test } from '@rstest/core';
import { act, renderHook, waitFor } from '@testing-library/react';
import {
  isNewerVersion,
  parseDeployedBuild,
  useAppUpdate,
} from './useAppUpdate';

const BUILD = '2026-11-28T16:03:00.000Z';

function page(version: string, build?: string): string {
  return `<html><head><meta name="app-version" content="${version}">${
    build ? `<meta name="app-build" content="${build}">` : ''
  }</head></html>`;
}

async function withFetch<T>(
  html: string,
  run: () => Promise<T>,
): Promise<T> {
  const original = globalThis.fetch;
  globalThis.fetch = rs.fn(
    async () => new Response(html, { status: 200 }),
  ) as unknown as typeof fetch;
  try {
    return await run();
  } finally {
    globalThis.fetch = original;
  }
}

describe('isNewerVersion', () => {
  test('compares major, minor, and patch numerically', () => {
    expect(isNewerVersion('0.8.3', '0.8.2')).toBe(true);
    expect(isNewerVersion('0.10.0', '0.9.9')).toBe(true);
    expect(isNewerVersion('0.8.2', '0.8.2')).toBe(false);
    expect(isNewerVersion('0.8.1', '0.8.2')).toBe(false);
    expect(isNewerVersion('next', '0.8.2')).toBe(false);
  });
});

describe('parseDeployedBuild', () => {
  test('reads the version and build meta tags', () => {
    expect(parseDeployedBuild(page('0.8.3', BUILD))).toEqual({
      version: '0.8.3',
      build: BUILD,
    });
  });

  test('treats a missing build tag as unknown', () => {
    expect(parseDeployedBuild(page('0.8.3')).build).toBeNull();
  });

  test('rejects a page without a valid version', () => {
    expect(() => parseDeployedBuild('<html></html>')).toThrow();
  });
});

describe('useAppUpdate', () => {
  test('is not ready when the deployed version and build match this one', async () => {
    await withFetch(page('0.8.2', BUILD), async () => {
      const { result } = renderHook(() =>
        useAppUpdate('0.8.2', BUILD, { enabled: true }),
      );
      await waitFor(() => expect(result.current.latestVersion).toBe('0.8.2'));
      expect(result.current.updateReady).toBe(false);
    });
  });

  test('is ready when the same version was rebuilt', async () => {
    await withFetch(page('0.8.2', '2026-11-28T16:10:00.000Z'), async () => {
      const { result } = renderHook(() =>
        useAppUpdate('0.8.2', BUILD, { enabled: true }),
      );
      await waitFor(() => expect(result.current.updateReady).toBe(true));
      expect(result.current.latestVersion).toBe('0.8.2');
    });
  });

  test('is ready when the deployed version is newer', async () => {
    await withFetch(page('0.8.3', BUILD), async () => {
      const { result } = renderHook(() =>
        useAppUpdate('0.8.2', BUILD, { enabled: true }),
      );
      await waitFor(() => expect(result.current.updateReady).toBe(true));
      expect(result.current.latestVersion).toBe('0.8.3');
    });
  });

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
