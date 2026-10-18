#!/usr/bin/env node
// Mehrspieler-Regel (CLAUDE.md): Einladungslinks zeigen immer auf die easygames-Homepage, nie auf die lokale App-Adresse.
// Prüft EasyGamesLink.share() aus cloud/fire-peer.js sowie device.js/gamekit.js.   node tools/test-share-link.js
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path'), assert = require('assert/strict');
const root = path.resolve(__dirname, '..'), HOME = 'https://ricorewioriginal-collab.github.io/easygames/';
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
function page(href, files, extra) {
  const base = href.replace(/\/easygames\/.*$/, '/easygames/');
  const w = Object.assign({ URL, URLSearchParams, location: new URL(href), navigator: {}, console, addEventListener() {}, removeEventListener() {} }, extra || {});
  w.window = w; vm.createContext(w);
  for (const f of files) {
    w.document = { currentScript: { src: base + f } };
    vm.runInContext(read(f).replace(/typeof window !== 'undefined' \? window : this/, 'window'), w);
  }
  return w;
}
let n = 0; const ok = m => console.log('ok', ++n, m);
const L = ['https://appassets.androidplatform.net/easygames/', 'file:///sdcard/x/easygames/', 'http://localhost:8080/easygames/', 'http://192.168.1.5/easygames/', HOME];
for (const b of L) {
  const w = page(b + 'anmacha-quiz/index.html', ['cloud/fire-peer.js']);
  assert.equal(w.EasyGamesLink.share(b + 'anmacha-quiz/index.html?join=AB12&ph=x'), HOME + 'anmacha-quiz/index.html?join=AB12&ph=x');
  assert.equal(w.EasyGamesLink.share(b + 'zotik/#join=1234'), HOME + 'zotik/#join=1234');
  ok('Homepage-Link von ' + b);
}
{
  const w = page('https://appassets.androidplatform.net/easygames/x/', ['cloud/fire-peer.js'], { EASYGAMES_PUBLIC_BASE: 'https://spiele.example.de' });
  assert.equal(w.EasyGamesLink.share('https://appassets.androidplatform.net/easygames/x/?join=A'), 'https://spiele.example.de/x/?join=A'); ok('EASYGAMES_PUBLIC_BASE');
  assert.equal(w.EasyGamesLink.share('https://example.org/ganz/anders'), 'https://example.org/ganz/anders'); ok('fremde Adressen bleiben');
}
{
  const w = page('https://appassets.androidplatform.net/easygames/mein-spiel/index.html', ['device.js', 'gamekit.js']);
  assert.equal(w.EasyGamesDevice.tvUrl('anmacha-kart/', true), HOME + 'anmacha-kart/?tv'); ok('device.js tvUrl');
  assert.equal(w.EasyGamesKit.joinUrl('AB12'), HOME + 'mein-spiel/?join=AB12'); ok('gamekit joinUrl ohne fire-peer');
}
{
  const w = page('http://localhost/easygames/mein-spiel/index.html', ['cloud/fire-peer.js', 'device.js', 'gamekit.js']);
  assert.equal(w.EasyGamesKit.joinUrl('AB12'), HOME + 'mein-spiel/index.html?join=AB12'); ok('gamekit joinUrl mit fire-peer');
}
// Gleiche Homepage-Adresse in allen Dateien
for (const f of ['cloud/fire-peer.js', 'device.js', 'ricopoly/js/game.js', 'riftzone/client/src/app.ts']) assert.ok(read(f).includes(HOME), f);
ok('Homepage-Adresse überall gleich');
// Kein Einladungslink mehr direkt aus location.href/origin ohne die Regel
const files = ['FunkhausReality/pair.js', 'MachMichAus/pair.js', 'anmacha-frequenzrad/pair.js', 'anmacha-funkparcours/pair.js', 'anmacha-hoererwahl/pair.js',
  'anmacha-preisradar/pair.js', 'zeitsprung-movie/pair.js', 'zeitsprung-radio/pair.js', 'zeitsprung-wissen/pair.js', 'zeitsprung-castingshow/pair.js', 'anmacha-quiz/game.js',
  'anmacha-koffer-dealer/game.js', 'anmacha-kart/game.js', 'gay-life/js/core.js', 'zotik/index.html', 'anmacha-kartenrausch/js/app.js', 'bunte-insel/js/net.js', 'bunte-insel/js/tv.js'];
for (const f of files) assert.ok(read(f).includes('EasyGamesLink'), f + ' nutzt EasyGamesLink nicht');
ok(files.length + ' Spiele nutzen EasyGamesLink');
