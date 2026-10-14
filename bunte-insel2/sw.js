/* Bunte Insel 2 – Service Worker. Eigener Bereich (./) und eigene Cache-Namen (eg-bunte-insel2-…),
   damit er nie mit Bunte Insel 1 (eg-bunte-insel-…) kollidiert.
   Strategie: Seite & version.json netzwerk-zuerst (Updates werden erkannt), gehashte Dateien und Engine cache-zuerst.
   Eine neue Version wartet, bis der Spieler „Jetzt aktualisieren“ tippt (kontrollierte Übernahme). */
const VERSION = '202610141056';
const CACHE = 'eg-bunte-insel2-' + VERSION;
const CORE = ['./', './index.html', './manifest.webmanifest', './vendor/three.min.js?v=r128', './fonts/fredoka-latin-wght-normal.woff2', './icons/icon.svg'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE).catch(() => {})));
});
self.addEventListener('message', e => { if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('eg-bunte-insel2-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  const scope = new URL(self.registration.scope);
  if (!url.pathname.startsWith(scope.pathname)) return;
  const immutable = /\/assets\/.+-[A-Za-z0-9_-]{6,}\.(js|css)$/.test(url.pathname) || /\/vendor\/|\/fonts\/|\/audio\//.test(url.pathname);
  if (immutable) {
    e.respondWith(caches.open(CACHE).then(c => c.match(req).then(hit => hit || fetch(req).then(res => { if (res.ok) c.put(req, res.clone()); return res; }))));
    return;
  }
  e.respondWith(caches.open(CACHE).then(c => fetch(req).then(res => { if (res.ok && res.status === 200) c.put(req, res.clone()); return res; }).catch(() => c.match(req, { ignoreSearch: req.mode === 'navigate' }).then(hit => hit || c.match('./index.html')))));
});
