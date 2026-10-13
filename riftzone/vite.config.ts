import { defineConfig } from 'vite';

// Wie PARTYVERSE: Quellcode in client/, gebautes Spiel in app/ (wird eingecheckt und von GitHub Pages ausgeliefert).
// Basis './' funktioniert in Unterordnern (z. B. /easygames/riftzone/app/).
export default defineConfig({
  root: 'client',
  base: process.env.VITE_BASE ?? './',
  publicDir: 'public',
  server: { port: 5173, host: true },
  preview: { port: 4173, host: true },
  worker: { format: 'es' },
  build: {
    outDir: '../app',
    emptyOutDir: true,
    target: 'es2020',
    chunkSizeWarningLimit: 1500,
    sourcemap: false,
  },
});
