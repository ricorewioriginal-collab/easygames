import { defineConfig } from 'vite';
// Ein ES-Modul für das Spiel (klassische Skripte laden es per import()): ../anmacha-podcast-tycoon/babylon/amc-babylon.js
// EXR-Texturen nutzt das Spiel nicht: Babylons Nachlade-Adresse für fflate (CDN) entfernen, damit die App offline vollständig bleibt
const noCdn = { name: 'amc-no-cdn', transform(code, id) { return id.includes('exrLoader.configuration') ? code.replace(/https:\/\/unpkg\.com\/fflate@[\d.]+/g, '') : null; } };
export default defineConfig({
  plugins: [noCdn],
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
