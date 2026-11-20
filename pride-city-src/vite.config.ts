import { defineConfig } from 'vitest/config';
import pkg from './package.json';

export default defineConfig({
  base: './',
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  build: {
    target: 'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 3000,
    rollupOptions: { output: { manualChunks: { babylon: ['@babylonjs/core'], loaders: ['@babylonjs/loaders'] } } },
  },
  server: { host: true },
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
});
