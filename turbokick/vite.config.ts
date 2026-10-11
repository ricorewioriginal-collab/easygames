import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

// Basis-URL: './' funktioniert auf GitHub Pages in Unterordnern (z. B. /easygames/partyverse/app/).
// Überschreibbar über VITE_BASE (siehe .env.example).
export default defineConfig({
  root: 'client',
  base: process.env.VITE_BASE ?? './',
  resolve: {
    alias: {
      '@shared': fileURLToPath(new URL('./shared/src', import.meta.url)),
      '@client': fileURLToPath(new URL('./client/src', import.meta.url)),
    },
  },
  server: { port: 5173, host: true },
  build: {
    outDir: '../app',
    emptyOutDir: true,
    target: 'es2022',
    chunkSizeWarningLimit: 1500,
    sourcemap: false,
  },
});
