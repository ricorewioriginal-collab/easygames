/* Wobbel – Service Worker: macht das Spiel offline spielbar. Netz zuerst (immer aktueller Stand), bei Fehlen aus dem Cache;
   die große Bibliothek (vendor/) kommt zuerst aus dem Cache. CACHE bei Änderungen hochzählen. */
const CACHE = 'wobbel-v2', CORE = ['./', 'index.html', 'css/style.css', 'vendor/three.min.js', 'logo.png', 'icons/icon-192.png', 'manifest.webmanifest'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return; const url = new URL(req.url); if (url.origin !== location.origin) return;
  if (url.pathname.includes('/vendor/')) { e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return res; }))); return; }
  e.respondWith(fetch(req).then(res => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return res; }).catch(() => caches.match(req).then(r => r || (req.mode === 'navigate' ? caches.match('index.html') : Response.error()))));
});
