#!/usr/bin/env node
// Zugriffe beim Spielen (Spar-Wächter): 30 Minuten Spielzeit mit einem Spielstand alle 20 s gegen den simulierten eigenen Server (saves_get/saves_put gezählt);
// Firestore wird dabei nicht mehr berührt (höchstens die einmalige Übernahme alter Stände).
// Erwartet: höchstens 2 Lesezugriffe und 20 Schreibzugriffe (früher je Speicherung ein Lesen + ein Schreiben ≈ 90), und die Cloud enthält am Ende den letzten Stand –
// auch wenn ein anderes Gerät dazwischen geschrieben hat (Vorbedingung schlägt fehl → 409 → voller Abgleich).
//   NODE_PATH=$(npm root -g) node tools/test-cloud-calls.cjs      (braucht playwright + Chromium)
'use strict';
const http = require('http'), fs = require('fs'), path = require('path'), zlib = require('zlib');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
let fails = 0;
const ok = (c, m) => { console.log((c ? 'OK     ' : 'FEHLER ') + m); if (!c) fails++; };
const srv = http.createServer((q, r) => {
  if (q.url.startsWith('/cloud.js')) { r.writeHead(200, { 'content-type': 'text/javascript' }); return r.end(fs.readFileSync(path.join(root, 'cloud/anmacha-cloud.js'))); }
  r.writeHead(200, { 'content-type': 'text/html' });
  r.end('<!doctype html><meta charset=utf-8><body><script src="/cloud.js" data-game="t" data-prefix="tkey" defer></script></body>');
});
async function session(conflict) {
  const b = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}), c = await b.newContext();
  const log = []; let doc = null, ver = 0;
  const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };
  await c.route(/^https?:\/\/(?!127)/, async r => {
    const req = r.request(), u = new URL(req.url());
    if (/firebase-app\.js/.test(u.href)) return r.fulfill({ contentType: 'text/javascript', headers: cors, body: 'export const initializeApp=()=>({});' });
    if (/firebase-auth\.js/.test(u.href)) return r.fulfill({ contentType: 'text/javascript', headers: cors, body: 'export const getAuth=()=>({});export const onAuthStateChanged=(a,cb)=>{setTimeout(()=>cb({uid:"u1",displayName:"T",refreshToken:"rt",getIdToken:async()=>"tok"}),5);return()=>{}};export class GoogleAuthProvider{};export const signInWithPopup=async()=>({});export const signOut=async()=>{};' });
    if (u.host === 'firestore.googleapis.com') {   // nur noch die einmalige Übernahme alter Stände (Lesen, nichts vorhanden)
      if (req.method() === 'OPTIONS') return r.fulfill({ status: 204, headers: cors });
      log.push('FIRESTORE'); return r.fulfill({ status: 404, headers: { ...cors, 'content-type': 'application/json' }, body: '{}' });
    }
    if (u.host === 'www.ricorewi-radio.de' && u.pathname === '/cms/api.php') {   // simulierter eigener Server (saves_get / saves_put)
      const J = { ...cors, 'content-type': 'application/json' }, act = u.searchParams.get('action');
      if (req.method() === 'OPTIONS') return r.fulfill({ status: 204, headers: cors });
      if (act === 'saves_get') { log.push('GET'); return doc ? r.fulfill({ status: 200, headers: J, body: JSON.stringify({ status: 'ok', d: doc.d, t: doc.t, ver: 'v' + ver }) }) : r.fulfill({ status: 404, headers: J, body: '{"status":"none"}' }); }
      if (act === 'saves_put') {
        const b = JSON.parse(req.postData()), pre = b.pre;
        if (pre !== undefined && (pre === '' ? !!doc : !doc || pre !== 'v' + ver)) { log.push('REJECT'); return r.fulfill({ status: 409, headers: J, body: JSON.stringify({ status: 'conflict', ver: 'v' + ver }) }); }
        log.push('PUT'); doc = { d: b.d, t: b.t }; ver++;
        return r.fulfill({ status: 200, headers: J, body: JSON.stringify({ status: 'ok', ver: 'v' + ver }) });
      }
    }
    return r.abort();
  });
  const p = await c.newPage(); await p.clock.install();
  await p.addInitScript(() => { localStorage.setItem('anmacha-cloud-on', '1'); });
  await p.goto(`http://127.0.0.1:${srv.address().port}/`); await p.clock.runFor(2000);
  for (let i = 0; i < 90; i++) { await p.evaluate(i => localStorage.setItem('tkey1', JSON.stringify({ score: i })), i); await p.clock.runFor(20000); }
  if (conflict) { doc = Object.assign({}, doc); ver++; await p.evaluate(() => localStorage.setItem('tkey1', 'zweites Geraet')); await p.clock.runFor(90000); }
  await p.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await p.clock.runFor(3000); await new Promise(r => setTimeout(r, 1500)); await p.clock.runFor(1000); await new Promise(r => setTimeout(r, 800));
  const local = await p.evaluate(() => localStorage.getItem('tkey1'));
  let cloud = null; try { const dv = doc.d; cloud = JSON.parse(dv.startsWith('z:') ? zlib.gunzipSync(Buffer.from(dv.slice(2), 'base64')).toString() : dv).tkey1.v; } catch (e) {}
  await b.close();
  return { reads: log.filter(x => x === 'GET').length, writes: log.filter(x => x === 'PUT').length, firestore: log.filter(x => x === 'FIRESTORE').length, rejects: log.filter(x => x === 'REJECT').length, same: cloud === local };
}
(async () => {
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const a = await session(false);
  ok(a.reads <= 2 && a.writes <= 20, `30 min Spielen: ${a.reads} Lesen, ${a.writes} Schreiben auf dem eigenen Server (Grenze 2 / 20)`);
  ok(a.firestore <= 1, `Firestore: ${a.firestore} Zugriff (nur die einmalige Übernahme alter Stände, Grenze 1)`);
  ok(a.same, 'Cloud enthält am Ende den letzten lokalen Stand');
  const b = await session(true);
  ok(b.rejects >= 1 && b.reads <= 3, `Konflikt (anderes Gerät schrieb): abgelehnt ${b.rejects}×, danach voller Abgleich (${b.reads} Lesen)`);
  ok(b.same, 'Nach dem Konflikt enthält die Cloud den letzten lokalen Stand');
  srv.close(); process.exit(fails ? 1 : 0);
})();
