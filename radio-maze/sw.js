/* Radio Maze 3D: eigenes Scope, Offline-Cache und kontrollierte Updates. */
'use strict';
const CACHE='easygames-radio-maze-v2';
const CORE=['./','./index.html','./style.css','./logic.js','./game.js','./icon.svg','./card.svg','./manifest.webmanifest','../vendor/three-r128.min.js'];
const LOGOS=Array.from({length:13},(_,i)=>'../anmacha-memory/logos/'+String(i+1).padStart(2,'0')+'.png');
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  // Einzelne defekte Netzantwort darf die komplette Installation nicht blockieren.
  await Promise.all([...CORE,...LOGOS].map(async path=>{
   try{const response=await fetch(new Request(path,{cache:'reload'}));if(response.ok)await cache.put(path,response);}catch(_){}
  }));
  await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('easygames-radio-maze-')&&k!==CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
 })());
});
self.addEventListener('fetch',event=>{
 const request=event.request;if(request.method!=='GET')return;
 const u=new URL(request.url), root=new URL('./',self.registration.scope);
 // Nicht in Google-/Firebase-Daten oder fremde Domains eingreifen.
 if(u.origin!==root.origin)return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  const cached=await cache.match(request,{ignoreSearch:true});
  try{
   const response=await fetch(request);
   if(response.ok&&response.type!=='opaque')cache.put(request,response.clone()).catch(()=>{});
   return response;
  }catch(_){
   if(cached)return cached;
   if(request.mode==='navigate'){const offline=await cache.match('./index.html');if(offline)return offline;}
   return Response.error();
  }
 })());
});