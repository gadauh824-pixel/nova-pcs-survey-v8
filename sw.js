/* Nova PCS Survey v8 — Service Worker
   Cache-first for same-origin assets.
   Firebase Auth requests are always passed to network (auth needs internet). */
const CACHE = 'nova-pcs-v8';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(['/', '/index.html']).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // Always let Firebase / Google auth go to network
  if (url.hostname.includes('googleapis.com') ||
      url.hostname.includes('gstatic.com') ||
      url.hostname.includes('firebaseapp.com') ||
      url.hostname.includes('google.com')) return;
  // Same-origin: cache-first
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.open(CACHE).then(async c => {
        const cached = await c.match(e.request);
        if (cached) return cached;
        try {
          const resp = await fetch(e.request);
          if (resp.ok) c.put(e.request, resp.clone());
          return resp;
        } catch {
          return new Response('App offline. Open once while online to cache it.', {
            status: 503, headers: { 'Content-Type': 'text/plain' }
          });
        }
      })
    );
  }
});
