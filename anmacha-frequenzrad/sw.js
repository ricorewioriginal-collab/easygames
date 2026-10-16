/* AnMaCha Frequenzrad – Service Worker (erzeugt von tools/make-pwa.py, nicht von Hand ändern).
   Netz zuerst: jeder Start holt den aktuellen Stand (der Browser prüft per ETag, große Dateien kommen bei „unverändert“ nicht neu).
   Fällt das Netz aus oder antwortet es länger als 4 s, kommt die zuletzt geladene Fassung aus dem Cache – so läuft das Spiel auch offline,
   sobald es einmal gespielt wurde (auch Bibliotheken von CDNs). Neue Fassung = sofort aktiv (skipWaiting/claim), alte Zwischenspeicher werden gelöscht. */
const CACHE = 'eg-anmacha-frequenzrad-v2';
self.addEventListener('install', () => {});
self.addEventListener('message', e => { if (e.data && e.data.type === 'EG_SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('eg-anmacha-frequenzrad-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || req.headers.has('range')) return;
  if (url.origin !== location.origin) {   // Bibliotheken/Schriften von bekannten CDNs (versionierte Adressen): einmal laden, danach aus dem Cache
    if (!/(^|\.)(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|unpkg\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(url.hostname)) return;
    e.respondWith(caches.open(CACHE).then(cache => cache.match(req).then(hit => hit || fetch(req).then(res => { if (res.ok || res.type === 'opaque') cache.put(req, res.clone()); return res; }))));
    return;
  }
  e.respondWith(caches.open(CACHE).then(cache => cache.match(req, { ignoreSearch: req.mode === 'navigate' }).then(hit => {
    const net = fetch(req).then(res => { if (res.ok && res.status === 200) cache.put(req, res.clone()); return res; });
    if (!hit) return net;
    return Promise.race([net, new Promise((_, no) => setTimeout(no, 4000))]).catch(() => hit);
  })));
});
