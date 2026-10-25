/* Prüft ohne npm-Pakete, ob bunte-insel/js/bunte-insel.min.js zum aktuellen Quellcode passt (läuft auch in der CI).
   Schlägt fehl, wenn eine Spieldatei geändert wurde, ohne das Bündel neu zu bauen: cd bunte-insel-src && npm install && npm run build */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { GAME, INDEX, OUT, biFiles, concatSources, hashOf, BUNDLE_RE, VERSION_RE } from './bundle-lib.mjs';

const fail = m => { console.error('✗ ' + m + '\n  Neu bauen: cd bunte-insel-src && npm install && npm run build'); process.exit(1); };
const html = readFileSync(INDEX, 'utf8'), files = biFiles(html);
for (const f of files) if (!existsSync(join(GAME, f))) fail('Datei aus BI_FILES fehlt: ' + f);
if (new Set(files).size !== files.length) fail('Doppelte Einträge in BI_FILES');
if (!BUNDLE_RE.test(html)) fail('index.html lädt das Bündel nicht');
if (!existsSync(OUT)) fail('Bündel fehlt: bunte-insel/js/bunte-insel.min.js');
const h = hashOf(concatSources(files)), head = readFileSync(OUT, 'utf8').slice(0, 300).match(/sha256:([0-9a-f]{64})/);
if (!head || head[1] !== h) fail('Bündel ist veraltet (Quellcode geändert)');
const v = html.match(VERSION_RE);
if (!v || v[1] !== h.slice(0, 12)) fail('Version in index.html passt nicht zum Bündel');
console.log('✓ Bunte-Insel-Bündel aktuell (' + files.length + ' Dateien, sha256 ' + h.slice(0, 12) + ')');
