// Baut RicoRail in den Spielordner ../ (ricorail/): ein klassisches Skript-Bundle (läuft auch aus lokalen App-Dateien),
// index.html, Service Worker mit Cache-Version und version.json. Nur Dateien in ricorail/ werden geschrieben.
import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(SRC, '..');
const pkg = JSON.parse(readFileSync(join(SRC, 'package.json'), 'utf8'));

const res = await build({
  entryPoints: [join(SRC, 'src/app/main.ts')],
  bundle: true, minify: true, format: 'iife', target: ['es2020', 'chrome87', 'safari14', 'firefox90'],
  write: false, legalComments: 'eof', sourcemap: false, logLevel: 'warning',
  define: { 'process.env.NODE_ENV': '"production"' },
});
const code = res.outputFiles[0].contents;
const hash = createHash('sha256').update(code).digest('hex').slice(0, 10);
const name = `ricorail-${hash}.js`;
mkdirSync(join(OUT, 'assets'), { recursive: true });
// Alte Bundles dieses Spiels entfernen (nur assets/ricorail-*.js)
for (const f of readdirSync(join(OUT, 'assets'))) if (/^ricorail-[0-9a-f]+\.js$/.test(f) && f !== name) unlinkSync(join(OUT, 'assets', f));
writeFileSync(join(OUT, 'assets', name), code);

const html = readFileSync(join(SRC, 'index.template.html'), 'utf8').replace('%BUNDLE%', `./assets/${name}`).replace(/%VERSION%/g, pkg.version);
writeFileSync(join(OUT, 'index.html'), html);
const sw = readFileSync(join(SRC, 'sw.template.js'), 'utf8').replace('%CACHE%', `eg-ricorail-${hash}`).replace('%BUNDLE%', `./assets/${name}`);
writeFileSync(join(OUT, 'sw.js'), sw);
writeFileSync(join(OUT, 'version.json'), JSON.stringify({ version: pkg.version, build: hash, date: new Date().toISOString().slice(0, 10) }, null, 2) + '\n');
for (const f of ['manifest.webmanifest', 'favicon.svg', 'card.svg']) if (!existsSync(join(OUT, f))) console.warn(`Hinweis: ${f} fehlt in ricorail/`);
console.log(`RicoRail gebaut: assets/${name} (${(code.length / 1024).toFixed(0)} kB)`);
