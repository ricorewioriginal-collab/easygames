/* RicoVille Service Worker: offline spielbar nach dem ersten Laden.
   Navigation: Netzwerk zuerst (Updates kommen an), offline aus dem Cache. Gehashte Assets: Cache zuerst.
   Eine neue Fassung wartet, bis die Seite EG_SKIP_WAITING schickt (Knopf „Jetzt aktualisieren"). */
const CACHE = 'eg-ricoville-v2';
const SHELL = ['./', './index.html', './manifest.webmanifest', './favicon.svg', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
});
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'EG_SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((ks) => Promise.all(ks.filter((k) => k.startsWith('eg-ricoville-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  // Nur eigene Dateien; Cloud-Skript und andere Spiele bleiben unberührt.
  if (!url.pathname.startsWith(new URL('./', self.registration.scope).pathname)) return;
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put('./index.html', copy));
          }
          return res;
        })
        .catch(() => caches.match('./index.html')),
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok && url.pathname.includes('/assets/')) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        }),
    ),
  );
});
