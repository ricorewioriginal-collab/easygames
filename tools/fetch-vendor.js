#!/usr/bin/env node
// Lädt die Bibliotheken, die Spiele von CDNs nachladen, in vendor/ (für Offline-Nutzung, z. B. in der Android-App).
// Quelle ist die npm-Registry (gleiche Pakete wie auf den CDNs); die Prüfsummen stehen in vendor/vendor.lock.json.
//   node tools/fetch-vendor.js            lädt fehlende/geänderte Dateien
//   node tools/fetch-vendor.js --verify   prüft nur die vorhandenen Dateien gegen vendor.lock.json
'use strict';
const fs = require('fs'), os = require('os'), path = require('path'), crypto = require('crypto');
const { execFileSync } = require('child_process');
const root = path.resolve(__dirname, '..'), vdir = path.join(root, 'vendor');
const sha = b => crypto.createHash('sha256').update(b).digest('hex');

// Datei im npm-Paket → Zieldatei in vendor/
const PACKAGES = [
  { pkg: 'three@0.128.0', files: { 'package/build/three.min.js': 'three-r128.min.js' } },
  { pkg: 'peerjs@1.5.4', files: { 'package/dist/peerjs.min.js': 'peerjs-1.5.4.min.js' } },
  { pkg: 'qrcode-generator@1.4.4', files: { 'package/qrcode.js': 'qrcode-generator-1.4.4.js' } },
  { pkg: 'jsqr@1.4.0', files: { 'package/dist/jsQR.js': 'jsqr-1.4.0.js', 'package/LICENSE': 'licenses/jsqr-MIT.txt' } },
  { pkg: 'planck@1.4.2', files: { 'package/dist/planck.min.js': 'planck-1.4.2.min.js', 'package/LICENSE.txt': 'licenses/planck-MIT.txt' } },
  { pkg: '@fontsource-variable/fredoka@5.3.0', files: { 'package/files/fredoka-latin-wght-normal.woff2': 'fonts/fredoka-latin-wght-normal.woff2' } }
];
const FREDOKA_CSS = `/* Fredoka (lokal, ersetzt Google Fonts) – SIL Open Font License */
@font-face{font-family:'Fredoka';font-style:normal;font-display:swap;font-weight:300 700;src:url(./fredoka-latin-wght-normal.woff2) format('woff2')}
`;

const lockFile = path.join(vdir, 'vendor.lock.json');
const lock = fs.existsSync(lockFile) ? JSON.parse(fs.readFileSync(lockFile, 'utf8')) : {};

if (process.argv.includes('--verify')) {
  let bad = 0;
  for (const [f, h] of Object.entries(lock)) {
    const p = path.join(vdir, f);
    if (!fs.existsSync(p) || sha(fs.readFileSync(p)) !== h) { console.error('FEHLER: ' + f + ' fehlt oder weicht von vendor.lock.json ab'); bad++; }
  }
  console.log(Object.keys(lock).length + ' Dateien geprüft: ' + bad + ' Fehler'); process.exit(bad ? 1 : 0);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'eg-vendor-'));
try {
  for (const { pkg, files } of PACKAGES) {
    const missing = Object.values(files).filter(f => !fs.existsSync(path.join(vdir, f)) || (lock[f] && sha(fs.readFileSync(path.join(vdir, f))) !== lock[f]) || !lock[f]);
    if (!missing.length) { console.log('ok     ' + pkg); continue; }
    console.log('lade   ' + pkg);
    const out = execFileSync('npm', ['pack', pkg, '--silent', '--pack-destination', tmp], { encoding: 'utf8' }).trim().split('\n').pop();
    const tgz = path.join(tmp, out);
    for (const [from, to] of Object.entries(files)) {
      const dest = path.join(vdir, to); fs.mkdirSync(path.dirname(dest), { recursive: true });
      const data = execFileSync('tar', ['-xzOf', tgz, from], { maxBuffer: 64 * 1024 * 1024 });
      fs.writeFileSync(dest, data); lock[to] = sha(data);
    }
  }
  fs.writeFileSync(path.join(vdir, 'fonts/fredoka.css'), FREDOKA_CSS); lock['fonts/fredoka.css'] = sha(Buffer.from(FREDOKA_CSS));
  const sorted = Object.fromEntries(Object.entries(lock).sort());
  fs.writeFileSync(lockFile, JSON.stringify(sorted, null, 2) + '\n');
  console.log('fertig: ' + Object.keys(sorted).length + ' Dateien in vendor/');
} finally { fs.rmSync(tmp, { recursive: true, force: true }); }
