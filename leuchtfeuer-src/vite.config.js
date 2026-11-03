import { defineConfig } from 'vitest/config';

// Gebaut wird direkt nach ../leuchtfeuer (so wie die anderen Vite-Spiele im Repo). Gemeinsame Skripte (../figuren, ../gamepad.js …)
// bleiben normale <script>-Tags und werden zur Laufzeit von der easygames-Seite geladen.
export default defineConfig({
  base: './',
  build: {
    outDir: '../leuchtfeuer', emptyOutDir: true, target: 'es2020', sourcemap: false, chunkSizeWarningLimit: 900,
    rollupOptions: { output: { manualChunks: { three: ['three'] } } }
  },
  server: { host: true, fs: { allow: ['..'] } },
  test: { include: ['tests/**/*.test.js'], environment: 'node' }
});
