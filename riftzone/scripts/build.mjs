#!/usr/bin/env node
// Produktions-Build mit esbuild (Alternative zu `vite build`, gleiche Ausgabe-Struktur in ../app).
// Erzeugt: app/index.html, app/assets/*.js|css, app/heightmap.bin, statische Dateien aus client/public.
//   node scripts/build.mjs
import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'app');
const assets = join(out, 'assets');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const t0 = Date.now();
const hash = (buf) => createHash('sha256').update(buf).digest('hex').slice(0, 10);

// 1) Höhenkarte vorberechnen (TypeScript-Generator mit esbuild bündeln und ausführen)
const cache = join(root, 'node_modules', '.cache', 'riftzone');
mkdirSync(cache, { recursive: true });
const pub = join(root, 'client', 'public');
mkdirSync(pub, { recursive: true });
await build({ entryPoints: [join(root, 'scripts', 'gen-heightmap.ts')], bundle: true, platform: 'node', format: 'esm', outfile: join(cache, 'gen.mjs'), logLevel: 'warning' });
process.argv[2] = join(pub, 'heightmap.bin');
await import(pathToFileURL(join(cache, 'gen.mjs')).href + `?t=${Date.now()}`);

// 2) Ausgabeordner leeren
rmSync(out, { recursive: true, force: true });
mkdirSync(assets, { recursive: true });

const common = {
  bundle: true,
  format: 'esm',
  target: ['es2020', 'chrome90', 'firefox90', 'safari15'],
  minify: true,
  sourcemap: false,
  legalComments: 'none',
  define: { __APP_VERSION__: JSON.stringify(pkg.version), 'process.env.NODE_ENV': '"production"' },
  logLevel: 'warning',
  write: false,
};

// 3) Worker (Offline-Server)
const wres = await build({ ...common, entryPoints: [join(root, 'client', 'src', 'net', 'worker.ts')], outfile: 'worker.js' });
const wcode = wres.outputFiles[0].contents;
const wname = `worker-${hash(wcode)}.js`;
writeFileSync(join(assets, wname), wcode);

// 4) Hauptprogramm – Worker-URL wie bei Vite auf die gebaute Datei umbiegen
const workerUrlPlugin = {
  name: 'worker-url',
  setup(b) {
    b.onLoad({ filter: /net[\\/]local\.ts$/ }, (args) => {
      const src = readFileSync(args.path, 'utf8').replace("new URL('./worker.ts', import.meta.url)", `new URL('./${wname}', import.meta.url)`);
      return { contents: src, loader: 'ts' };
    });
  },
};
const mres = await build({ ...common, entryPoints: [join(root, 'client', 'src', 'main.ts')], outdir: assets, entryNames: 'index', plugins: [workerUrlPlugin], loader: { '.css': 'css' } });
let jsName = '',
  cssName = '';
for (const f of mres.outputFiles) {
  const ext = f.path.endsWith('.css') ? 'css' : 'js';
  const name = `index-${hash(f.contents)}.${ext}`;
  writeFileSync(join(assets, name), f.contents);
  if (ext === 'css') cssName = name;
  else jsName = name;
}

// 5) HTML und statische Dateien
let html = readFileSync(join(root, 'client', 'index.html'), 'utf8');
html = html.replace(/<script type="module" src="\.\/src\/main\.ts"><\/script>/, `<script type="module" crossorigin src="./assets/${jsName}"></script>`);
if (cssName) html = html.replace('</head>', `    <link rel="stylesheet" crossorigin href="./assets/${cssName}" />\n  </head>`);
writeFileSync(join(out, 'index.html'), html);
if (existsSync(pub)) for (const f of readdirSync(pub)) cpSync(join(pub, f), join(out, f), { recursive: true });

const size = (f) => (readFileSync(join(assets, f)).length / 1024).toFixed(0);
console.log(`Build fertig in ${Date.now() - t0} ms → app/  (${jsName} ${size(jsName)} KB, ${wname} ${size(wname)} KB${cssName ? `, ${cssName} ${size(cssName)} KB` : ''})`);
