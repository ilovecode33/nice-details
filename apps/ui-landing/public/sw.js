/* Cache the app shell so the second open of the landing page is instant. */
const CACHE = 'ui-landing-v1';
const SHELL = ['/', '/index.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('ui-landing-') && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  // Only handle same-origin GETs; leave cross-origin and writes to the browser.
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  // HTML is stale-while-revalidate: markup is served from the local cache first so
  // opens are instant and work offline, then refreshed in the background. A deploy
  // may show the previous HTML once; the next open gets the new one.
  if (request.mode === 'navigate') {
    const cacheNetworkResponse = (response) => {
      if (!response.ok) return undefined;
      const isRoot = new URL(request.url).pathname === '/';
      return caches.open(CACHE).then((cache) =>
        cache.put(request, response.clone()).then(() => {
          // Keep the shell fallback fresh for the next offline navigation.
          if (isRoot) return cache.put('/', response.clone());
          return undefined;
        }),
      );
    };

    const revalidate = () => fetch(request).then(cacheNetworkResponse).catch(() => undefined);

    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          event.waitUntil(revalidate());
          return cached;
        }
        return caches.match('/').then((shell) => {
          if (shell) {
            event.waitUntil(revalidate());
            return shell;
          }
          return fetch(request)
            .then((response) => {
              event.waitUntil(cacheNetworkResponse(response));
              return response;
            })
            .catch(() => caches.match('/'));
        });
      }),
    );
    return;
  }

  // Hashed static assets are immutable: cache-first with a network fill.
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
