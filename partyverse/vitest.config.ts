import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@shared': fileURLToPath(new URL('./shared/src', import.meta.url)),
      '@client': fileURLToPath(new URL('./client/src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['shared/src/**/*.test.ts', 'server/src/**/*.test.ts', 'client/src/**/*.test.ts'],
    testTimeout: 30000,
  },
});
