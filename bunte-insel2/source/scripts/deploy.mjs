// Kopiert den Build (dist/) in den Spielordner bunte-insel2/, den GitHub Pages ausliefert.
// Entfernt dort NUR frühere Build-Dateien – docs/ und source/ bleiben unangetastet.
import { cpSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist'), target = join(root, '..');
if (!existsSync(join(dist, 'index.html'))) { console.error('Kein Build in dist/ – erst `npm run build` bzw. `npm run build:offline`.'); process.exit(1); }
const OWN = ['index.html', 'assets', 'vendor', 'audio', 'icons', 'fonts', 'sw.js', 'manifest.webmanifest', 'version.json'];
for (const f of OWN) rmSync(join(target, f), { recursive: true, force: true });
for (const f of readdirSync(dist)) {
  if (!OWN.includes(f)) { console.error('Unerwartete Build-Datei: ' + f); process.exit(1); }
  cpSync(join(dist, f), join(target, f), { recursive: true });
}
console.log('Bereitgestellt nach ' + target);
