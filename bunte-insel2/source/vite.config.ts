// Vite-Konfiguration für Bunte Insel 2.
// Relativer Basispfad: das Spiel läuft unter https://<user>.github.io/easygames/bunte-insel2/ genauso wie lokal.
// Ausgabe nach dist/, danach kopiert `npm run deploy` den Build in den Spielordner ../ (GitHub Pages liefert ihn aus).
import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };
const build = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12);

export default defineConfig({
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __APP_BUILD__: JSON.stringify(build),
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1200,
  },
  server: { host: true },
});
