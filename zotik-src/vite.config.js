import { defineConfig } from 'vite';

// Das Build-Ergebnis wird in ../zotik geschrieben und eingecheckt,
// damit GitHub Pages (Auslieferung direkt aus dem Repo) das Spiel ohne CI unter der bisherigen Adresse ausliefert.
// Dateien aus public/ (Service Worker, Manifest, Minispiele, Vorschaubild) landen unverändert daneben.
export default defineConfig({
  base: './',
  build: {
    outDir: '../zotik',
    emptyOutDir: true,
    target: 'es2020',
    chunkSizeWarningLimit: 1200
  }
});
