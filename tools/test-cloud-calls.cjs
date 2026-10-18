#!/usr/bin/env node
// Zugriffe auf Firestore beim Spielen (Spar-Wächter): 30 Minuten Spielzeit mit einem Spielstand alle 20 s, simulierter Firestore (Lesen/Schreiben gezählt).
// Erwartet: höchstens 2 Lesezugriffe und 20 Schreibzugriffe (früher je Speicherung ein Lesen + ein Schreiben ≈ 90), und die Cloud enthält am Ende den letzten Stand –
// auch wenn ein anderes Gerät dazwischen geschrieben hat (Vorbedingung schlägt fehl → voller Abgleich).
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
    if (u.host === 'firestore.googleapis.com') {
      const J = { ...cors, 'content-type': 'application/json' };
      if (req.method() === 'OPTIONS') return r.fulfill({ status: 204, headers: cors });
      if (req.method() === 'GET') { log.push('GET'); return doc ? r.fulfill({ status: 200, headers: J, body: JSON.stringify({ fields: doc, updateTime: 'v' + ver }) }) : r.fulfill({ status: 404, headers: J, body: '{}' }); }
      if (req.method() === 'PATCH') {
        const pre = u.searchParams.get('currentDocument.updateTime'), ex = u.searchParams.get('currentDocument.exists');
        if ((pre && (!doc || pre !== 'v' + ver)) || (ex === 'false' && doc)) { log.push('REJECT'); return r.fulfill({ status: 400, headers: J, body: '{"error":{"status":"FAILED_PRECONDITION"}}' }); }
        log.push('PATCH'); doc = JSON.parse(req.postData()).fields; ver++;
        return r.fulfill({ status: 200, headers: J, body: JSON.stringify({ fields: doc, updateTime: 'v' + ver }) });
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
  let cloud = null; try { const dv = doc.d.stringValue; cloud = JSON.parse(dv.startsWith('z:') ? zlib.gunzipSync(Buffer.from(dv.slice(2), 'base64')).toString() : dv).tkey1.v; } catch (e) {}
  await b.close();
  return { reads: log.filter(x => x === 'GET').length, writes: log.filter(x => x === 'PATCH').length, rejects: log.filter(x => x === 'REJECT').length, same: cloud === local };
}
(async () => {
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const a = await session(false);
  ok(a.reads <= 2 && a.writes <= 20, `30 min Spielen: ${a.reads} Lesen, ${a.writes} Schreiben (Grenze 2 / 20)`);
  ok(a.same, 'Cloud enthält am Ende den letzten lokalen Stand');
  const b = await session(true);
  ok(b.rejects >= 1 && b.reads <= 3, `Konflikt (anderes Gerät schrieb): abgelehnt ${b.rejects}×, danach voller Abgleich (${b.reads} Lesen)`);
  ok(b.same, 'Nach dem Konflikt enthält die Cloud den letzten lokalen Stand');
  srv.close(); process.exit(fails ? 1 : 0);
})();
