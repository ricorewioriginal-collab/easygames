import { defineConfig } from 'vitest/config';

// Relativer Pfad: läuft unter /easygames/schatzfieber/, in den Apps (appassets) und lokal.
export default defineConfig({
  base: './',
  build: { target: 'es2020', sourcemap: false, chunkSizeWarningLimit: 900, rollupOptions: { output: { manualChunks: { three: ['three'] } } } },
  server: { host: true },
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
});
