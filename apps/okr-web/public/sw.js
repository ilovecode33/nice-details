/* Cache-first static assets and stale-while-revalidate HTML shell so cold
   opens from an installed Home Screen bookmark render immediately from cache
   and refresh in the background. */
const CACHE = 'okr-web-v2';
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('okr-web-') && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Version checks must fail offline instead of reporting a cached app shell
  // as the latest deployed version.
  if (url.searchParams.has('__version_check')) {
    event.respondWith(fetch(request));
    return;
  }

  const cacheHtml = (response, targetUrl) => {
    if (!response.ok) return undefined;
    return caches
      .open(CACHE)
      .then((cache) => {
        const ops = [cache.put(request, response.clone())];
        if (targetUrl.pathname === '/') {
          ops.push(cache.put('/', response.clone()));
          ops.push(cache.put('/index.html', response.clone()));
        }
        return Promise.all(ops);
      })
      .catch(() => undefined);
  };

  // Explicit refresh triggered right before reloading for an app update.
  if (url.searchParams.has('__refresh')) {
    event.respondWith(
      fetch('/', { cache: 'no-store' }).then((response) => {
        if (response.ok) {
          event.waitUntil(
            caches
              .open(CACHE)
              .then((cache) =>
                Promise.all([
                  cache.put('/', response.clone()),
                  cache.put('/index.html', response.clone()),
                ]),
              )
              .catch(() => undefined),
          );
        }
        return response;
      }),
    );
    return;
  }

  // HTML navigation: serve cached shell immediately and revalidate in background.
  if (request.mode === 'navigate') {
    const revalidate = () =>
      fetch(request, { cache: 'no-cache' })
        .then((response) => cacheHtml(response, url))
        .catch(() => undefined);

    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          event.waitUntil(revalidate());
          return cached;
        }
        return caches
          .match('/')
          .then((shell) => shell ?? caches.match('/index.html'))
          .then((shell) => {
            if (shell) {
              event.waitUntil(revalidate());
              return shell;
            }
            return fetch(request)
              .then((response) => {
                event.waitUntil(cacheHtml(response, url));
                return response;
              })
              .catch(() => caches.match('/'));
          });
      }),
    );
    return;
  }

  // Hashed static assets, manifest, and icons: cache-first with network fill.
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            event.waitUntil(
              caches
                .open(CACHE)
                .then((cache) => cache.put(request, copy))
                .catch(() => undefined),
            );
          }
          return response;
        }),
    ),
  );
});
