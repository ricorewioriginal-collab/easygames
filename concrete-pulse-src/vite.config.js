import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
// Build nach ../concrete-pulse (eingecheckt, GitHub Pages liefert direkt aus dem Repo aus).
// EXR-Lader von Babylon lädt fflate aus dem Netz → leerer Baustein, damit das Spiel offline läuft.
const stub = fileURLToPath(new URL('./src/stubs/empty.js', import.meta.url));
export default defineConfig({
  base: './',
  plugins: [{ name: 'ohne-exr', enforce: 'pre', resolveId: id => /exrTextureLoader(\.js)?$/.test(id) ? stub : null }],
  build: { outDir: '../concrete-pulse', emptyOutDir: true, target: 'es2020', chunkSizeWarningLimit: 4000, assetsInlineLimit: 0 }
});
