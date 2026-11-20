import { defineConfig } from 'vite';

// Das Build-Ergebnis wird in ../zotik geschrieben und eingecheckt,
// damit GitHub Pages (Auslieferung direkt aus dem Repo) das Spiel ohne CI unter der bisherigen Adresse ausliefert.
// Dateien aus public/ (Service Worker, Manifest, Minispiele, Vorschaubild) landen unverändert daneben.
import { fileURLToPath } from 'url';
// Babylon-EXR-Lader (lädt fflate von unpkg) wird nicht gebraucht: durch leeren Baustein ersetzen, damit Zotik offline bündelbar bleibt
const stub = fileURLToPath(new URL('./src/stubs/empty.js', import.meta.url));
export default defineConfig({
  base: './',
  plugins: [{ name: 'ohne-exr', enforce: 'pre', resolveId: id => /exrTextureLoader(\.js)?$/.test(id) ? stub : null }],
  build: {
    outDir: '../zotik',
    emptyOutDir: true,
    target: 'es2020',
    chunkSizeWarningLimit: 1200
  }
});
