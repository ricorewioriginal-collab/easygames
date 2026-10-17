/* RicoRail Simulator 3D – Service Worker (erzeugt von source/scripts/build.mjs, nicht von Hand ändern).
   Nach dem ersten Laden offline spielbar. Seite: Netz zuerst, offline aus dem Cache. Bundle (Name mit Prüfsumme): Cache zuerst.
   Eine neue Fassung wartet, bis die Seite EG_SKIP_WAITING schickt (Knopf „Jetzt aktualisieren“). Nur eigene Dateien unter ricorail/. */
const CACHE = '%CACHE%';
const SHELL = ['./', './index.html', './manifest.webmanifest', './favicon.svg', './icons/icon-192.png', './icons/icon-512.png', '%BUNDLE%'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL))); });
self.addEventListener('message', (e) => { if (e.data && e.data.type === 'EG_SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('eg-ricorail-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith(new URL('./', self.registration.scope).pathname)) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((res) => { if (res.ok) { const c = res.clone(); caches.open(CACHE).then((x) => x.put('./index.html', c)); } return res; }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
    if (res.ok && (url.pathname.includes('/assets/') || url.pathname.includes('/icons/'))) { const c = res.clone(); caches.open(CACHE).then((x) => x.put(req, c)); }
    return res;
  })));
});
