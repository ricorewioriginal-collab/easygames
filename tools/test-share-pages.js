#!/usr/bin/env node
// Prüft die Teilen-Vorschauen (share/): jedes Spiel hat Bild + Seite mit Titel, Beschreibung, Open-Graph-/Twitter-Tags und Weiterleitung zu einem vorhandenen Ziel.   node tools/test-share-pages.js
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert/strict');
const root = path.resolve(__dirname, '..'), BASE = 'https://ricorewioriginal-collab.github.io/easygames/';
const ctx = { window: {}, console }; ctx.self = ctx.window; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(root, 'games.js'), 'utf8'), ctx);
const games = ctx.window.EASYGAMES_GAMES; assert(games.length > 30, 'Spieleliste');
let n = 0;
for (const g of games) {
  if (g.external) continue;
  const html = fs.readFileSync(path.join(root, 'share', g.id + '.html'), 'utf8'), jpg = path.join(root, 'share', g.id + '.jpg');
  assert(fs.existsSync(jpg) && fs.statSync(jpg).size > 8000, g.id + ': Vorschaubild fehlt oder ist leer');
  const b = fs.readFileSync(jpg); assert(b[0] === 0xff && b[1] === 0xd8, g.id + ': kein JPEG');
  for (const t of ['og:title', 'og:description', 'og:image', 'og:url', 'twitter:card', 'twitter:image']) assert(html.includes(t), g.id + ': ' + t + ' fehlt');
  assert(html.includes('content="' + BASE + 'share/' + g.id + '.jpg"'), g.id + ': og:image zeigt nicht auf die eigene Datei');
  assert(html.includes('content="' + BASE + 'share/' + g.id + '.html"'), g.id + ': og:url');
  assert(/<meta name="description" content="[^"]{20,}"/.test(html), g.id + ': Beschreibung');
  const t = /http-equiv="refresh" content="0;url=\.\.\/([^"]+)"/.exec(html); assert(t, g.id + ': Weiterleitung fehlt');
  assert(fs.existsSync(path.join(root, decodeURIComponent(t[1].replace(/&amp;/g, '&')).split('?')[0].replace(/\/$/, '')) ), g.id + ': Ziel existiert nicht: ' + t[1]);
  n++;
}
for (const f of ['portal.jpg']) assert(fs.statSync(path.join(root, 'share', f)).size > 8000, f);
assert(/share\/portal\.jpg/.test(fs.readFileSync(path.join(root, 'index.html'), 'utf8')), 'index.html: og:image');
const tmpl = fs.readFileSync(path.join(root, 'index.html'), 'utf8'); assert(tmpl.includes("abs('share/' + g.id + '.html')"), 'Teilen-Dialog verweist auf die Vorschauseite');
console.log('OK: ' + n + ' Spiele mit Teilen-Vorschau (Bild, Tags, Weiterleitung)');
