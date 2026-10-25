import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Das Build-Ergebnis wird in ../anmacha-quest-rpg geschrieben und eingecheckt,
// damit GitHub Pages (Auslieferung direkt aus dem Repo) das Spiel ohne CI ausliefert.
// Die 3D-Modelle (ca. 20 MB) liegen nur einmal im Repo: in ../anmacha-quest-rpg/models.
// Der Build lässt sie stehen und ersetzt nur den Ordner assets/; der Dev-Server liefert sie von dort aus.
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../anmacha-quest-rpg');
const MODELS = path.join(OUT, 'models');
const TYPES = { '.glb': 'model/gltf-binary', '.png': 'image/png', '.md': 'text/plain; charset=utf-8' };

let isBuild = false;
const sharedModels = {
  name: 'shared-models',
  configureServer(server) {
    server.middlewares.use('/models', (req, res, next) => {
      const f = path.join(MODELS, decodeURIComponent(req.url.split('?')[0]));
      if (!f.startsWith(MODELS + path.sep) || !fs.existsSync(f) || !fs.statSync(f).isFile()) return next();
      res.setHeader('Content-Type', TYPES[path.extname(f)] || 'application/octet-stream');
      fs.createReadStream(f).pipe(res);
    });
  },
  configResolved(c) { isBuild = c.command === 'build'; },
  // nur beim Bauen (buildStart läuft auch im Dev-Server)
  buildStart() { if (isBuild) fs.rmSync(path.join(OUT, 'assets'), { recursive: true, force: true }); }
};

export default defineConfig({
  base: './',
  plugins: [sharedModels],
  build: {
    outDir: OUT,
    emptyOutDir: false,
    target: 'es2020',
    chunkSizeWarningLimit: 900,
    assetsInlineLimit: 0
  }
});
