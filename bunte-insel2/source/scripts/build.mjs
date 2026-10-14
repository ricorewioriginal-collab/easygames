// Offline-Build mit esbuild (dasselbe Werkzeug, das Vite intern nutzt) – für Umgebungen ohne npm-Registry.
// Ergebnis entspricht `vite build`: dist/index.html, dist/assets/*-[hash].js/css, public/ kopiert.
import { createRequire } from 'node:module';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const req = createRequire(import.meta.url);
let esbuild;
for (const p of ['esbuild', '/opt/npm-tools/node_modules/esbuild']) { try { esbuild = req(p); break; } catch { /* weiter */ } }
if (!esbuild) { console.error('esbuild nicht gefunden'); process.exit(1); }
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const build = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12);
const dist = join(root, 'dist');
rmSync(dist, { recursive: true, force: true });
mkdirSync(join(dist, 'assets'), { recursive: true });
cpSync(join(root, 'public'), dist, { recursive: true });

const res = await esbuild.build({
  entryPoints: { main: join(root, 'src/main.ts') },
  bundle: true, minify: true, format: "esm", target: "es2020", splitting: true, chunkNames: "[name]-[hash]",
  outdir: join(dist, 'assets'), entryNames: '[name]-[hash]', assetNames: '[name]-[hash]',
  define: { __APP_VERSION__: JSON.stringify(pkg.version), __APP_BUILD__: JSON.stringify(build) },
  metafile: true, logLevel: 'warning', legalComments: 'none', charset: 'utf8'
});
const outs = Object.keys(res.metafile.outputs).map(p => p.split('/').pop());
const mainOut = Object.entries(res.metafile.outputs).find(([, o]) => o.entryPoint && o.entryPoint.endsWith('src/main.ts'));
const js = mainOut[0].split('/').pop(), css = outs.find(f => f.endsWith('.css'));
let html = readFileSync(join(root, 'index.html'), 'utf8');
html = html.replace('<script type="module" src="./src/main.ts"></script>', '<script type="module" src="./assets/' + js + '"></script>');
if (css) html = html.replace('</head>', '<link rel="stylesheet" href="./assets/' + css + '">\n</head>');
writeFileSync(join(dist, 'index.html'), html);
const sw = readFileSync(join(dist, 'sw.js'), 'utf8').replace('__BUILD__', build);
writeFileSync(join(dist, 'sw.js'), sw);
writeFileSync(join(dist, 'version.json'), JSON.stringify({ version: pkg.version, build }, null, 1));
const size = f => (readFileSync(join(dist, 'assets', f)).length / 1024).toFixed(0) + ' KB';
console.log('Build ' + build + ': ' + js + ' (' + size(js) + ')' + (css ? ', ' + css + ' (' + size(css) + ')' : ''));
void existsSync; void readdirSync;
