#!/usr/bin/env node
// Prüft games.js, modes.js und guides.js auf Fehler, damit neue Spiele in der Übersicht sinnvoll funktionieren.
//   node tools/check-games.js        (Exit-Code 1 bei Fehlern, Warnungen brechen nicht ab)
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.resolve(__dirname, '..');
const load = f => { const w = {}; vm.runInNewContext(fs.readFileSync(path.join(root, f), 'utf8') + '\n;this.__G = typeof GAMES !== "undefined" ? GAMES : undefined;', Object.assign(w, { window: w })); return w; };
const errors = [], warns = [];
const err = m => errors.push(m), warn = m => warns.push(m);

const g = load('games.js'), GAMES = g.__G || g.EASYGAMES_GAMES;
if (!Array.isArray(GAMES)) { console.error('FEHLER: games.js definiert kein GAMES-Array'); process.exit(1); }
const MODES = load('modes.js').EASYGAMES_MODES || {}, GUIDES = load('guides.js').EASYGAMES_GUIDES || {};
const CATS = load('categories.js').EASYGAMES_CATS || { list: [], of: {} };
const ids = new Set(), KEYS = ['pad', 'online', 'multi', 'tvParam'];
const isUrl = p => /^[a-z]+:\/\//i.test(p);

GAMES.forEach((x, i) => {
  const n = `Spiel #${i + 1} (${x.id || '?'})`;
  if (!x.id || !/^[A-Za-z0-9_-]+$/.test(x.id)) err(`${n}: id fehlt oder enthält Zeichen außer A–Z, 0–9, _ und -`);
  if (ids.has(x.id)) err(`${n}: id doppelt vergeben`); ids.add(x.id);
  if (!x.title) err(`${n}: title fehlt`);
  if (!x.desc) err(`${n}: desc (Kurzbeschreibung) fehlt`);
  if (!x.bg) warn(`${n}: bg (Farbverlauf) fehlt`);
  if (!x.icon && !x.img) err(`${n}: icon oder img nötig`);
  if (!x.path) err(`${n}: path fehlt`);
  else if (!isUrl(x.path) && !fs.existsSync(path.join(root, x.path, 'index.html'))) err(`${n}: ${x.path}index.html nicht gefunden`);
  if (x.img && !isUrl(x.img) && !fs.existsSync(path.join(root, x.img))) err(`${n}: Bild ${x.img} nicht gefunden`);
  if (!x.img) warn(`${n}: kein Kartenbild (img) – es erscheint das Icon`);
  if (!x.external && !isUrl(x.path) && !fs.existsSync(path.join(root, 'share', x.id + '.html'))) warn(`${n}: keine Teilen-Vorschau – node tools/make-share.cjs ${x.id}`);
  if (!isUrl(x.path) && !fs.existsSync(path.join(root, x.path, 'manifest.webmanifest'))) warn(`${n}: keine PWA-Dateien – python3 tools/make-pwa.py ausführen (macht das Spiel mobil installierbar, mit automatischem Update)`);
  if (!CATS.list.some(c => c.id === CATS.of[x.id])) warn(`${n}: keine Kategorie in categories.js (erscheint nur unter "Alle")`);
  const gd = GUIDES[x.id];
  if (!gd) warn(`${n}: keine Anleitung in guides.js (es wird die Kurzbeschreibung gezeigt)`);
  else { if (!gd.anleitung) warn(`${n}: guides.js ohne "anleitung"`); if (!Array.isArray(gd.steuerung) || !gd.steuerung.length) warn(`${n}: guides.js ohne "steuerung"`); }
  const m = Object.assign({}, MODES[x.id], x.modes);
  Object.keys(m).forEach(k => { if (!KEYS.includes(k)) warn(`${n}: unbekannter Modus "${k}" (erlaubt: ${KEYS.join(', ')})`); });
});
Object.keys(MODES).forEach(k => { if (!ids.has(k)) warn(`modes.js: "${k}" ist kein Spiel in games.js`); });
Object.keys(GUIDES).forEach(k => { if (!ids.has(k)) warn(`guides.js: "${k}" ist kein Spiel in games.js`); });

warns.forEach(w => console.log('Warnung: ' + w));
errors.forEach(e => console.error('FEHLER:  ' + e));
console.log(`${GAMES.length} Spiele geprüft: ${errors.length} Fehler, ${warns.length} Warnungen`);
process.exit(errors.length ? 1 : 0);
