import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * Unit tests for pure admin helpers (no DOM). Packages resolve to SOURCE so the suite never depends
 * on a stale `dist/` build. Browser flows stay in the Playwright hermetic suite.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
      '@autolokate/api-client': path.resolve(rootDir, '../../packages/api-client/src/index.ts'),
      '@autolokate/auth': path.resolve(rootDir, '../../packages/auth/src/index.ts'),
    },
  },
});
