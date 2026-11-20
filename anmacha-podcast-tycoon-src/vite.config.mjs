import { defineConfig } from 'vite';
// Ein ES-Modul für das Spiel (klassische Skripte laden es per import()): ../anmacha-podcast-tycoon/babylon/amc-babylon.js
export default defineConfig({
  build: {
    target: 'es2020',
    outDir: '../anmacha-podcast-tycoon/babylon',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'esbuild',
    modulePreload: false,
    chunkSizeWarningLimit: 4000,
    rollupOptions: {
      input: 'src/index.js',
      preserveEntrySignatures: 'strict',
      output: { format: 'es', entryFileNames: 'amc-babylon.js', inlineDynamicImports: true }
    }
  }
});
