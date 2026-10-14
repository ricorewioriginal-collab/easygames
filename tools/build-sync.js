#!/usr/bin/env node
// Erzeugt die Sync-Dateien für die easygames-App: sync/manifest.json (Dateiliste mit Prüfsummen) und sync/catalog.json (Spielekatalog).
// Die App lädt nur Dateien, deren Prüfsumme sich geändert hat – ohne neues APK.
//
//   node tools/build-sync.js                  schreibt sync/manifest.json + sync/catalog.json (nur bei Änderungen)
//   node tools/build-sync.js --check          Exit 1, wenn die Dateien nicht aktuell sind (für CI)
//   node tools/build-sync.js --stage <ordner> kopiert alle Inhalte + sync/manifest.json dorthin (Start-Inhalt für das APK)
//   node tools/build-sync.js --stats          zeigt Größen je Spiel
//   node tools/build-sync.js --strict         unbekannte Bibliotheken von CDNs gelten als Fehler
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), crypto = require('crypto');
const { execFileSync } = require('child_process');
const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2), has = f => args.includes(f), val = f => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };

const LINKS = { radio: 'https://www.ricorewi-radio.de', githubPage: 'https://ricorewioriginal-collab.github.io/easygames/' };
const SHELL = ['index.html', 'einbinden.html', 'games.js', 'modes.js', 'guides.js', 'device.js', 'gamekit.js', 'easygames.js'];
const SHELL_OPTIONAL = ['logo.png', 'logo.jpg', 'logo.jpeg', 'logo.svg', 'logo.webp', 'cloud/anmacha-cloud.js'];
// Nicht ins Offline-Paket: Quellcode, Doku, Tests, Build-Hilfen
const SKIP_DIRS = new Set(['node_modules', '.git', '.github', '.vscode', 'docs', 'doc', 'test', 'tests', '__tests__', 'tools', 'coverage', 'source']);   // source: Quellcode von bunte-insel2 (gebaut liegt das Spiel daneben)
const SKIP_FILE = /(^|\/)(README[^/]*|[^/]*\.md|package(-lock)?\.json|tsconfig[^/]*\.json|eslint\.config\.[^/]*|\.[^/]*|THIRD_PARTY[^/]*|LICENSE[^/]*)$|\.(map|ts|tsx|sh|py|psd|blend|log)$/i;
const ONLINE_ONLY = /^(stream\.laut\.fm|api\.laut\.fm|i\.ytimg\.com|www\.youtube\.com|www\.youtube-nocookie\.com|www\.googleapis\.com|firestore\.googleapis\.com|0\.peerjs\.com|www\.ricorewi-radio\.de|ricorewioriginal-collab\.github\.io|www\.w3\.org|github\.com|localhost|127\.0\.0\.1)$/;
const CDN_HOSTS = /^(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|unpkg\.com|ajax\.googleapis\.com|code\.jquery\.com|fonts\.googleapis\.com|fonts\.gstatic\.com|stackpath\.bootstrapcdn\.com)$/;

const sha256 = b => crypto.createHash('sha256').update(b).digest('hex');
function loadJs(file, expr) {
  const w = {}; w.window = w;
  vm.runInNewContext(fs.readFileSync(path.join(root, file), 'utf8') + `\n;this.__R = ${expr};`, w);
  return w.__R;
}
const GAMES = loadJs('games.js', 'typeof GAMES !== "undefined" ? GAMES : window.EASYGAMES_GAMES');
const MODES = loadJs('modes.js', 'window.EASYGAMES_MODES') || {};
const GUIDES = loadJs('guides.js', 'window.EASYGAMES_GUIDES') || {};
const isUrl = p => /^[a-z]+:\/\//i.test(p);

function walk(dir, rel, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const r = rel ? rel + '/' + e.name : e.name;
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walk(path.join(dir, e.name), r, out); }
    else if (e.isFile() && !SKIP_FILE.test(r)) out.push(r);
  }
}

const warns = [], errors = [];
const files = new Map(), owner = new Map();   // Pfad → { s, h }, Pfad → Spiel-ID
const add = (p, who) => {
  if (files.has(p)) return;
  const b = fs.readFileSync(path.join(root, p));
  files.set(p, { p, s: b.length, h: sha256(b) }); owner.set(p, who);
};
SHELL.forEach(f => { if (!fs.existsSync(path.join(root, f))) errors.push('Pflichtdatei fehlt: ' + f); else add(f, '_shell'); });
SHELL_OPTIONAL.forEach(f => { if (fs.existsSync(path.join(root, f))) add(f, '_shell'); });

// Spiele
const sizes = {}, counts = {};
for (const g of GAMES) {
  if (!g.path || isUrl(g.path)) { warns.push(`${g.id}: externes Spiel (${g.path}) – wird nicht offline gespeichert`); continue; }
  const dir = g.path.replace(/\/$/, ''), list = [];
  if (!fs.existsSync(path.join(root, dir))) { errors.push(`${g.id}: Ordner ${dir} fehlt`); continue; }
  walk(path.join(root, dir), dir, list);
  list.sort().forEach(p => add(p, g.id));
  if (g.img && !isUrl(g.img)) add(g.img, g.id);
}
for (const [p, who] of owner) { if (who === '_shell') continue; sizes[who] = (sizes[who] || 0) + files.get(p).s; counts[who] = (counts[who] || 0) + 1; }

// Externe Bibliotheken → vendor/
const vendorMap = JSON.parse(fs.readFileSync(path.join(root, 'vendor', 'map.json'), 'utf8'));
const vendorFiles = new Set(Object.values(vendorMap));
vendorFiles.add('vendor/fonts/fredoka.css');
for (const f of vendorFiles) { if (!fs.existsSync(path.join(root, f))) errors.push(`vendor: ${f} fehlt (node tools/fetch-vendor.js)`); else add(f, '_vendor'); }
// Google-Fonts-Stylesheets (Fredoka) → lokales CSS
const TEXT = /\.(html?|js|mjs|css|json)$/i, URL_RE = /https?:\/\/[A-Za-z0-9._-]+(?::\d+)?(?:\/[^\s"'`)<>\\]*)?/g;
const seen = new Map();
for (const [p, who] of owner) {
  if (who === '_vendor' || !TEXT.test(p) || files.get(p).s > 3 * 1024 * 1024) continue;
  for (const m of fs.readFileSync(path.join(root, p), 'utf8').match(URL_RE) || []) {
    const url = m.replace(/[.,;]+$/, ''), host = new URL(url).hostname;
    if (!CDN_HOSTS.test(host) || new URL(url).pathname.length <= 1 && !new URL(url).search) continue;   // reine Host-Angaben (preconnect) sind keine Ressourcen
    if (!seen.has(url)) seen.set(url, new Set()); seen.get(url).add(p);
  }
}
for (const [url, where] of seen) {
  if (vendorMap[url]) continue;
  if (/^https:\/\/fonts\.googleapis\.com\/css2?\?/.test(url)) {
    if (/family=Fredoka(?:[:&]|$)/.test(url) && !/family=(?!Fredoka)/.test(url.replace(/^[^?]*\?/, ''))) { vendorMap[url] = 'vendor/fonts/fredoka.css'; continue; }
    warns.push(`Schrift nicht lokal verfügbar: ${url} (in ${[...where][0]}) – Spiel nutzt Ersatzschrift`); continue;
  }
  if (/^https:\/\/fonts\.gstatic\.com/.test(url) || url === 'https://fonts.googleapis.com' || /^https:\/\/fonts\.googleapis\.com\/?$/.test(url)) continue;   // preconnect o. ä.
  const msg = `Bibliothek nicht für Offline vorhanden: ${url} (in ${[...where].slice(0, 2).join(', ')}) → in vendor/map.json eintragen`;
  (has('--strict') ? errors : warns).push(msg);
}
const sortedVendor = Object.fromEntries(Object.entries(vendorMap).sort(([a], [b]) => a.localeCompare(b)));

// Katalog (Spiele mit Anleitung, Modi, Größe)
const catalog = {
  schema: 1, links: LINKS,
  games: GAMES.map(g => {
    const m = Object.assign({}, MODES[g.id], g.modes), mp = !!(m.pad || m.online || m.multi);
    return {
      id: g.id, title: g.title, desc: g.desc, icon: g.icon || null, img: g.img || null, bg: g.bg || null, glow: g.glow || null, path: g.path,
      modes: m, multiplayer: mp, guide: GUIDES[g.id] || null,
      size: sizes[g.id] || 0, files: counts[g.id] || 0, offline: !isUrl(g.path)
    };
  })
};
const catalogText = JSON.stringify(catalog, null, 1) + '\n';
fs.mkdirSync(path.join(root, 'sync'), { recursive: true });
const catalogPath = 'sync/catalog.json';
fs.writeFileSync(path.join(root, catalogPath), catalogText);
files.set(catalogPath, { p: catalogPath, s: Buffer.byteLength(catalogText), h: sha256(Buffer.from(catalogText)) }); owner.set(catalogPath, '_shell');

const list = [...files.values()].sort((a, b) => a.p < b.p ? -1 : 1);
const version = sha256(Buffer.from(list.map(f => f.p + '\0' + f.h).join('\n') + '\n' + JSON.stringify(sortedVendor))).slice(0, 12);
let commit = null, generated = null;
try { commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(); generated = execFileSync('git', ['log', '-1', '--format=%cI'], { cwd: root, encoding: 'utf8' }).trim(); } catch (e) {}
const manifest = { schema: 1, version, generated: generated || new Date().toISOString(), commit, entry: 'index.html', catalog: catalogPath, files: list, vendor: sortedVendor };

const manPath = path.join(root, 'sync', 'manifest.json');
let oldVersion = null; try { oldVersion = JSON.parse(fs.readFileSync(manPath, 'utf8')).version; } catch (e) {}
const total = list.reduce((a, f) => a + f.s, 0);

if (has('--stats')) {
  Object.entries(sizes).sort((a, b) => b[1] - a[1]).forEach(([id, s]) => console.log(String(Math.round(s / 1024)).padStart(8) + ' KB  ' + id + ' (' + counts[id] + ' Dateien)'));
}
warns.forEach(w => console.log('Warnung: ' + w));
errors.forEach(e => console.error('FEHLER:  ' + e));

if (has('--check')) {
  if (errors.length) process.exit(1);
  if (oldVersion !== version) { console.error(`sync/manifest.json ist veraltet (${oldVersion} ≠ ${version}). Bitte "node tools/build-sync.js" ausführen.`); process.exit(1); }
  console.log('sync/manifest.json ist aktuell (' + version + ')'); process.exit(0);
}
if (errors.length) process.exit(1);
if (oldVersion !== version) fs.writeFileSync(manPath, JSON.stringify(manifest, null, 1) + '\n');   // sonst unverändert lassen (kein Commit-Rauschen)
console.log(`${list.length} Dateien, ${(total / 1048576).toFixed(1)} MB, Version ${version}${oldVersion === version ? ' (unverändert)' : ' (neu)'}`);

const stage = val('--stage');
if (stage) {
  const out = path.resolve(root, stage); fs.rmSync(out, { recursive: true, force: true });
  for (const f of list) { const d = path.join(out, f.p); fs.mkdirSync(path.dirname(d), { recursive: true }); fs.copyFileSync(path.join(root, f.p), d); }
  fs.mkdirSync(path.join(out, 'sync'), { recursive: true });
  fs.copyFileSync(manPath, path.join(out, 'sync', 'manifest.json'));
  console.log('Start-Inhalt nach ' + stage + ' kopiert');
}
