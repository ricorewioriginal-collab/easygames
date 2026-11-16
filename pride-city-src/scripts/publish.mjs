/* Kopiert den Build nach ../pride-city. Dateien, die make-pwa.py und make-cards anlegen (Manifest, Service Worker, card.jpg, logo.svg), bleiben erhalten. */
import { cpSync, rmSync, existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const out = new URL('../../pride-city/', import.meta.url), dist = new URL('../dist/', import.meta.url);
const keep = ['manifest.webmanifest', 'sw.js', 'card.jpg', 'logo.svg'];
const saved = {};
for (const f of keep) { const p = new URL(f, out); if (existsSync(p)) saved[f] = readFileSync(p); }
const oldHtml = existsSync(new URL('index.html', out)) ? readFileSync(new URL('index.html', out), 'utf8') : '';
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(dist, out, { recursive: true });
for (const [f, b] of Object.entries(saved)) writeFileSync(new URL(f, out), b);
// PWA-Block aus make-pwa.py beibehalten
const m = oldHtml.match(/<!--pwa-->[\s\S]*?<!--\/pwa-->/);
if (m) { const p = new URL('index.html', out); writeFileSync(p, readFileSync(p, 'utf8').replace('</head>', m[0] + '</head>')); }
console.log('pride-city/ aktualisiert');
