'use strict';
const CACHE='mimori-v2';
const CORE=['./','./index.html','./model.js','./game.js','./icon.svg','./manifest.webmanifest','./push-config.json','../vendor/three-r128.min.js'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('mimori-v')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
 event.respondWith(fetch(event.request).then(r=>{
  if(r.ok&&new URL(event.request.url).pathname.includes('/mimori/')){const copy=r.clone();caches.open(CACHE).then(c=>c.put(event.request,copy)).catch(()=>{})}
  return r;
 }).catch(()=>caches.match(event.request)));
});
self.addEventListener('push',event=>{
 let msg={title:'Mimori braucht dich 🐣',body:'Schau nach deinem kleinen Wesen!'};
 try{if(event.data)msg={...msg,...event.data.json()}}catch(_){}
 const title=String(msg.title||'Mimori').slice(0,90),body=String(msg.body||'Zeit für ein bisschen Fürsorge.').slice(0,190);
 event.waitUntil(self.registration.showNotification(title,{body,icon:'./icon.svg',badge:'./icon.svg',tag:'mimori-care',
  renotify:false,data:{url:new URL('./',self.registration.scope).href}}));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 event.waitUntil((async()=>{
  const url=new URL('./',self.registration.scope).href,all=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  for(const client of all){if(client.url.startsWith(url)){await client.focus();return}}
  if(self.clients.openWindow)await self.clients.openWindow(url);
 })());
});
