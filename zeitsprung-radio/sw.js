const CACHE = 'zeitsprung-radio-v5';
const APP = ['./', './index.html', './style.css', './game.js', './year.js', './tracks.js', './knowledge.js', './music.js', './pair.js', './icon.svg', './card.svg', './card.png', './manifest.webmanifest', '../vendor/three-r128.min.js', '../vendor/peerjs-1.5.4.min.js', '../vendor/qrcode-generator-1.4.4.js', '../pwa-icons/zeitsprung-radio-192.png', '../pwa-icons/zeitsprung-radio-512.png'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('zeitsprung-radio-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
