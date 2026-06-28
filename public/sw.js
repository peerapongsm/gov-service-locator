const CACHE = 'gov-locator-v1';
const SHELL = '/gov-service-locator/';
self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // cross-origin (Umami) passes through
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => { if (res.ok) { const c = res.clone(); caches.open(CACHE).then((ca) => ca.put(req, c)); } return res; })
        .catch(() => caches.match(req).then((m) => m || caches.match(SHELL)))
    );
    return;
  }
  if (url.pathname.endsWith('/data/offices.json')) {
    event.respondWith(
      caches.open(CACHE).then(async (ca) => {
        const cached = await ca.match(req);
        const net = fetch(req).then((res) => { if (res.ok) { ca.put(req, res.clone()); } return res; }).catch(() => cached);
        return cached || net;
      })
    );
    return;
  }
  event.respondWith(
    caches.match(req).then((m) => m || fetch(req).then((res) => {
      if (res.ok && url.pathname.includes('/_next/')) { const c = res.clone(); caches.open(CACHE).then((ca) => ca.put(req, c)); }
      return res;
    }))
  );
});
