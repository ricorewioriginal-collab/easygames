/* Vite für Bunte Insel.
   npm run build → bündelt alle Spieldateien (Reihenfolge aus window.BI_FILES in bunte-insel/index.html) zu EINER verkleinerten Datei
   bunte-insel/js/bunte-insel.min.js und trägt die Version in index.html ein. Die Spieldateien bleiben klassische Skripte (globales BI),
   darum werden sie aneinandergehängt und mit esbuild (in Vite enthalten) verkleinert – ohne Umbenennen globaler Namen.
   npm run dev → Vite-Server auf dem Repo-Ordner, lädt bei jeder Änderung in bunte-insel/js neu: http://localhost:5173/bunte-insel/ */
import { defineConfig, transformWithEsbuild } from 'vite';
import { readFileSync, writeFileSync } from 'node:fs';
import { ROOT, INDEX, OUT, biFiles, concatSources, hashOf, HEADER, VERSION_RE } from './bundle-lib.mjs';

function biBundle() {
  return {
    name: 'bunte-insel-bundle',
    apply: 'build',
    async closeBundle() {
      const files = biFiles(), src = concatSources(files), h = hashOf(src);
      const r = await transformWithEsbuild(src, 'bunte-insel.js', { minify: true, target: 'esnext', charset: 'utf8', legalComments: 'none' });
      writeFileSync(OUT, HEADER(h) + r.code);
      const html = readFileSync(INDEX, 'utf8'), next = html.replace(VERSION_RE, ",V='" + h.slice(0, 12) + "'");
      if (next !== html) writeFileSync(INDEX, next);
      console.log('Bunte Insel: ' + files.length + ' Dateien, ' + Math.round(src.length / 1024) + ' KB → ' + Math.round(r.code.length / 1024) + ' KB (' + OUT.replace(ROOT + '/', '') + ')');
    }
  };
}

function biReload() {
  return {
    name: 'bunte-insel-reload',
    apply: 'serve',
    configureServer(server) {
      server.watcher.add(ROOT + '/bunte-insel');
      server.watcher.on('change', f => { if (/bunte-insel\/(js|index\.html)/.test(f) && !/\.min\.js$/.test(f)) server.ws.send({ type: 'full-reload' }); });
    }
  };
}

export default defineConfig({
  root: ROOT,
  publicDir: false,
  logLevel: 'info',
  server: { open: '/bunte-insel/index.html?dev=1', fs: { allow: [ROOT] } },
  /* Der Build selbst hat keinen Modul-Eingang: ein leerer virtueller Eingang, die Arbeit macht biBundle() */
  build: { outDir: 'bunte-insel-src/.vite-out', emptyOutDir: true, write: false, rollupOptions: { input: 'virtual:bi-empty', onwarn: (w, d) => { if (w.code !== 'EMPTY_BUNDLE') d(w); } } },
  plugins: [{ name: 'bi-empty', resolveId: id => id === 'virtual:bi-empty' ? '\0bi-empty' : null, load: id => id === '\0bi-empty' ? 'export {}' : null }, biBundle(), biReload()]
});
