#!/usr/bin/env node
// Prüft games.js, modes.js und guides.js auf Fehler, damit neue Spiele in der Übersicht sinnvoll funktionieren.
//   node tools/check-games.js        (Exit-Code 1 bei Fehlern, Warnungen brechen nicht ab)
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), crypto = require('crypto');
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
  if (!fs.existsSync(path.join(root, 'guides', x.id + '.json'))) warn(`${n}: kein Handbuch/Ratgeber/Lösungsbuch in guides/${x.id}.json (node tools/check-guides.js)`);
  const m = Object.assign({}, MODES[x.id], x.modes);
  Object.keys(m).forEach(k => { if (!KEYS.includes(k)) warn(`${n}: unbekannter Modus "${k}" (erlaubt: ${KEYS.join(', ')})`); });
});
Object.keys(MODES).forEach(k => { if (!ids.has(k)) warn(`modes.js: "${k}" ist kein Spiel in games.js`); });
Object.keys(GUIDES).forEach(k => { if (!ids.has(k)) warn(`guides.js: "${k}" ist kein Spiel in games.js`); });

// Einbindung: überall dieselben iframe-Freigaben, damit eingebettete Spiele (auch neue) alles dürfen
const ALLOW = (fs.readFileSync(path.join(root, 'easygames.js'), 'utf8').match(/var FRAME_ALLOW = '([^']+)'/) || [])[1];
if (!ALLOW) err('easygames.js: FRAME_ALLOW nicht gefunden');
else ['index.html', 'hub/anmacha-hub.js', 'einbinden.html', 'cloud/anmacha-account.js', 'stream.html'].forEach(f => {
  const src = fs.readFileSync(path.join(root, f), 'utf8');
  (src.match(/allow\s*=\s*["'`](fullscreen;[^"'`]*)["'`]/g) || []).forEach(a => { if (!a.includes(ALLOW)) err(`${f}: iframe-Freigabe weicht von FRAME_ALLOW (easygames.js) ab: ${a}`); });
});
// Sprachausgabe: Spiele, die sprechen, laden cloud/anmacha-cloud.js (Korrekturen + Sprechen über die einbindende Seite)
const speaks = dir => { const st = [dir]; while (st.length) { const d = st.pop(); for (const f of fs.readdirSync(d, { withFileTypes: true })) { const q = path.join(d, f.name);
  if (f.isDirectory()) { if (!/^(node_modules|vendor|tests?|src)$/.test(f.name)) st.push(q); } else if (/\.(js|html)$/.test(f.name) && fs.statSync(q).size < 4e6 && fs.readFileSync(q, 'utf8').includes('speechSynthesis')) return true; } } return false; };
GAMES.forEach(x => {
  if (!x.path || isUrl(x.path)) return;
  const ix = path.join(root, x.path, 'index.html'), dir = path.join(root, x.path);
  if (fs.existsSync(ix) && speaks(dir) && !/anmacha-cloud\.js/.test(fs.readFileSync(ix, 'utf8'))) err(`${x.id}: spricht (speechSynthesis), lädt aber cloud/anmacha-cloud.js nicht – eingebettet bliebe es stumm`);
});

// Vorschaubilder der Spieleliste (tools/make-thumbs.py): fehlt oder veraltet → Warnung (die Seite zeigt dann das große Original)
const thumbsJs = path.join(root, 'thumbs', 'thumbs.js');
const TH = fs.existsSync(thumbsJs) ? (() => { const w = {}; vm.runInNewContext(fs.readFileSync(thumbsJs, 'utf8'), { window: w }); return w.EASYGAMES_THUMBS || {}; })() : {};
GAMES.forEach(x => {
  if (!x.img || isUrl(x.img) || !/\.(png|jpe?g)$/i.test(x.img) || !fs.existsSync(path.join(root, x.img))) return;
  const h = crypto.createHash('md5').update(fs.readFileSync(path.join(root, x.img))).digest('hex').slice(0, 10);
  if (TH[x.id] && TH[x.id] !== h) warn(`${x.id}: Vorschaubild veraltet – python3 tools/make-thumbs.py`);
  else if (!TH[x.id] && fs.statSync(path.join(root, x.img)).size > 40000) warn(`${x.id}: kein Vorschaubild (Kartenbild ${Math.round(fs.statSync(path.join(root, x.img)).size / 1024)} KB) – python3 tools/make-thumbs.py`);
});

warns.forEach(w => console.log('Warnung: ' + w));
errors.forEach(e => console.error('FEHLER:  ' + e));
console.log(`${GAMES.length} Spiele geprüft: ${errors.length} Fehler, ${warns.length} Warnungen`);
process.exit(errors.length ? 1 : 0);
