'use strict';
const CACHE='mimori-v7';
const CORE=['./','./index.html','./model.js','./sound.js','./game.js','./arcade.js','./arcade.css','./cover.png','./cover.svg','./icon.svg','./manifest.webmanifest','../vendor/three-r128.min.js','../cloud/anmacha-cloud.js'];
self.addEventListener('install',event=>event.waitUntil(
 caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())
));
self.addEventListener('activate',event=>event.waitUntil(
 caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('mimori-v')&&k!==CACHE).map(k=>caches.delete(k))))
 .then(()=>self.clients.claim())
));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
 event.respondWith(fetch(event.request).then(response=>{
  const url=new URL(event.request.url);
  if(response.ok&&(url.pathname.includes('/mimori/')||url.pathname.endsWith('/cloud/anmacha-cloud.js'))){
   const clone=response.clone();caches.open(CACHE).then(c=>c.put(event.request,clone)).catch(()=>{});
  }
  return response;
 }).catch(()=>caches.match(event.request)));
});
// Only notifications scheduled by a currently running browser/PWA page are used.
// No background push listener or server is required.
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 event.waitUntil((async()=>{
  const url=new URL('./',self.registration.scope).href;
  const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  for(const client of clients){if(client.url.startsWith(url)){await client.focus();return}}
  if(self.clients.openWindow)await self.clients.openWindow(url);
 })());
});
