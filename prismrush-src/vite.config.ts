import { defineConfig } from 'vitest/config';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
  version: string;
};

// BASE_PATH erlaubt GitHub-Pages-Deployments unter /<repo>/. Standard "./" funktioniert überall.
const base = process.env.BASE_PATH ?? './';

export default defineConfig({
  base,
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: { three: ['three'] },
      },
    },
  },
  server: { host: true },
  preview: { host: true, port: 4173 },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
