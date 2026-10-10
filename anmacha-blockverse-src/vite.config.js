import { defineConfig } from 'vite';

// Das Build-Ergebnis wird in ../anmacha-blockverse geschrieben und eingecheckt,
// damit GitHub Pages (Auslieferung direkt aus dem Repo) das Spiel ohne CI ausliefert.
export default defineConfig({
  base: './',
  build: {
    outDir: '../anmacha-blockverse',
    emptyOutDir: true,
    target: 'es2020',
    chunkSizeWarningLimit: 800
  }
});
